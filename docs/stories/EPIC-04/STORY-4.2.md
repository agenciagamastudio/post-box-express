# STORY-4.2 — Send for approval — email notificação

**Epic:** EPIC-04 Post Creation & Approval  
**Estimativa:** 1 point (1 hora)  
**Priority:** P1 (Core feature)  
**Status:** Draft

---

## Descrição

Quando um post é criado, enviar email ao cliente para aprovação. Email contém preview do post, link direto para revisar, botões de Approve/Reject.

---

## Acceptance Criteria

```gherkin
Given Um post é criado e enviado para aprovação
When Sistema processa o pedido
Then Email é enviado ao cliente
And Email contém preview do post (imagem, título, descrição)
And Email tem links para Approve / Reject com tokens
```

---

## Scope

### IN
- POST /api/posts/{id}/send-approval (atualizar status para "awaiting_approval")
- Email template (HTML) com preview do post
- Envio de email (usar provider existente)
- Links dinâmicos (approve/reject) com tokens JWT
- Registro na tabela de approvals

### OUT
- SMS notification
- Slack notification
- Reminder emails

---

## Dependências
- STORY-4.1 (form criação deve estar feito)

---

## Critério de Done
- [ ] Endpoint POST /api/posts/{id}/send-approval implementado
- [ ] Status do post mudado para "awaiting_approval"
- [ ] Email sendo enviado corretamente
- [ ] Email template HTML bonito e funcional
- [ ] Links approve/reject com tokens funcionando
- [ ] Testado: criar post → enviar aprovação → receber email
- [ ] Email enviado para cliente correto
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/server/api/routes/posts.ts` | Add send-approval | [ ] |
| `src/server/emails/approval.html` | Email template | [ ] |
| `src/server/lib/email.ts` | Email sender | [ ] |
| `src/server/db/migrations/add_approvals.sql` | DB schema | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
