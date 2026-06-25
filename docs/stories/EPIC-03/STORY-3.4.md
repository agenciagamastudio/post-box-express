# STORY-3.4 — /equipe page — listar + papéis + permissões

**Epic:** EPIC-03 Core Routes  
**Estimativa:** 1 point (1 hora)  
**Priority:** P2 (Supporting)  
**Status:** Draft

---

## Descrição

Implementar página /equipe listando usuários da agência, seus papéis (admin, editor, viewer) e permissões associadas. Visualização read-only inicialmente.

---

## Acceptance Criteria

```gherkin
Given Na página /equipe
When A página carrega
Then Vejo lista de todos os usuários
And Cada usuário mostra nome, email, papel, permissões
And Papéis são claramente identificados (cores, rótulos)
```

---

## Scope

### IN
- GET /api/team (listar usuários)
- GET /api/roles (listar papéis)
- /equipe page com tabela
- Exibição de papéis com cores/ícones
- Exibição de permissões (baseado no papel)
- Filtro por papel

### OUT
- Editar papéis (separate story)
- Adicionar/remover usuários
- Custom permissions

---

## Dependências
- EPIC-02 (auth, roles)

---

## Critério de Done
- [ ] /equipe route criada
- [ ] Usuários carregando da API
- [ ] Papéis exibindo corretamente
- [ ] Permissões listadas por papel
- [ ] Filtro de papel funciona
- [ ] UI clara e organizada
- [ ] Testado com dados reais
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/pages/equipe.tsx` | Create team page | [ ] |
| `src/components/TeamTable.tsx` | Team list component | [ ] |
| `src/server/api/routes/team.ts` | GET team + roles | [ ] |
| `src/types/team.ts` | Team type definitions | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
