# STORY-7.3 — Sidebar collapse + persist state

**Epic:** EPIC-07 Performance & A11y  
**Estimativa:** 1.5 points (1.5 horas)  
**Priority:** P2 (UX Enhancement)  
**Status:** Draft

---

## Descrição

Implementar collapse/expand de sidebar com persistência em localStorage. Sidebar descolada melhor em telas pequenas.

---

## Acceptance Criteria

```gherkin
Given Na página com sidebar
When Clico no botão collapse (ícone de seta)
Then Sidebar colapsa e reaparece ícones apenas
When Recarrego a página
Then Sidebar mantém estado colapsado/expandido
When Estou em mobile (< 768px)
Then Sidebar é overlay (hamburger menu)
```

---

## Scope

### IN
- Toggle button no sidebar (ícone hamburger ou chevron)
- Collapse animation (smooth transition)
- localStorage persistência (key: 'sidebar-collapsed')
- Mobile breakpoint handling (< 768px = overlay)
- Content area responsive (margin adjust)
- Keyboard shortcut (Alt+S ou Ctrl+B)

### OUT
- Multi-layout support (different sidebars)
- Sidebar customization

---

## Dependências
- Sidebar component já existe

---

## Critério de Done
- [ ] Toggle button funciona
- [ ] Collapse/expand animation smooth
- [ ] localStorage persistence works
- [ ] State persists após reload
- [ ] Mobile layout overlay works
- [ ] Content area adjusts on desktop
- [ ] Keyboard shortcut works
- [ ] Testado: desktop + mobile
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/components/Sidebar.tsx` | Add collapse logic | [ ] |
| `src/hooks/useSidebarState.ts` | State management hook | [ ] |
| `src/styles/sidebar.css` | Collapse animations | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
