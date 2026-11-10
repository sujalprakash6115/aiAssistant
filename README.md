# AI Assistant – Frontend Demo (No Backend Required)

Pure React + Vite frontend that works **completely offline**.

All auth, chats, and messages are stored in the browser (`localStorage`).  
No Node server, MongoDB, or API keys needed.

Perfect for frontend developers who want to explore / improve the UI.

---

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

1. Click **Create account** (any name / email / password ≥ 6 chars)
2. Start chatting – replies are simulated
3. Try sidebar features: new chat, pin, rename, delete, search
4. Open Settings to change theme, response style, length, custom instructions

---

## What works in demo mode

| Feature                    | Status                          |
|----------------------------|---------------------------------|
| Register / Login / Logout  | ✅ localStorage                 |
| Create / rename / delete chats | ✅                          |
| Pin chats + search         | ✅                              |
| Send messages              | ✅ mock AI replies              |
| Regenerate                 | ✅                              |
| Response style & length    | ✅ reflected in replies         |
| Deep Research toggle       | ✅ shows fake sources           |
| Custom instructions        | ✅ noted in replies             |
| Theme (dark / light)       | ✅                              |
| Markdown rendering         | ✅                              |
| Responsive layout          | ✅                              |

Data persists across refreshes (same browser).  
Clear site data / localStorage to reset.

---

## Project structure

```
ai-assistant-frontend/
├── public/
├── src/
│   ├── components/          # ChatSidebar, MessageList, ChatInput, ...
│   ├── context/AuthContext.jsx
│   ├── pages/               # ChatPage, Login, Register, Settings
│   ├── utils/
│   │   ├── api.js           # original axios helper (unused in demo)
│   │   └── mockStore.js     # ← localStorage mock backend
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── docs/                    # UI screenshots
├── package.json
├── vite.config.js
└── README.md
```

---

## How the mock works

- `src/utils/mockStore.js` – all data operations
- Users, chats and messages live in `localStorage`
- Keyword-based replies for common topics (quantum, email, code, climate…)
- Generic fallback replies that mention the selected style / length / deep-research

When you later connect a real backend, you can swap the imports in `AuthContext.jsx` and `ChatPage.jsx` back to the original `api` calls.

---

## Scripts

```bash
npm run dev      # development server (port 3000)
npm run build    # production build
npm run preview  # preview production build
```

---

## Notes for frontend developers

- Theme is controlled by `data-theme="dark|light"` + CSS variables in `index.css`
- Preferences (style, length, instructions) also stored in localStorage
- You can freely redesign components, add animations, improve a11y, switch to Tailwind, etc.
- The original API shape is preserved so switching to a real backend later is straightforward

Enjoy exploring the UI!
