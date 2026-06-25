# 📱 Mobile Responsividade — Tier 1 (Crítico)

## Problemas Identificados

### 1. **app.tsx** (Dashboard)
- ❌ `grid gap-4 md:grid-cols-5` → quebra em mobile (5 colunas em 375px)
  - ✅ Solução: `grid-cols-1 sm:grid-cols-2 md:grid-cols-5`
- ❌ Próximos agendamentos: data ao lado em mobile (apertado)
  - ✅ Solução: Stack vertical em mobile, horizontal em `md:`

### 2. **integracoes.$clientId.tsx**
- ❌ Botões em linha horizontal (sem quebra)
  - ✅ Solução: `flex flex-col gap-2 md:flex-row`
- ❌ Dialog pode não caber na altura mobile
  - ✅ Solução: `max-h-[90vh] overflow-y-auto`

### 3. **monitoramento.tsx**
- ❌ Cards de insights lado a lado (responsive não funciona)
  - ✅ Solução: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- ❌ Periodo selector talvez muito grande
  - ✅ Solução: Labels ocultas em mobile, apenas ícones

### 4. **calendario.tsx**
- ❌ Tabela/grid pode ficar horizontal scroll infinito
  - ✅ Solução: Ocultar colunas não-críticas em mobile

### 5. **Componentes Globais**
- ❌ PageHeader (título + descrição) pode não caber
  - ✅ Solução: `text-2xl md:text-3xl` para título, `text-xs md:text-sm` para descrição

## Classes Tailwind Padrão

```css
/* Mobile-first breakpoints */
xs: (max-width: 639px)     /* default */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px

/* Touch targets */
Button: min-h-[48px] min-w-[48px]
Input: h-[44px]
Select: h-[44px]

/* Safe padding */
p-4 sm:p-6 md:p-8
```

## Implementação (2-3h)

### Step 1: Dashboard (30min)
- [ ] `grid-cols-1 sm:grid-cols-2 md:grid-cols-5` para cards
- [ ] Stack vertical para próximos agendamentos (mobile)
- [ ] Padding responsivo

### Step 2: Integrações (30min)
- [ ] Botões empilhados em mobile
- [ ] Dialog responsivo (max-h)
- [ ] Cards full-width

### Step 3: Monitoramento (45min)
- [ ] Cards grid responsivo
- [ ] Controls compactos em mobile
- [ ] Tabelas com scroll horizontal

### Step 4: Calendário (45min)
- [ ] Ocultar colunas não-críticas
- [ ] Horizontal scroll sensível
- [ ] Touch-friendly datas

### Step 5: QA & Test (30min)
- [ ] Testar em DevTools mobile (375px, 768px, 1024px)
- [ ] Verificar touch targets
- [ ] Testar em dispositivo real se possível

## Status: 🟡 READY TO IMPLEMENT
