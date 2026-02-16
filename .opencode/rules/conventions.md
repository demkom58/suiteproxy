# Project Rules

## Memory Protocol
Before starting any significant task:
1. Run `memory_search` with relevant keywords
2. After decisions, run `memory_save` with tags: `architecture`, `decision`, `bug`, `preference`, `pattern`, `todo`, `proxy`
3. Browse memories at http://localhost:8787

## MCP Tools — How & When to Use

### GitHub MCP (`github`)
Direct GitHub API access — issues, PRs, code search, repos, actions. Use **instead of** `gh` CLI.
- **Create issues**: `create_issue` with owner, repo, title, body
- **Create PRs**: `create_pull_request` with owner, repo, title, body, head, base
- **Search code**: `search_code` with query (e.g. `"BotGuard repo:user/project"`)
- **Get file contents**: `get_file_contents` with owner, repo, path
- **List PRs/issues**: `list_issues`, `list_pull_requests`
- Requires `GITHUB_PAT` env var to be set

### SQLite MCP (`sqlite`)
Direct SQL access to the project database at `data/accounts.sqlite`.
- **Read accounts**: `SELECT id, last_sync, limited_until FROM accounts`
- **Read credentials**: `SELECT id, json_extract(creds, '$.cookie') as cookie FROM accounts WHERE id='email'`
- **Check rate limits**: `SELECT id, limited_until, datetime(limited_until/1000, 'unixepoch') as limited_at FROM accounts WHERE limited_until > 0`
- Use this instead of writing scripts to query the database
- **Read-only recommended** — use the app's API routes for writes

### CIE — Code Intelligence Engine (`cie`)
Semantic code search, call graph analysis, function discovery. Runs via WSL.
- Currently **disabled** in config — enable when needed and LM Studio is running
- Before first use: run `cie init` and `cie index` in the project root
- `cie_semantic_search` — find code by meaning (requires LM Studio at `127.0.0.1:1234`)
- `cie_find_function` — locate functions by name
- `cie_find_callers` / `cie_find_callees` — trace call chains
- `cie_grep` — fast literal text search

### Skills (`find-skills`)
Use `npx skills find <query>` to discover installable agent skills for specialized tasks.
Install with `npx skills add <package> -g -y`.

### Existing Tools (unchanged)
- **Playwright** — browser automation via Edge CDP at `localhost:9222`
- **Context7** — library documentation lookup
- **GitHub Grep** — search code across public GitHub repos
- **Memory** — persistent key-value storage via OpenMemory

## Browser Prep Protocol
Before any CDP/Playwright work with AI Studio:
1. Use SQLite MCP to verify account exists: `SELECT id FROM accounts LIMIT 1`
2. Navigate to `https://aistudio.google.com/` via Playwright
3. If redirected to login, cookies may be expired — notify user

## Service URLs (canonical)
| Service | Host URL | Docker URL |
|---------|----------|------------|
| Nuxt | `http://localhost:3000` | `http://host.docker.internal:3000` |
| Edge GUI | `http://localhost:3100` | N/A |
| Edge CDP | `http://localhost:9222` | N/A |
| OpenMemory API + Dashboard | `http://localhost:8787` | `http://openmemory:8080` |
| LM Studio | `http://127.0.0.1:1234/v1` | N/A |

## Code Patterns
- TypeScript strict, `const` over `let`, never `var`
- Early returns, destructuring, template literals
- `async/await` over `.then()` chains
- Bun-first: `bun add`, `bun run`, `bunx`

## Proxy Context
Primary project: AI Studio (MakerSuite) proxy. Key concerns:
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
