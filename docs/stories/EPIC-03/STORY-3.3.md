# STORY-3.3 — /clientes page — CRUD completo

**Epic:** EPIC-03 Core Routes  
**Estimativa:** 2 points (2 horas)  
**Priority:** P1 (Core feature)  
**Status:** Draft

---

## Descrição

Implementar página /clientes com CRUD completo: listar, criar, editar, deletar clientes. Integrado com global client filter.

---

## Acceptance Criteria

```gherkin
Given Na página /clientes
When Clico em "Novo Cliente" e preencho formulário
Then O cliente é criado no banco
And Aparece na lista
When Clico editar, salvo mudanças
Then O cliente é atualizado
When Clico deletar
Then Cliente é removido
```

---

## Scope

### IN
- GET /api/clients (listar com paginação)
- POST /api/clients (criar)
- PATCH /api/clients/{id} (editar)
- DELETE /api/clients/{id} (deletar)
- /clientes page com tabela
- Modal para criar/editar
- Validação de form (nome, email, etc)

### OUT
- Client permissions management
- Client teams/groups
- Advanced filtering

---

## Dependências
- EPIC-01 completo (types)
- EPIC-02 (auth)

---

## Critério de Done
- [ ] /clientes route criada
- [ ] Lista de clientes carregando
- [ ] Criar cliente funciona
- [ ] Editar cliente funciona
- [ ] Deletar cliente funciona
- [ ] Form validação funciona
- [ ] Campos obrigatórios: nome, email
- [ ] Testado CRUD completo
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/pages/clientes.tsx` | Create clients page | [ ] |
| `src/components/ClientsTable.tsx` | Clients list component | [ ] |
| `src/components/ClientDialog.tsx` | Create/Edit modal | [ ] |
| `src/server/api/routes/clients.ts` | CRUD endpoints | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
