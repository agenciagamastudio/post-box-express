import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CurrentProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  roles: string[];
};

export function useCurrentProfile() {
  return useQuery<CurrentProfile | null>({
    queryKey: ["current-profile"],
    queryFn: async () => {
      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError || !user.user) return null;

      const userId = user.user.id;

      const [profileRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("id,full_name,avatar_url").eq("id", userId).single(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);

      if (profileRes.error) return null;

      return {
        id: profileRes.data.id,
        full_name: profileRes.data.full_name,
        avatar_url: profileRes.data.avatar_url,
        roles: rolesRes.data?.map((r) => r.role) ?? [],
      };
    },
  });
}
