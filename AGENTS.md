# Project Agents Guide

## Project Overview
**SuiteProxy** is a Bun-based Nuxt 4 application that acts as an AI Studio (Google MakerSuite) proxy for Gemini API access. Primary concerns include request interception/forwarding, auth token management, BotGuard token generation, response streaming, rate limiting, error recovery, and session management.

## Tech Stack
- **Runtime**: Bun 1.3.8+ (always prefer over npm/node)
- **Language**: TypeScript strict mode
- **Frontend**: Nuxt 4, Vue 3 Composition API, Tailwind CSS, PrimeVue
- **Backend**: Nitro/H3, server routes in `server/api/`
- **Database**: SQLite via `bun:sqlite` (account management)
- **Package Manager**: `bun` (`bun add`, `bun run`, `bunx`)
- **Testing**: Vitest with @nuxt/test-utils
- **Linting**: ESLint with @nuxt/eslint

## Agents
Three agents, focused on what matters for a proxy project.
Agent configs live in `.opencode/infra/opencode-dev/agents/` and are copied to `.opencode/agents/` by the container entrypoint on startup.

| Agent | Role | Source |
|-------|------|--------|
| **build** (primary) | Full-stack dev — writes code, runs commands | `agents/build.md` |
| **reverser** | Browser automation + reverse engineering via CDP | `agents/reverser.md` |
| **reviewer** | Code review — read-only, no file changes | `agents/reviewer.md` |

## Build & Dev Commands
```bash
# Development
bun install                    # Install dependencies
bun run dev                    # Start dev server (localhost:3000)
bun run build                  # Production build
bun run preview                # Preview production build

# Quality Assurance
bun run typecheck              # TypeScript type checking
bun run test                   # Run all Vitest tests
bunx vitest run --reporter=verbose  # Detailed test output

# Linting
bunx eslint .                  # Lint all files
bunx eslint --fix .            # Auto-fix linting issues
```

## Service URLs

| Service | From Host | From Container | Purpose |
|---------|-----------|----------------|---------|
| OpenCode Web UI | `http://localhost:4096` | N/A | AI coding agent interface |
| Nuxt dev server | `http://localhost:3000` | `http://localhost:3000` | The app (runs inside container) |
| Edge Browser GUI | `http://localhost:3100` | N/A | Visual browser debugging |
| Edge Browser CDP | `http://localhost:9222` | `http://browser:9223` | Playwright automation |
| OpenMemory API | `http://localhost:8787` | `http://openmemory:8080` | Memory API + Dashboard |
| LM Studio | `http://127.0.0.1:1234/v1` | `http://host.docker.internal:1234/v1` | Embeddings & LLM for CIE |

**Important**: Nuxt runs inside the `opencode-dev` container and listens on `0.0.0.0`.
Start with: `bun --bun run dev --host 0.0.0.0`

## Infrastructure & Services
```bash
# First time: create .opencode/infra/.env from .env.example with your API keys
# Start everything:
docker compose -f .opencode/infra/docker-compose.yml --env-file .opencode/infra/.env up -d --build

# Other commands:
docker compose -f .opencode/infra/docker-compose.yml down       # Stop services
docker compose -f .opencode/infra/docker-compose.yml logs -f    # View logs

# Services:
# - opencode-dev — dev container with OpenCode, Bun, CIE, all MCP tools
#     Web UI: http://localhost:4096 | Nuxt: http://localhost:3000
# - Microsoft Edge (linuxserver/msedge) — real desktop browser, better stealth
#     GUI: http://localhost:3100 | CDP: localhost:9222
# - OpenMemory — persistent memory engine with built-in dashboard
#     API: http://localhost:8787/api/memory/* | Dashboard: http://localhost:8787/
```

## Memory Protocol
**MANDATORY**: Before starting any significant task:
1. `memory_search` with relevant keywords to find prior decisions/context
2. After making decisions, `memory_save` with appropriate tags:
   - `architecture`, `decision`, `bug`, `preference`, `pattern`, `todo`
   - `proxy`, `api-discovery`, `auth-flow`, `reverse-engineering`, `botguard`

