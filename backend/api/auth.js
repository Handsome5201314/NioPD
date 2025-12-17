import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 简单的用户数据存储（使用 JSON 文件，生产环境应使用数据库）
const DATA_DIR = path.join(__dirname, 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'conversations.json')
const CONFIGS_FILE = path.join(DATA_DIR, 'configs.json')
const PERSONAS_FILE = path.join(DATA_DIR, 'personas.json')
const KNOWLEDGE_FILE = path.join(DATA_DIR, 'knowledge.json')

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// 初始化数据文件
function initDataFile(filepath, initialData = []) {
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(initialData, null, 2))
  }
}

initDataFile(USERS_FILE, [])
initDataFile(CONVERSATIONS_FILE, [])
initDataFile(CONFIGS_FILE, [])
initDataFile(PERSONAS_FILE, [])
initDataFile(KNOWLEDGE_FILE, [])

// 读取数据
function readData(filepath) {
  try {
    const data = fs.readFileSync(filepath, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    console.error(`Error reading ${filepath}:`, err)
    return []
  }
}

// 写入数据
function writeData(filepath, data) {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2))
    return true
  } catch (err) {
    console.error(`Error writing ${filepath}:`, err)
    return false
  }
}

// 生成简单的 token
function generateToken(userId) {
  return crypto.randomBytes(32).toString('hex') + '_' + userId
}

// 从 token 解析用户 ID
function getUserIdFromToken(token) {
  if (!token) return null
  const parts = token.split('_')
  return parts.length === 2 ? parts[1] : null
}

// 密码哈希（简单实现，生产环境应使用 bcrypt）
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// 注册
export function register(req, res) {
  const { username, password, email } = req.body

  if (!username || !password || !email) {
    return res.json({
      success: false,
      error: '用户名、密码和邮箱不能为空'
    })
  }

  const users = readData(USERS_FILE)

  // 检查用户名是否已存在
  if (users.find(u => u.username === username)) {
    return res.json({
      success: false,
      error: '用户名已存在'
    })
  }

  // 检查邮箱是否已存在
  if (users.find(u => u.email === email)) {
    return res.json({
      success: false,
      error: '邮箱已被注册'
    })
  }

  // 创建新用户
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password: hashPassword(password),
    avatar: '👤',
    createdAt: new Date().toISOString()
  }

  users.push(newUser)
  writeData(USERS_FILE, users)

  // 生成 token
  const token = generateToken(newUser.id)

  // 返回用户信息（不包括密码）
  const { password: _, ...userWithoutPassword } = newUser

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      token
    }
  })
}

// 登录
export function login(req, res) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.json({
      success: false,
      error: '用户名和密码不能为空'
    })
  }

  const users = readData(USERS_FILE)
  const user = users.find(u => u.username === username)

  if (!user) {
    return res.json({
      success: false,
      error: '用户不存在'
    })
  }

  // 验证密码
  if (user.password !== hashPassword(password)) {
    return res.json({
      success: false,
      error: '密码错误'
    })
  }

  // 生成 token
  const token = generateToken(user.id)

  // 返回用户信息（不包括密码）
  const { password: _, ...userWithoutPassword } = user

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      token
    }
  })
}

// 获取用户信息
export function getUserProfile(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  const users = readData(USERS_FILE)
  const user = users.find(u => u.id === userId)

  if (!user) {
    return res.json({
      success: false,
      error: '用户不存在'
    })
  }

  const { password: _, ...userWithoutPassword } = user

  res.json({
    success: true,
    data: userWithoutPassword
  })
}

// 更新用户信息
export function updateUserProfile(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  const { username, email, avatar } = req.body
  const users = readData(USERS_FILE)
  const userIndex = users.findIndex(u => u.id === userId)

  if (userIndex === -1) {
    return res.json({
      success: false,
      error: '用户不存在'
    })
  }

  // 更新用户信息
  if (username) users[userIndex].username = username
  if (email) users[userIndex].email = email
  if (avatar) users[userIndex].avatar = avatar

  writeData(USERS_FILE, users)

  const { password: _, ...userWithoutPassword } = users[userIndex]

  res.json({
    success: true,
    data: userWithoutPassword
  })
}

// 获取对话历史
export function getConversations(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  const conversations = readData(CONVERSATIONS_FILE)
  const userConversations = conversations.filter(c => c.userId === userId)

  res.json({
    success: true,
    data: userConversations
  })
}

