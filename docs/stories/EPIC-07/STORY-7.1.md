# STORY-7.1 — Lighthouse > 80

**Epic:** EPIC-07 Performance & A11y  
**Estimativa:** 1 point (1 hora)  
**Priority:** P1 (Quality)  
**Status:** Draft

---

## Descrição

Otimizar performance da aplicação: code splitting, lazy loading, caching, image optimization. Target Lighthouse score > 80.

---

## Acceptance Criteria

```gherkin
Given Rodo Lighthouse audit na aplicação
When Verifica Performance, Accessibility, Best Practices
Then Score >= 80 em todos os tópicos
And First Contentful Paint < 1.5s
And Largest Contentful Paint < 2.5s
```

---

## Scope

### IN
- Code splitting (Next.js dynamic imports)
- Lazy loading de imagens (next/image com lazy)
- Caching headers (cache-control)
- Compression (gzip/brotli)
- Minificação (já automática)
- Bundle analysis (webpack-bundle-analyzer)
- Remove unused dependencies

### OUT
- Advanced optimization (service workers, pre-rendering)
- Database query optimization

---

## Dependências
- Todos os features anteriores implementados

---

## Critério de Done
- [ ] Lighthouse score >= 80
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1 (Visual stability)
- [ ] TTI < 3s (Time to Interactive)
- [ ] Unused code removed
- [ ] Bundle size verificado
- [ ] Lighthouse audit saved
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `next.config.ts` | Add optimization | [ ] |
| `src/pages/index.tsx` | Code splitting | [ ] |
| `public/images/` | Image optimization | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
