# STORY-4.1 — Form creation — modal + inputs

**Epic:** EPIC-04 Post Creation & Approval  
**Estimativa:** 2 points (2 horas)  
**Priority:** P1 (Core feature)  
**Status:** Draft

---

## Descrição

Criar modal de criação de novo post com inputs: título, descrição, imagem, rede social, agendamento. Validação de form antes de enviar.

---

## Acceptance Criteria

```gherkin
Given Clico em "Novo Post" no kanban ou calendário
When Abre um modal com form
Then Vejo campos: título, descrição, imagem, rede, data/hora
When Deixo campo obrigatório vazio e clico Save
Then Vejo mensagem de erro em vermelho
When Preencho corretamente e clico Save
Then O post é criado e modal fecha
```

---

## Scope

### IN
- Modal component (CreatePostDialog)
- Form fields: title, description, image (upload), social_network, scheduled_at
- Validação: title (required, min 5 chars), description (required), image (required), social_network (required)
- Date/time picker para agendamento
- Submit button que chama API
- Loading state durante save

### OUT
- Enviar para aprovação (separate story)
- Auto-posting (separate story)
- Multiple image upload

---

## Dependências
- EPIC-01 completo (types)
- EPIC-02 (auth)

---

## Critério de Done
- [ ] Modal abrindo corretamente
- [ ] Todos os campos renderizando
- [ ] Validação funcionando (erros mostrando)
- [ ] Image upload funciona (preview)
- [ ] Date picker funciona
- [ ] Submit desabilitado se form inválido
- [ ] Modal fecha após save bem-sucedido
- [ ] Testado criação de post
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/components/CreatePostDialog.tsx` | Create modal | [ ] |
| `src/components/forms/PostForm.tsx` | Form component | [ ] |
| `src/hooks/usePostForm.ts` | Form logic hook | [ ] |
| `src/types/posts.ts` | Post type definitions | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