**When to use memory:**
- Before starting work: search for prior context
- After resolving a bug: save what caused it and the fix
- After architectural decisions: save the reasoning
- After reverse-engineering discoveries: save findings
- After user expresses a preference: save it

**Dashboard**: Browse and manage all memories at http://localhost:8787

## Code Style & Conventions

### File Organization
```
server/api/                    # API routes (defineEventHandler)
server/lib/                    # Server utilities and clients
server/lib/botguard/           # BotGuard token generation (Puppeteer)
server/types/                  # Server-specific types
server/utils/                  # Server helper functions
shared/types.ts                # Shared types between client/server
app/pages/                     # Nuxt pages (file-based routing)
app/components/                # Vue components
composables/                   # Vue composables (use[Name].ts)
aistuido-docs/                 # Reference docs for reverse engineering
.opencode/infra/               # Docker infrastructure (compose, Dockerfiles)
.opencode/infra/opencode-dev/  # Dev container config (agents, rules, Dockerfile)
.opencode/scripts/             # MCP bridge scripts
```

### TypeScript Guidelines
- **Strict Mode**: Always enabled, no `any` types allowed
- **No Ignores**: Avoid `// @ts-ignore` without detailed explanation
- **Explicit Returns**: Prefer explicit return types for functions
- **Imports**: Use `import type` for type-only imports
- **Shared Types**: Place in `shared/types.ts` or `server/types/[domain].ts`

### Vue 3 Standards
```vue
<script setup lang="ts">
// Composition API with <script setup> ONLY
import type { AccountRecord } from '~/shared/types'
const { data, refresh } = await useFetch<AccountRecord[]>('/api/accounts')
const activeAccounts = computed(() =>
  data.value?.filter(acc => !isLimited(acc.limited_until))
)
</script>
```

### Server Routes & API Design
```ts
export default defineEventHandler(async (event) => {
  const body = await readBody<OpenAIChatRequest>(event)
  if (!body.model) {
    throw createError({ statusCode: 400, statusMessage: "Model required" })
  }
  return { success: true, data: response }
})
```

### Code Patterns
- `const` over `let`, never `var`
- `async/await` over `.then()` chains
- Destructuring, template literals, early returns
- Always handle errors, use `createError` in API routes
- Bun-first: `bun add`, `bun run`, `bunx`

### Import Conventions
```ts
import { readFile } from 'node:fs/promises'     // Node.js built-ins first
import { z } from 'zod'                          // External packages
import type { AccountRecord } from '~/shared/types'  // Internal absolute
import { mapOpenAIToGoogle } from './mapper'      // Relative same dir
```

### Naming Conventions
- **Files**: `kebab-case.ts`, `PascalCase.vue`
- **Variables/Functions**: `camelCase`
- **Types/Interfaces**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Composables**: `use[Name].ts`
- **API Routes**: RESTful naming (`users.get.ts`, `users/[id].delete.ts`)

### Commit Message Format
```
feat: add account sync feature
fix: resolve rate limiting bug
refactor: improve error handling
chore: update dependencies
```

## MCP Tools Integration
All MCP servers run inside the `opencode-dev` container using `bun`/`bunx`:
- **Playwright**: Browser automation via CDP (connects to Edge at `browser:9223`)
- **Context7**: Library documentation lookup (remote)
- **GitHub Grep**: Code search across GitHub (remote)
- **Memory**: Persistent storage via OpenMemory (`openmemory:8080`)
- **GitHub**: Issues, PRs, code search (native `github-mcp-server` binary)
- **SQLite**: Direct SQL access to `data/accounts.sqlite`
- **CIE**: Semantic code search, call graphs (native binary, needs LM Studio on host)

## Debugging & Development
- **Nitro Preset**: Configured for `bun` runtime
- **Hot Reload**: File watching excludes `accounts.sqlite*`
- **TypeScript**: Strict mode with workspace support
- **Edge Browser GUI**: `http://localhost:3100` — visual debugging
- **Memory Dashboard**: `http://localhost:8787` — browse saved memories
