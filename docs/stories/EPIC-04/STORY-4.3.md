# STORY-4.3 — Client review — aprovação UI

**Epic:** EPIC-04 Post Creation & Approval  
**Estimativa:** 1.5 points (1.5 horas)  
**Priority:** P1 (Core feature)  
**Status:** Draft

---

## Descrição

Implementar interface para cliente revisar e aprovar/rejeitar posts. Links do email levam para página com preview e botões de decisão.

---

## Acceptance Criteria

```gherkin
Given Cliente clica no link de aprovação do email
When Página carrega (sem precisar estar logado, link público)
Then Vejo preview do post (imagem, título, descrição)
And Vejo botões "Approve" e "Reject"
When Clico "Approve"
Then Post muda para status "approved"
And Vejo confirmação "Post Approved"
```

---

## Scope

### IN
- /approval/:token rota pública (sem auth)
- Validação de token JWT
- Preview do post (imagem grande, texto)
- Campos adicionais: data de agendamento, rede social
- Botões: Approve, Reject (com modal de motivo para rejeição)
- Status visual (pending, approved, rejected)
- Redirecionamento após ação

### OUT
- Comments/feedback durante review
- Revisions loop
- Multiple reviewers

---

## Dependências
- STORY-4.2 (envio de aprovação)

---

## Critério de Done
- [ ] Rota /approval/:token criada (public access)
- [ ] Token validado corretamente
- [ ] Preview do post renderizando
- [ ] Botões Approve/Reject funcionando
- [ ] Status atualizado corretamente no BD
- [ ] Confirmação visual após ação
- [ ] Email da agência notificado de aprovação/rejeição
- [ ] Testado com links de email reais
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/pages/approval/[token].tsx` | Create approval page | [ ] |
| `src/components/ApprovalPreview.tsx` | Preview component | [ ] |
| `src/server/api/routes/approvals.ts` | Approve/reject endpoints | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