// 保存对话
export function saveConversation(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  const { title, messages, iteration, preview } = req.body
  const conversations = readData(CONVERSATIONS_FILE)

  const newConversation = {
    id: Date.now().toString(),
    userId,
    title: title || '未命名对话',
    preview: preview || '',
    messages: messages || [],
    iteration: iteration || 0,
    messageCount: messages?.length || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  conversations.push(newConversation)
  writeData(CONVERSATIONS_FILE, conversations)

  res.json({
    success: true,
    data: newConversation
  })
}

// 删除对话
export function deleteConversation(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  const { id } = req.params
  const conversations = readData(CONVERSATIONS_FILE)

  const conversation = conversations.find(c => c.id === id && c.userId === userId)

  if (!conversation) {
    return res.json({
      success: false,
      error: '对话不存在或无权访问'
    })
  }

  const filteredConversations = conversations.filter(c => c.id !== id)
  writeData(CONVERSATIONS_FILE, filteredConversations)

  res.json({
    success: true,
    data: { id }
  })
}

// 获取用户配置
export function getUserConfig(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  const configs = readData(CONFIGS_FILE)
  const userConfig = configs.find(c => c.userId === userId)

  res.json({
    success: true,
    data: userConfig || { userId, apiConfigs: {}, expertModels: {} }
  })
}

// 保存用户配置
export function saveUserConfig(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  const { apiConfigs, expertModels } = req.body
  const configs = readData(CONFIGS_FILE)

  const configIndex = configs.findIndex(c => c.userId === userId)

  if (configIndex >= 0) {
    // 更新现有配置
    configs[configIndex].apiConfigs = apiConfigs
    configs[configIndex].expertModels = expertModels
    configs[configIndex].updatedAt = new Date().toISOString()
  } else {
    // 创建新配置
    configs.push({
      userId,
      apiConfigs,
      expertModels,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  writeData(CONFIGS_FILE, configs)

  res.json({
    success: true,
    data: configs.find(c => c.userId === userId)
  })
}

// ==================== 用户画像 API ====================

// 获取用户画像
export function getUserPersona(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  const personas = readData(PERSONAS_FILE)
  const userPersona = personas.find(p => p.userId === userId)

  res.json({
    success: true,
    data: userPersona || null
  })
}

// 保存用户画像
export function saveUserPersona(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  const personaData = req.body
  const personas = readData(PERSONAS_FILE)

  const personaIndex = personas.findIndex(p => p.userId === userId)

  if (personaIndex >= 0) {
    // 更新现有画像
    personas[personaIndex] = {
      ...personaData,
      userId,
      lastUpdated: new Date().toISOString()
    }
  } else {
    // 创建新画像
    personas.push({
      ...personaData,
      userId,
      generatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    })
  }

  writeData(PERSONAS_FILE, personas)

  res.json({
    success: true,
    data: personas.find(p => p.userId === userId)
  })
}

// ==================== 知识库 API ====================

// 获取知识库文档
export function getKnowledgeDocuments(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  const documents = readData(KNOWLEDGE_FILE)
  const userDocuments = documents.filter(d => d.userId === userId)

  res.json({
    success: true,
    data: userDocuments
  })
}

// 上传知识库文档
export function uploadKnowledgeDocument(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  const { name, category, size, type, content } = req.body
  const documents = readData(KNOWLEDGE_FILE)

  const newDocument = {
    id: Date.now().toString(),
    userId,
    name: name || '未命名文档',
    category: category || 'other',
    size: size || 0,
    type: type || 'unknown',
    content: content || '',
    uploadedAt: new Date().toISOString()
  }

  documents.push(newDocument)
  writeData(KNOWLEDGE_FILE, documents)

  res.json({
    success: true,
    data: newDocument
  })
}

// 删除知识库文档
export function deleteKnowledgeDocument(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  const { id } = req.params
  const documents = readData(KNOWLEDGE_FILE)

  const document = documents.find(d => d.id === id && d.userId === userId)

  if (!document) {
    return res.json({
      success: false,
      error: '文档不存在或无权访问'
    })
  }

  const filteredDocuments = documents.filter(d => d.id !== id)
  writeData(KNOWLEDGE_FILE, filteredDocuments)

  res.json({
    success: true,
    data: { id }
  })
}
