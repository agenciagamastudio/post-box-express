# EPIC B — Mídia do post (Supabase Storage)

**Status:** ✅ Concluído · **PRD:** [../PRD.md](../PRD.md)
**Executores:** @data-engineer (bucket/policies) + @dev (PostDialog) · **Gate:** @qa
**Handoff:** `@sm *draft → @po *validate → @data-engineer (bucket) + @dev (upload) → @qa *qa-gate → @devops *push`

## Objetivo

Permitir anexar uma imagem ao post e disponibilizá-la em URL pública (exigência da Graph API).

## Contexto

`posts.cover_url` já existia na tabela, mas o `PostDialog` não capturava imagem.

## Dependências

- Bucket de Storage no projeto Supabase; `posts.cover_url` na tabela.

## Riscos do Epic

- Bucket público expõe imagens por URL (aceitável para posts; não usar para dados sensíveis).
- Upload sem limite de tamanho/tipo pode encher storage (mitigação futura: validação/limite).

---

## Story B.1 — Anexar imagem ao post

**História:** Como social media, quero subir a imagem do post, para que a publicação tenha capa.
**Valor de negócio:** sem imagem pública a publicação no Instagram é impossível; viabiliza o core do produto.
**Estimativa:** M (≈3 pts).
**Escopo**

- **IN:** bucket + policies; input de imagem no PostDialog; gravação de `cover_url`; preview.
- **OUT:** múltiplas imagens/carrossel; recorte/edição; upload de vídeo (Reels).
  **Dependências:** Epic A (RLS) para escrita autenticada.
  **Riscos:** ver “Riscos do Epic”.

**Critérios de aceite (Given/When/Then)**

- **AC1:** Dado um usuário autenticado, Quando seleciona uma imagem no PostDialog, Então o arquivo sobe ao bucket `post-media` e um preview aparece.
- **AC2:** Dado o upload concluído, Quando salva o post, Então `cover_url` recebe a URL pública do arquivo.
- **AC3:** Dada a URL pública, Quando acessada sem autenticação, Então retorna a imagem (200).
- **AC4:** Dado um usuário não autenticado, Quando tenta subir, Então a policy nega.

**Definition of Done**

- [ ] AC1–AC4 verdes · [ ] preview visível · [ ] QA aprovado.

### Tasks

#### B.1.1 — Bucket `post-media` + policies · @data-engineer · ✅

- **Inputs:** projeto Supabase; nome do bucket.
- **Outputs:** bucket público + 4 policies em `storage.objects` (read público, insert/update/delete `authenticated`).
- **Passos:** 1) `INSERT INTO storage.buckets (...) public=true`; 2) criar policies por `bucket_id='post-media'`.
- **Pré:** acesso admin. **Pós:** uploads autenticados e leitura pública habilitados.

#### B.1.2 — Upload no PostDialog → `cover_url` + preview · @dev · ✅

- **Inputs:** `PostDialog.tsx`; cliente `supabase`.
- **Outputs:** input file + estado `coverUrl/uploading`; payload com `cover_url`.
- **Passos:** 1) `onPickImage` → `storage.from('post-media').upload`; 2) `getPublicUrl` → `setCoverUrl`; 3) incluir `cover_url` no insert/update; 4) preview + reset no sucesso.
- **Pré:** B.1.1. **Pós:** post salvo com capa pública.

#### B.1.3 — Teste de upload/leitura · @qa · ✅ (200/200)

- **Inputs:** token autenticado; arquivo PNG mínimo.
- **Outputs:** evidência 200 (upload) e 200 (leitura pública).
- **Passos:** 1) `POST /storage/v1/object/post-media/...`; 2) `GET /object/public/...`; 3) cleanup.
- **Pré:** B.1.1/B.1.2. **Pós:** fluxo de mídia validado.

## Arquivos

- `src/components/app/PostDialog.tsx` (upload + `cover_url` + preview)
- Bucket/policies via SQL (Management API)

## Verificação

Upload autenticado (200) + leitura `/object/public/post-media/...` (200); no app, criar post com imagem → `cover_url` preenchido.
