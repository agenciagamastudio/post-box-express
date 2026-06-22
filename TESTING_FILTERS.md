# Testing Calendar Filters — Manual & Automated

**Data:** 2026-06-21  
**URL:** http://localhost:8080/calendario  
**Status:** ✅ Ready for testing

---

## 🧪 Teste Automatizado

### Rodar testes

```bash
cd PLATAFORMA
npm test -- filters.test.ts
```

### Testes cobertos

✅ **Hook useCalendarFilters**
- Filtros vazios por padrão
- Persistência em localStorage
- Modo único (1 cliente)
- Modo múltiplo (vários clientes)
- Toggle de redes
- Clear all

✅ **Filter Application Logic**
- Filtro por cliente único
- Filtro por múltiplos clientes
- Filtro por rede social
- Filtro combinado (cliente AND rede)
- Sem filtro = mostrar todos

✅ **UI State**
- `hasActiveFilters` boolean correto

---

## 🧑‍💻 Teste Manual

### Setup

1. Abrir navegador: http://localhost:8080/calendario
2. Aguardar carregar (status: "Calendário" visível)
3. Abrir DevTools: F12 → Console
4. Verificar localStorage: `localStorage.getItem('gama-calendar-filters')`

---

## ✅ Checklist de testes

### 1. Estado inicial
- [ ] Página carrega sem erros
- [ ] Sidebar de filtros visível (direita)
- [ ] QuickFilters NÃO visível (nenhum filtro ativo)
- [ ] Todos os posts aparecem (0 filtros)
- [ ] localStorage vazio ou com filtros vazios

**Comando console:**
```javascript
localStorage.getItem('gama-calendar-filters') 
// Esperado: {"clients":[],"networks":[],"onlyThisClient":false} ou null
```

---

### 2. Filtro por rede social

**Ação:**
1. Sidebar → Clique em "📷 Instagram"

**Verificar:**
- [ ] Instagram fica com fundo diferente (selected state)
- [ ] Posts NÃO Instagram desaparecem
- [ ] QuickFilters NA top bar: "Filtros ativos: 📷 Instagram"
- [ ] localStorage salva: `networks: ["instagram"]`

**Comando console:**
```javascript
JSON.parse(localStorage.getItem('gama-calendar-filters')).networks
// Esperado: ["instagram"]
```

**Ação 2:**
- [ ] Adicionar TikTok (clique em "🎬 TikTok")
- [ ] Agora aparecem APENAS posts Instagram E TikTok
- [ ] Top bar mostra: "📷 Instagram" + "🎬 TikTok"

---

### 3. Modo único: apenas 1 cliente

**Setup:** Ter ≥ 2 clientes ativos na BD

**Ação:**
1. Limpar filtros (se houver algum)
2. Sidebar → Clientes → Selecionar "Cliente A" com radio button

**Verificar:**
- [ ] Radio button de "Cliente A" fica selecionado
- [ ] Aparecem APENAS posts de "Cliente A"
- [ ] QuickFilters top bar: "[Cliente A ×]"
- [ ] localStorage: `clients: ["id-a"], onlyThisClient: true`
- [ ] Nenhuma outra cor de cliente aparece no calendário

**Comando console:**
```javascript
JSON.parse(localStorage.getItem('gama-calendar-filters'))
// Esperado: {clients: ["uuid-a"], networks: [], onlyThisClient: true}
```

**Ação 2:** Mudar para outro cliente
- [ ] Clique em "Cliente B" (radio)
- [ ] Apenas posts de Cliente B aparecem
- [ ] Radio muda automaticamente
- [ ] localStorage atualiza: `clients: ["id-b"]`

---

### 4. Modo múltiplo: vários clientes

**Ação:**
1. Sidebar → Clientes → Desselecionar todos ("Mostrar todos" selecionado)
2. Scroll down até "Adicional: Múltiplos clientes"
3. Selecionar "Cliente A" (checkbox)
4. Selecionar "Cliente B" (checkbox)

**Verificar:**
- [ ] Checkboxes de A e B ficam marcados
- [ ] Top bar exibe: "[Cliente A ×]" "[Cliente B ×]"
- [ ] Aparecem posts de APENAS A e B
- [ ] localStorage: `clients: ["id-a", "id-b"], onlyThisClient: false`
- [ ] Badge com cores dos clientes (ver cor no BD)

**Ação 2:** Remover um cliente
- [ ] Clique no "×" de Cliente A no top bar
- [ ] Cliente A desaparece do filtro
- [ ] Checkbox de A fica desmarcado
- [ ] Apenas posts de B aparecem

**Comando console:**
```javascript
JSON.parse(localStorage.getItem('gama-calendar-filters')).clients
// Esperado: ["id-b"]
```

---

### 5. Filtrar por rede + cliente (AND lógico)

**Setup:** 
- Ter posts com diferentes combos de rede/cliente

**Ação:**
1. Sidebar → Redes: Selecionar "Instagram"
2. Sidebar → Modo múltiplo: Selecionar "Cliente A" + "Cliente B"

