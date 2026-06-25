# STORY-3.5 — /financeiro page — contas + relatórios

**Epic:** EPIC-03 Core Routes  
**Estimativa:** 1 point (1 hora)  
**Priority:** P2 (Supporting)  
**Status:** Draft

---

## Descrição

Implementar página /financeiro mostrando contas dos clientes (faturamento, pagamentos) e relatórios simples de receita/custos.

---

## Acceptance Criteria

```gherkin
Given Na página /financeiro
When A página carrega
Then Vejo lista de contas (clientes com valores)
And Vejo resumo de receita (total, este mês, este ano)
And Posso filtrar por cliente (global filter)
```

---

## Scope

### IN
- GET /api/financeiro/contas (contas de clientes)
- GET /api/financeiro/resumo (summary: receita, custos)
- /financeiro page com tabela + cards de summary
- Filtro por cliente
- Formatação de valores em moeda (R$)

### OUT
- Editar contas
- Adicionar pagamentos
- Gráficos detalhados
- Exportar relatórios

---

## Dependências
- STORY-3.3 (clientes deve estar feito)

---

## Critério de Done
- [ ] /financeiro route criada
- [ ] Contas carregando corretamente
- [ ] Resumo de receita exibindo
- [ ] Valores formatados em R$ (BR)
- [ ] Filtro cliente funciona
- [ ] Totais calculando corretamente
- [ ] Testado com dados reais
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/pages/financeiro.tsx` | Create financial page | [ ] |
| `src/components/FinancialTable.tsx` | Accounts table | [ ] |
| `src/components/FinancialSummary.tsx` | Summary cards | [ ] |
| `src/server/api/routes/financeiro.ts` | GET contas, resumo | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
