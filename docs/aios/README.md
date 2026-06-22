# Documentação AIOS — GamaGit (Publicação Instagram)

Documentação no fluxo **PRD → Epics → Stories → Tasks**, com agentes e handoff de execução.

## Estrutura

```
docs/aios/
├── README.md              # este índice
├── PRD.md                 # visão, requisitos, agentes, workflow
├── epics/                 # 1 documento por Epic (story + tasks AIOS completas)
│   ├── EPIC-A-multitenancy.md
│   ├── EPIC-B-midia-storage.md
│   ├── EPIC-C-tela-automacao.md
│   ├── EPIC-D-setup-meta.md
│   ├── EPIC-E-oauth-publicacao.md
│   └── EPIC-F-robustez.md
├── process/               # como executar e validar
│   ├── DEV-GUIDE.md        # tracker: executor marca cada task; ordem e DoD
│   └── QA-CHECKLIST.md     # gate que @qa roda a cada task (aprovar/corrigir)
└── guides/
    └── META-SETUP.md       # passo-a-passo Meta for Developers (Epic D, usuário)
```

## Por onde começar

1. **[PRD.md](PRD.md)** — entender objetivo, requisitos e quem faz o quê.
2. **[process/DEV-GUIDE.md](process/DEV-GUIDE.md)** — pegar a próxima task e o fluxo de handoff.
3. **[process/QA-CHECKLIST.md](process/QA-CHECKLIST.md)** — o gate que aprova/devolve cada task.

## Epics

| Epic                                  | Tema                 | Status           |
| ------------------------------------- | -------------------- | ---------------- |
| [A](epics/EPIC-A-multitenancy.md)     | Multi-tenancy (RLS)  | ✅               |
| [B](epics/EPIC-B-midia-storage.md)    | Mídia/Storage        | ✅               |
| [C](epics/EPIC-C-tela-automacao.md)   | Tela de Automação    | ✅               |
| [D](epics/EPIC-D-setup-meta.md)       | Setup Meta (usuário) | ⛔               |
| [E](epics/EPIC-E-oauth-publicacao.md) | OAuth + publicação   | 🟡 código pronto |
| [F](epics/EPIC-F-robustez.md)         | Robustez             | 🟡 código pronto |

## Fluxo de execução (handoff)

```
@sm *draft → @po *validate-story-draft → [executor: @dev | @data-engineer] *develop
           → @qa *qa-gate → @devops *push
```

Bloqueador atual: **Epic D** (App Meta) — ação do usuário. Guia: [guides/META-SETUP.md](guides/META-SETUP.md).