**Verificar:**
- [ ] Aparecem APENAS posts que são:
  - rede = Instagram AND (client = A OR client = B)
- [ ] QuickFilters: "📷 Instagram" "[Cliente A ×]" "[Cliente B ×]"
- [ ] localStorage: ambos clients e networks preenchidos

**Exemplo de filtro correto:**
```
Posts visíveis:
- Post 1: Instagram + Cliente A ✓
- Post 2: Instagram + Cliente B ✓
- Post 3: TikTok + Cliente A ✗ (rede errada)
- Post 4: Instagram + Cliente C ✗ (cliente errado)
```

---

### 6. Botão "Limpar tudo"

**Ação:**
1. Ter filtros ativos (ex: Instagram + Cliente A)
2. Sidebar → Clique em "Limpar tudo"

**Verificar:**
- [ ] Todos os filtros desaparecem
- [ ] Calendário volta a mostrar todos os posts
- [ ] QuickFilters desaparece (top bar)
- [ ] localStorage volta vazio: `{clients: [], networks: [], onlyThisClient: false}`
- [ ] Rádios/checkboxes volta ao estado "Mostrar todos"

---

### 7. Persistência (reload)

**Ação:**
1. Aplicar filtros: Instagram + Cliente A
2. Verificar no console: `localStorage.getItem('gama-calendar-filters')`
3. F5 (reload da página)
4. Aguardar carregar

**Verificar:**
- [ ] Filtros MANTÊM após reload
- [ ] Calendário continua mostrando apenas Instagram + Cliente A
- [ ] QuickFilters e sidebar continuam com filtros
- [ ] localStorage ainda tem os valores

**Esperado:**
```javascript
// Antes do reload:
{"clients":["id-a"],"networks":["instagram"],"onlyThisClient":false}

// Depois do reload (deve ser idêntico):
{"clients":["id-a"],"networks":["instagram"],"onlyThisClient":false}
```

---

### 8. Switch entre Month/Week

**Setup:** Ter filtros ativos (ex: Cliente A)

**Ação:**
1. Vista atual: Mês (com filtro)
2. Clique em aba "Semana"
3. Verificar calendário de semana

**Verificar:**
- [ ] Filtros PERSISTEM ao mudar de aba
- [ ] QuickFilters continua mostrando filtro
- [ ] Semana mostra APENAS posts de Cliente A
- [ ] Voltar para "Mês" → filtro persiste

**Esperado:**
- Mês com filtro → Semana com mesmo filtro → Mês com filtro (tudo igual)

---

### 9. Edge cases

#### 9a. Sem clientes na BD
- [ ] Sidebar carrega sem erro
- [ ] Seção "Clientes" vazia mas não quebra UI

#### 9b. Post sem scheduled_at
- [ ] Post não quebra a UI
- [ ] Filtros funcionam normalmente
- [ ] Post não aparece em nenhuma hora (WeekView)

#### 9c. Cliente sem cor
- [ ] Cliente mostra cor padrão (roxo #A78BFA)
- [ ] Filtro funciona normal

#### 9d. localStorage corrompido
- [ ] Limpar localStorage manualmente: `localStorage.clear()`
- [ ] Reload página
- [ ] [ ] Página carrega com filtros vazios (sem erro)
- [ ] [ ] localStorage volta ao estado vazio correto

---

## 📊 Expected behavior summary

| Ação | Esperado |
|------|----------|
| Abrir /calendario | Sem filtros, todos posts visíveis |
| Clicar rede | Apenas posts dessa rede |
| Clicar cliente (radio) | Apenas posts de 1 cliente |
| Clicar múltiplos (checkbox) | Posts de cliente A OR B OR C |
| Rede + Cliente | Posts onde rede=X AND (cliente=A OR B) |
| Clicar × no badge | Remove 1 filtro, calendário atualiza |
| Limpar tudo | Todos filtros off, posts voltam |
| F5 (reload) | Filtros persistem em localStorage |
| Month → Week → Month | Filtros não mudam entre abas |

---

## 🐛 Bugs conhecidos (report aqui se encontrar)

- [ ] Nenhum conhecido ainda (esperamos bugs de edge case)

---

## ✅ Sign-off

- [ ] Teste automatizado: PASS
- [ ] Teste manual completo: PASS
- [ ] localStorage funciona
- [ ] UI intuitiva
- [ ] Sem erros no console
- [ ] Pronto para produção

**Data de aprovação:** ___________  
**Quem testou:** ___________  
**Notas:** 

---

## 🔧 Debug commands (console)

```javascript
// Ver filtros atuais
JSON.parse(localStorage.getItem('gama-calendar-filters'))

// Limpar localStorage
localStorage.clear()

// Setar filtro manualmente (teste)
localStorage.setItem('gama-calendar-filters', JSON.stringify({
  clients: ["client-id-1"],
  networks: ["instagram"],
  onlyThisClient: false
}))

// Ver posts no Supabase (quando implementado)
// db.select('posts').filter('client_id', 'eq', 'id-a').then(console.log)
```

---

**Boa sorte com os testes! 🧪**
