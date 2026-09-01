import fs from 'fs'
import path from 'path'

export type StoredUser = {
  username: string
  hash: string
  createdAt: number
  bio?: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'users.json')

function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]))
  }
}

export function getUsers(): StoredUser[] {
  initDb()
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    console.error('Error reading users DB:', err)
    return []
  }
}

export function saveUsers(users: StoredUser[]) {
  initDb()
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2))
}

export function getUser(username: string): StoredUser | undefined {
  const users = getUsers()
  return users.find(u => u.username.toLowerCase() === username.toLowerCase())
}

export function updateUser(username: string, updates: Partial<StoredUser>) {
  const users = getUsers()
  const index = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase())
  if (index !== -1) {
    users[index] = { ...users[index], ...updates }
    saveUsers(users)
    return users[index]
  }
  return null
}

export async function hashPassword(username: string, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const raw = `snd:${username.toLowerCase()}:${password}:v1`
  const data = encoder.encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

