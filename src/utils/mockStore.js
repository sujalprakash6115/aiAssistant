/**
 * LocalStorage-based mock backend for pure frontend demo.
 * Everything lives in the browser – no server required.
 */

const USERS_KEY = 'demo_users';
const CHATS_KEY = 'demo_chats';
const CURRENT_USER_KEY = 'demo_current_user';

function uid() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadChats(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(CHATS_KEY) || '{}');
    return all[userId] || [];
  } catch {
    return [];
  }
}

function saveChats(userId, chats) {
  const all = JSON.parse(localStorage.getItem(CHATS_KEY) || '{}');
  all[userId] = chats;
  localStorage.setItem(CHATS_KEY, JSON.stringify(all));
}

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------- Auth ----------

export async function mockRegister(name, email, password) {
  await delay(500);
  const users = loadUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    const err = new Error('Email already registered');
    err.response = { data: { message: 'Email already registered' } };
    throw err;
  }
  if (!password || password.length < 6) {
    const err = new Error('Password must be at least 6 characters');
    err.response = { data: { message: 'Password must be at least 6 characters' } };
    throw err;
  }
  const user = {
    _id: uid(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password, // plain for demo only
    createdAt: new Date().toISOString()
  };
  users.push(user);
  saveUsers(users);
  const token = 'demo_token_' + user._id;
  localStorage.setItem('token', token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ _id: user._id, name: user.name, email: user.email }));
  return { token, user: { _id: user._id, name: user.name, email: user.email } };
}

export async function mockLogin(email, password) {
  await delay(400);
  const users = loadUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) {
    const err = new Error('Invalid email or password');
    err.response = { data: { message: 'Invalid email or password' } };
    throw err;
  }
  const token = 'demo_token_' + user._id;
  localStorage.setItem('token', token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ _id: user._id, name: user.name, email: user.email }));
  return { token, user: { _id: user._id, name: user.name, email: user.email } };
}

export async function mockMe() {
  await delay(150);
  const token = localStorage.getItem('token');
  if (!token || !token.startsWith('demo_token_')) {
    const err = new Error('Not authenticated');
    err.response = { status: 401 };
    throw err;
  }
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) {
    const err = new Error('Not authenticated');
    err.response = { status: 401 };
    throw err;
  }
  return { user: JSON.parse(raw) };
}

export function mockLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem(CURRENT_USER_KEY);
}

function getCurrentUserId() {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  return JSON.parse(raw)._id;
}

// ---------- Chats ----------

export async function mockGetChats() {
  await delay(250);
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');
  const chats = loadChats(userId);
  // return summary (without full messages for list)
  return chats
    .map(({ messages, ...rest }) => ({
      ...rest,
      messageCount: messages?.length || 0
    }))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
}

