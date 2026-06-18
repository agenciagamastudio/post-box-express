
-- ========== ENUMS ==========
CREATE TYPE public.app_role AS ENUM ('owner','admin','designer','social','financeiro');
CREATE TYPE public.post_status AS ENUM ('rascunho','aprovacao','ajuste','aprovado','agendado','publicado');
CREATE TYPE public.post_format AS ENUM ('feed','carrossel','reels','story','video');
CREATE TYPE public.post_network AS ENUM ('instagram','tiktok','x','outras');
CREATE TYPE public.task_status AS ENUM ('a_fazer','fazendo','feito');
CREATE TYPE public.finance_type AS ENUM ('receber','pagar');

-- ========== TIMESTAMP TRIGGER ==========
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ========== PROFILES ==========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ========== USER ROLES ==========
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "user_roles read own or admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'owner'));
CREATE POLICY "user_roles manage by owner/admin" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'));

-- Trigger after user_roles exists
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== CLIENTS ==========
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  handle TEXT,
  color TEXT NOT NULL DEFAULT '#A78BFA',
  segment TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ========== CLIENT MEMBERS ==========
CREATE TABLE public.client_members (
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (client_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.client_members TO authenticated;
GRANT ALL ON public.client_members TO service_role;
ALTER TABLE public.client_members ENABLE ROW LEVEL SECURITY;

-- helper: can user access a client?
CREATE OR REPLACE FUNCTION public.can_access_client(_client_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.clients c
    WHERE c.id = _client_id AND (
      c.owner_id = _user_id
      OR EXISTS(SELECT 1 FROM public.client_members m WHERE m.client_id=c.id AND m.user_id=_user_id)
      OR public.has_role(_user_id,'owner') OR public.has_role(_user_id,'admin')
    )
  );
$$;

CREATE POLICY "clients select accessible" ON public.clients FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS(SELECT 1 FROM public.client_members m WHERE m.client_id = clients.id AND m.user_id = auth.uid())
    OR public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin')
  );
CREATE POLICY "clients insert self owner" ON public.clients FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "clients update by owner or admin" ON public.clients FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "clients delete by owner or admin" ON public.clients FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "client_members select if accessible" ON public.client_members FOR SELECT TO authenticated
  USING (public.can_access_client(client_id, auth.uid()));
CREATE POLICY "client_members manage if owner/admin" ON public.client_members FOR ALL TO authenticated
  USING (
    EXISTS(SELECT 1 FROM public.clients c WHERE c.id = client_id AND c.owner_id = auth.uid())
    OR public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin')
  )
  WITH CHECK (
    EXISTS(SELECT 1 FROM public.clients c WHERE c.id = client_id AND c.owner_id = auth.uid())
    OR public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin')
  );

-- ========== POSTS ==========
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  caption TEXT,
  format public.post_format NOT NULL DEFAULT 'feed',
  network public.post_network NOT NULL DEFAULT 'instagram',
  status public.post_status NOT NULL DEFAULT 'rascunho',
  cover_url TEXT,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX posts_client_idx ON public.posts(client_id);
CREATE INDEX posts_scheduled_idx ON public.posts(scheduled_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "posts access by client" ON public.posts FOR ALL TO authenticated
  USING (public.can_access_client(client_id, auth.uid()))
  WITH CHECK (public.can_access_client(client_id, auth.uid()));

-- ========== POST MEDIA ==========
CREATE TABLE public.post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  ord INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_media TO authenticated;
GRANT ALL ON public.post_media TO service_role;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_media access" ON public.post_media FOR ALL TO authenticated
  USING (EXISTS(SELECT 1 FROM public.posts p WHERE p.id = post_id AND public.can_access_client(p.client_id, auth.uid())))
  WITH CHECK (EXISTS(SELECT 1 FROM public.posts p WHERE p.id = post_id AND public.can_access_client(p.client_id, auth.uid())));

-- ========== POST COMMENTS ==========
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_comments TO authenticated;
GRANT ALL ON public.post_comments TO service_role;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments access by post" ON public.post_comments FOR ALL TO authenticated
  USING (EXISTS(SELECT 1 FROM public.posts p WHERE p.id = post_id AND public.can_access_client(p.client_id, auth.uid())))
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS(SELECT 1 FROM public.posts p WHERE p.id = post_id AND public.can_access_client(p.client_id, auth.uid()))
  );

-- ========== TASKS ==========
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'a_fazer',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "tasks access" ON public.tasks FOR ALL TO authenticated
  USING (
    assignee_id = auth.uid()
    OR created_by = auth.uid()
    OR (client_id IS NOT NULL AND public.can_access_client(client_id, auth.uid()))
    OR public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin')
  )
  WITH CHECK (
    created_by = auth.uid()
    OR (client_id IS NOT NULL AND public.can_access_client(client_id, auth.uid()))
    OR public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin')
  );

-- ========== FINANCE ==========
CREATE TABLE public.finance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  kind public.finance_type NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  due_at DATE,
  paid_at DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_entries TO authenticated;
GRANT ALL ON public.finance_entries TO service_role;
ALTER TABLE public.finance_entries ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_finance_updated BEFORE UPDATE ON public.finance_entries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "finance access by client" ON public.finance_entries FOR ALL TO authenticated
  USING (
    public.can_access_client(client_id, auth.uid())
    AND (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'financeiro')
         OR EXISTS(SELECT 1 FROM public.clients c WHERE c.id = client_id AND c.owner_id = auth.uid()))
  )
  WITH CHECK (
    public.can_access_client(client_id, auth.uid())
    AND (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'financeiro')
         OR EXISTS(SELECT 1 FROM public.clients c WHERE c.id = client_id AND c.owner_id = auth.uid()))
  );

-- ========== STORAGE POLICIES (bucket post-media) ==========
-- bucket created via tool; add policies
CREATE POLICY "post-media read all" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'post-media');
CREATE POLICY "post-media auth write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-media');
CREATE POLICY "post-media auth update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'post-media');
CREATE POLICY "post-media auth delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'post-media' AND owner = auth.uid());
