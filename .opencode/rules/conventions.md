# Project Rules

## Memory Protocol
Before starting any significant task:
1. Run `memory_search` with relevant keywords
2. After decisions, run `memory_save` with tags: `architecture`, `decision`, `bug`, `preference`, `pattern`, `todo`, `proxy`
3. Browse memories at http://localhost:8787

## Service URLs (canonical)
| Service | Host URL | Docker URL |
|---------|----------|------------|
| Nuxt | `http://localhost:3000` | `http://host.docker.internal:3000` |
| Edge GUI | `http://localhost:3100` | N/A |
| Edge CDP | `http://localhost:9222` | N/A |
| OpenMemory API + Dashboard | `http://localhost:8787` | `http://openmemory:8080` |

## Code Patterns
- TypeScript strict, `const` over `let`, never `var`
- Early returns, destructuring, template literals
- `async/await` over `.then()` chains
- Bun-first: `bun add`, `bun run`, `bunx`

## Proxy Context
Primary project: AI Studio (SuiteMakers) proxy. Key concerns:
- Request interception/forwarding
- Auth token management
- BotGuard token generation
- Response streaming
- Rate limiting / queuing
- Error recovery
- Session management

## Docker Services
Start: `docker compose -f .opencode/infra/docker-compose.yml up -d`
- **Edge Browser**: `localhost:3100` (GUI), `localhost:9222` (CDP) — real desktop browser, better stealth
- **OpenMemory**: `localhost:8787` (API + Dashboard at `/`) — persistent memory across sessions