export async function mockCreateChat() {
  await delay(200);
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');
  const chat = {
    _id: uid(),
    title: 'New chat',
    pinned: false,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const chats = loadChats(userId);
  chats.unshift(chat);
  saveChats(userId, chats);
  return chat;
}

export async function mockGetChat(chatId) {
  await delay(200);
  const userId = getCurrentUserId();
  const chats = loadChats(userId);
  const chat = chats.find((c) => c._id === chatId);
  if (!chat) {
    const err = new Error('Chat not found');
    err.response = { status: 404 };
    throw err;
  }
  return chat;
}

export async function mockUpdateChat(chatId, updates) {
  await delay(150);
  const userId = getCurrentUserId();
  const chats = loadChats(userId);
  const idx = chats.findIndex((c) => c._id === chatId);
  if (idx === -1) throw new Error('Chat not found');
  chats[idx] = { ...chats[idx], ...updates, updatedAt: new Date().toISOString() };
  saveChats(userId, chats);
  return chats[idx];
}

export async function mockDeleteChat(chatId) {
  await delay(200);
  const userId = getCurrentUserId();
  let chats = loadChats(userId);
  chats = chats.filter((c) => c._id !== chatId);
  saveChats(userId, chats);
  return { success: true };
}

export async function mockClearMessages(chatId) {
  await delay(150);
  return mockUpdateChat(chatId, { messages: [], title: 'New chat' });
}

// ---------- Simple mock AI replies ----------

function generateMockReply(userMessage, { style = 'detailed', length = 'medium', deepResearch = false, customInstructions = '' } = {}) {
  const lower = userMessage.toLowerCase();
  let reply = '';

  // Keyword-based responses
  if (lower.includes('quantum')) {
    reply = `**Quantum Computing (simple explanation)**

Quantum computers use **qubits** instead of classical bits. A qubit can be 0, 1, or both at the same time (superposition).

Key ideas:
- **Superposition** – multiple states at once
- **Entanglement** – linked qubits that affect each other instantly
- **Interference** – amplify correct answers, cancel wrong ones

This lets them solve certain problems (factoring, simulation, optimization) much faster than regular computers for specific tasks.

> This is a **demo response**. In the full version the real Groq model + Wikipedia sources would power the answer.`;
  } else if (lower.includes('email') || lower.includes('meeting')) {
    reply = `**Professional email draft**

Subject: Request for a meeting

Dear [Name],

I hope this message finds you well. I would like to schedule a short meeting to discuss [topic].

Would any of the following times work for you?
- Tuesday 2:00–2:30 PM
- Wednesday 11:00–11:30 AM
- Thursday 4:00–4:30 PM

Please let me know what is most convenient, or suggest an alternative.

Best regards,  
[Your Name]

---
*Demo reply – style: ${style}, length: ${length}*`;
  } else if (lower.includes('python') || lower.includes('debug') || lower.includes('code')) {
    reply = `**Code review**

Looking at:
\`\`\`python
def add(a, b):
    return a - b
\`\`\`

**Issue:** The function is named \`add\` but it subtracts.

**Fixed version:**
\`\`\`python
def add(a, b):
    return a + b
\`\`\`

Also consider adding type hints and a docstring for clarity.

> Demo mode – real AI would give deeper analysis.`;
  } else if (lower.includes('climate')) {
    reply = `**Climate change – key ideas**

1. **Greenhouse effect** – CO₂, methane, etc. trap heat
2. **Human influence** – burning fossil fuels, deforestation
3. **Observed changes** – rising temperatures, extreme weather, sea-level rise
4. **Impacts** – ecosystems, agriculture, health, economies
5. **Mitigation & adaptation** – clean energy, efficiency, resilience

${deepResearch ? '\n*Deep Research toggle is on – in production this would pull extra Wikipedia sources.*' : ''}

---
*Demo response*`;
  } else if (lower.includes('interview') || lower.includes('system design')) {
    reply = `**System design interview prep**

Core topics to practice:
- Scalability & load balancing
- Caching (Redis, CDN)
- Databases (SQL vs NoSQL, sharding)
- Message queues
- CAP theorem & consistency models
- API design & rate limiting

**Tip:** Always clarify requirements, estimate scale, draw a high-level diagram, then dive into components.

*This is a mock answer for UI demonstration.*`;
  } else if (lower.includes('translate') || lower.includes('spanish')) {
    reply = `**Translation**

> Hello, how are you?  
→ **Hola, ¿cómo estás?**

(Or more formal: *Hola, ¿cómo está usted?*)

---
Demo mode active.`;
  } else {
    // Generic fallback that reflects the selected options
    const styleNote =
      style === 'simple'
        ? 'Keeping it short and plain.'
        : style === 'professional'
          ? 'Using a professional tone.'
          : style === 'creative'
            ? 'Adding a creative spin.'
            : 'Going into reasonable detail.';

    const lengthNote =
      length === 'short'
        ? 'Concise version:'
        : length === 'long'
          ? 'Expanded version:'
          : 'Medium-length reply:';

    reply = `**${lengthNote}**

You said: *"${userMessage.slice(0, 120)}${userMessage.length > 120 ? '…' : ''}"*

${styleNote}

This frontend is running in **demo / offline mode**.  
All data (users, chats, messages) is stored in your browser’s localStorage. No backend or API key is required.

You can:
- Create multiple chats
- Rename, pin, delete, and search them
- Change response style & length (Settings)
- Toggle Deep Research
- Use custom instructions

When you connect a real backend later, just switch the data layer back to the API.

${customInstructions ? `\n*Custom instructions detected: “${customInstructions.slice(0, 80)}…”*` : ''}
${deepResearch ? '\n*Deep Research is enabled (demo).' : ''}`;
  }

  // Slightly adjust length
  if (length === 'short' && reply.length > 400) {
    reply = reply.split('\n\n').slice(0, 3).join('\n\n') + '\n\n*(truncated for demo)*';
  }

  return {
    role: 'assistant',
    content: reply,
    _id: uid(),
    sources: deepResearch
      ? [
          { title: 'Wikipedia – Demo source', url: 'https://en.wikipedia.org', snippet: 'Example source shown because Deep Research is on.' }
        ]
      : [],
    createdAt: new Date().toISOString()
  };
}

export async function mockSendMessage(chatId, content, options = {}) {
  await delay(700 + Math.random() * 600); // simulate thinking
  const userId = getCurrentUserId();
  const chats = loadChats(userId);
  const idx = chats.findIndex((c) => c._id === chatId);
  if (idx === -1) throw new Error('Chat not found');

  const userMsg = {
    role: 'user',
    content: content.trim(),
    _id: uid(),
    createdAt: new Date().toISOString()
  };

  const assistantMsg = generateMockReply(content, options);

  chats[idx].messages = [...(chats[idx].messages || []), userMsg, assistantMsg];

  // Auto-title on first message
  if (chats[idx].title === 'New chat' || !chats[idx].title) {
    chats[idx].title = content.trim().slice(0, 48) + (content.length > 48 ? '…' : '');
  }
  chats[idx].updatedAt = new Date().toISOString();
  saveChats(userId, chats);

  return {
    message: assistantMsg,
    title: chats[idx].title
  };
}

export async function mockRegenerate(chatId, options = {}) {
  await delay(600);
  const userId = getCurrentUserId();
  const chats = loadChats(userId);
  const idx = chats.findIndex((c) => c._id === chatId);
  if (idx === -1) throw new Error('Chat not found');

  const messages = chats[idx].messages || [];
  // Find last user message
  let lastUserContent = 'Hello';
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      lastUserContent = messages[i].content;
      break;
    }
  }

  const newAssistant = generateMockReply(lastUserContent + ' (regenerated)', options);

  // Replace last assistant or append
  if (messages.length && messages[messages.length - 1].role === 'assistant') {
    messages[messages.length - 1] = newAssistant;
  } else {
    messages.push(newAssistant);
  }
  chats[idx].messages = messages;
  chats[idx].updatedAt = new Date().toISOString();
  saveChats(userId, chats);

  return { message: newAssistant };
}
