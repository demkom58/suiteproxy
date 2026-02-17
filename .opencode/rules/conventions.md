# Project Rules (Container Environment)

## Environment
You are running inside the `opencode-dev` Docker container (Debian Linux).
All tools are native Linux binaries. No WSL, no Windows paths.
Project is volume-mounted at `/app` — edits sync to host in real-time.

## Memory Protocol
Before starting any significant task:
1. Run `memory_search` with relevant keywords
2. After decisions, run `memory_save` with tags: `architecture`, `decision`, `bug`, `preference`, `pattern`, `todo`, `proxy`
3. User can browse memories at http://localhost:8787 on host

## MCP Tools — How & When to Use

### GitHub MCP (`github`)
Direct GitHub API access — issues, PRs, code search, repos, actions. Use **instead of** `gh` CLI.
- **Create issues**: `create_issue` with owner, repo, title, body
- **Create PRs**: `create_pull_request` with owner, repo, title, body, head, base
- **Search code**: `search_code` with query (e.g. `"BotGuard repo:user/project"`)
- **Get file contents**: `get_file_contents` with owner, repo, path
- **List PRs/issues**: `list_issues`, `list_pull_requests`
- Uses `GITHUB_PAT` env var (passed into container)

### SQLite MCP (`sqlite`)
Direct SQL access to the project database at `data/accounts.sqlite`.
- **Read accounts**: `SELECT id, last_sync, limited_until FROM accounts`
- **Read credentials**: `SELECT id, json_extract(creds, '$.cookie') as cookie FROM accounts WHERE id='email'`
- **Check rate limits**: `SELECT id, limited_until, datetime(limited_until/1000, 'unixepoch') as limited_at FROM accounts WHERE limited_until > 0`
- Use this instead of writing scripts to query the database
- **Read-only recommended** — use the app's API routes for writes

### CIE — Code Intelligence Engine (`cie`)
Semantic code search, call graph analysis, function discovery. Native Linux binary.
- **Enabled** — runs natively in this container
- Before first use: run `cie init` and `cie index` in the project root
- Requires LM Studio running on host at `http://host.docker.internal:1234/v1`
- `cie_semantic_search` — find code by meaning
- `cie_find_function` — locate functions by name
- `cie_find_callers` / `cie_find_callees` — trace call chains
- `cie_grep` — fast literal text search

### Skills (`find-skills`)
Use `npx skills find <query>` to discover installable agent skills for specialized tasks.
Install with `npx skills add <package> -g -y`.

### Existing Tools (unchanged)
- **Playwright** — browser automation via Camoufox (stealth Firefox, local, `DISPLAY=:99`)
- **Context7** — library documentation lookup
- **GitHub Grep** — search code across public GitHub repos
- **Memory** — persistent storage via OpenMemory at `openmemory:8080`

## Browser Environment
- **Camoufox** (stealth Firefox) runs locally inside this container
- **Xvfb** provides virtual display on `:99` (`DISPLAY=:99` set in environment)
- **Playwright MCP** uses `--browser firefox` — launches Camoufox directly
- No external browser container needed

## Browser Prep Protocol
Before any Playwright work with AI Studio:
1. Use SQLite MCP to verify account exists: `SELECT id FROM accounts LIMIT 1`
2. Navigate to `https://aistudio.google.com/` via Playwright
3. If redirected to login, cookies may be expired — notify user

## Service URLs (from inside container)

| Service | URL | Notes |
|---------|-----|-------|
| Nuxt dev server | `http://localhost:3000` | Runs in this container |
| OpenMemory API | `http://openmemory:8080` | Docker service name |
| LM Studio | `http://host.docker.internal:1234/v1` | On host machine |
| OpenMemory Dashboard | Host only: `http://localhost:8787` | |

## Code Patterns
- TypeScript strict, `const` over `let`, never `var`
- Early returns, destructuring, template literals
- `async/await` over `.then()` chains
- Bun-first: `bun add`, `bun run`, `bunx`

## Proxy Context
Primary project: AI Studio (MakerSuite) proxy. Key concerns:
- Request interception/forwarding via Camoufox browser automation
- Auth token management (cookies from extension)
- Response streaming
- Rate limiting / queuing
- Error recovery
- Session management

## Docker Services
All services are on the same Docker network:
- **OpenMemory**: `openmemory:8080` (API + Dashboard)
- **This container**: `opencode-dev` — Nuxt on :3000, OpenCode Web on :4096, Camoufox + Xvfb
