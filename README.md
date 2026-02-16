# SuiteProxy - Google AI Studio Proxy

OpenAI-compatible proxy for Google AI Studio (MakerSuite).

## 🚀 Quick Start

### 1. Install

```bash
bun install
```

### 2. Run

```bash
bun run dev
```

Server: `http://localhost:3000`

### 3. Add Account

1. Visit `http://localhost:3000`
2. Click "Add Account"
3. Install userscript
4. Go to https://aistudio.google.com
5. Cookies auto-captured ✅

### 4. Test

```bash
curl http://localhost:3000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3-flash-preview",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## 📡 API

### Chat Completions

```bash
POST /api/v1/chat/completions

{
  "model": "gemini-3-flash-preview",
  "messages": [
    {"role": "system", "content": "You are helpful"},
    {"role": "user", "content": "What is 2+2?"}
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
```

### List Models

```bash
GET /api/v1/models
```

---

## 💻 Usage

### Python

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3000/api/v1",
    api_key="dummy"
)

response = client.chat.completions.create(
    model="gemini-3-flash-preview",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)
```

### JavaScript

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:3000/api/v1',
  apiKey: 'dummy',
});

const response = await client.chat.completions.create({
  model: 'gemini-3-flash-preview',
  messages: [{ role: 'user', content: 'Hello!' }],
});

console.log(response.choices[0].message.content);
```

---

## 🔐 How It Works

1. User installs userscript
2. Visits aistudio.google.com
3. Script captures cookies + tokens
4. Stores in SQLite
5. Proxy uses cookies to make requests
6. Returns OpenAI-compatible responses

---

## 📁 Structure

```
suiteproxy/
├── server/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── chat/completions.post.ts
│   │   │   └── models.get.ts
│   │   ├── accounts/
│   │   ├── link/
│   │   └── script/
│   ├── types/
│   ├── utils/
│   └── plugins/
├── app/
│   └── pages/index.vue
└── package.json
```

---

## 🛠️ Available Models

- `gemini-3-pro-preview`
- `gemini-3-flash-preview`
- `gemini-2.0-flash-exp`
- `gemini-1.5-pro`
- `gemini-1.5-flash`

---

## 🐛 Troubleshooting

### 403 Error

Check:
1. Token is refreshed (see heartbeat logs)
2. Correct model name
3. Account has access

### 401 Error

Re-add account, cookies expired.

### 503 Error

No accounts available. Add an account first.

---

## 📝 License

MIT
