# PRD — Publicação Automática no Instagram (GamaGit)

**Projeto:** GamaGit · **Status:** In Progress · **Owner:** Gama · **Data:** 2026-06-18
**Stack:** Vite + TanStack Router + React + Supabase (`ewerfpxniciegagnretb`) + backend Node/Express (`server/`)

> Documentação AIOS. Estrutura: **PRD → Epics → Stories → Tasks**.
> Índice de Epics: [A](epics/EPIC-A-multitenancy.md) · [B](epics/EPIC-B-midia-storage.md) ·
> [C](epics/EPIC-C-tela-automacao.md) · [D](epics/EPIC-D-setup-meta.md) ·
> [E](epics/EPIC-E-oauth-publicacao.md) · [F](epics/EPIC-F-robustez.md)
> Execução: [DEV-GUIDE](process/DEV-GUIDE.md) · Qualidade: [QA-CHECKLIST](process/QA-CHECKLIST.md) · Guia Meta: [META-SETUP](guides/META-SETUP.md)

## 1. Problema
Social medias/agências perdem tempo publicando manualmente em vários perfis. O GamaGit
organiza posts por cliente, mas não publica sozinho. É preciso **publicação automática
agendada no Instagram**, cada cliente conectado à sua própria conta.

## 2. Objetivo
Agendar um post (cliente + imagem + legenda + data) e o sistema publicar sozinho no
Instagram daquele cliente, com rastreio de sucesso/erro.

## 3. Personas
- **Gestor de social media / agência:** cria e agenda posts, conecta contas dos clientes.
- **Cliente (marca):** dono da conta IG conectada.

## 4. Requisitos
| ID | Requisito |
|----|-----------|
| FR1 | Conectar conta Instagram por cliente (OAuth Meta), token por cliente |
| FR2 | Post com imagem (capa) em URL pública |
| FR3 | Scheduler publica posts `agendado` com `scheduled_at <= now` |
| FR4 | Log de publicação (sucesso/erro, id externo) |
| FR5 | Isolamento multi-tenant (cada usuário/agência vê só seus dados) |
| NFR1 | Token de longa duração com refresh automático |
| NFR2 | Retries/backoff em erro transitório; erros visíveis |
| CON1 | Publicação real exige App Meta + IG Business; App Review para contas reais |

## 5. Critério de sucesso
Post agendado com imagem publicado automaticamente na conta de teste do Instagram,
visível no feed real, com `publish_log.success` + `external_id`.

## 6. Escopo dos Epics
| Epic | Tema | Status |
|------|------|--------|
| A | Multi-tenancy (RLS) | ✅ Concluído |
| B | Mídia do post (Storage) | ✅ Concluído |
| C | Tela de Automação | ✅ Concluído |
| D | Setup Meta (ação do usuário) | ⛔ Bloqueado (externo) |
| E | OAuth + publicação real | 🟡 Código pronto (ativa após D) |
| F | Robustez | 🟡 Código pronto (verifica após D) |

## 7. Agentes & Workflow (handoff AIOS)
Owner do PRD: **@pm (Morgan)**. Fluxo padrão por story:
```
@sm *draft  →  @po *validate-story-draft  →  @dev *develop  →  @qa *qa-gate  →  @devops *push
```
Responsável por Epic (executor principal):
| Epic | Executor | Apoio |
|------|----------|-------|
| A — Multi-tenancy/RLS | **@data-engineer (Dara)** | @architect (decisão), @qa (gate), @devops (migração) |
| B — Mídia/Storage | **@dev (Dex)** (PostDialog) + **@data-engineer** (bucket/policies) | @qa |
| C — Tela Automação | **@dev (Dex)** | @ux-design-expert (UI), @qa |
| D — Setup Meta | **Usuário** (conta Meta) | **@devops (Gage)** (preenche `.env`/segredos) |
| E — OAuth + publicação | **@dev (Dex)** | @architect (integração), @devops (secrets/deploy), @qa |
| F — Robustez | **@dev (Dex)** | @qa |
Validação de stories: **@po (Pax)** (checklist 10 pontos). Criação de stories: **@sm (River)**.
Detalhe do handoff em [DEV-GUIDE](process/DEV-GUIDE.md) e gate em [QA-CHECKLIST](process/QA-CHECKLIST.md).

## 8. Bloqueador crítico
**Epic D** depende de criar um App no Meta for Developers e converter/vincular a conta
Instagram — ações na conta Meta do usuário, via navegador com 2FA. O assistente **não**
pode executar isso. Tudo que não depende da Meta (A, B, C e o código de E/F) é entregue;
E/F só são **ativados/verificados** após D. Guia: [guides/META-SETUP.md](guides/META-SETUP.md).
