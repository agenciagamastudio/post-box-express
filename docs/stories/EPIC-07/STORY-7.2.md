# STORY-7.2 — WCAG AA compliance

**Epic:** EPIC-07 Performance & A11y  
**Estimativa:** 1.5 points (1.5 horas)  
**Priority:** P1 (Quality)  
**Status:** Draft

---

## Descrição

Garantir acessibilidade em conformidade com WCAG AA: contraste, navegação por teclado, labels, ARIA, semântica HTML.

---

## Acceptance Criteria

```gherkin
Given Rodo teste de acessibilidade (axe, WAVE)
When Verifica contraste, navegação, labels
Then 0 erros de acessibilidade
And Todos elementos navegáveis por teclado (Tab)
And Imagens têm alt text
And Forms têm labels associadas
```

---

## Scope

### IN
- Contrast ratio >= 4.5:1 para texto (WCAG AA)
- Keyboard navigation (Tab, Enter, Escape)
- ARIA labels (aria-label, aria-describedby)
- Semantic HTML (button vs div, nav, section, etc)
- Focus indicators visíveis
- Form labels explícitas
- Error messages associadas
- Alt text em imagens

### OUT
- WCAG AAA (level 3) - higher standard
- Localization for assistive tech

---

## Dependências
- Todos os features anteriores

---

## Critério de Done
- [ ] Contrast checked (Lighthouse, axe)
- [ ] Tab order correct
- [ ] All form inputs have labels
- [ ] Images have alt text
- [ ] ARIA attributes where needed
- [ ] Focus indicators visible
- [ ] Keyboard shortcut documented
- [ ] axe scan: 0 violations
- [ ] WAVE scan: 0 errors
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/components/**/*.tsx` | Add ARIA, labels | [ ] |
| `src/styles/globals.css` | Focus indicators | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
