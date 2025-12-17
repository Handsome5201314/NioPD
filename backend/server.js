import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import * as authAPI from './api/auth.js'
import * as aiAPI from './api/ai.js'
import { initGlobalAIConfig } from './services/global-ai-config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now()

  // 记录请求
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)

  // 监听响应完成
  res.on('finish', () => {
    const duration = Date.now() - start
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'
    const resetColor = '\x1b[0m'
    console.log(`${statusColor}[${res.statusCode}]${resetColor} ${req.method} ${req.path} - ${duration}ms`)
  })

  next()
})

// ==================== 认证相关 API ====================

// 用户注册
app.post('/api/auth/register', authAPI.register)

// 用户登录
app.post('/api/auth/login', authAPI.login)

// 获取用户信息
app.get('/api/user/profile', authAPI.getUserProfile)

// 更新用户信息
app.put('/api/user/profile', authAPI.updateUserProfile)

// 获取对话历史
app.get('/api/user/conversations', authAPI.getConversations)

// 保存对话
app.post('/api/user/conversations', authAPI.saveConversation)

// 删除对话
app.delete('/api/user/conversations/:id', authAPI.deleteConversation)

// 获取用户配置（向后兼容）
app.get('/api/user/config', authAPI.getUserConfig)

// 保存用户配置（向后兼容）
app.post('/api/user/config', authAPI.saveUserConfig)

// ==================== 用户画像 API ====================

// 获取用户画像
app.get('/api/persona/get', authAPI.getUserPersona)

// 保存用户画像
app.post('/api/persona/save', authAPI.saveUserPersona)

// ==================== 知识库 API ====================

// 获取知识库文档
app.get('/api/knowledge/documents', authAPI.getKnowledgeDocuments)

// 上传知识库文档
app.post('/api/knowledge/upload', authAPI.uploadKnowledgeDocument)

// 删除知识库文档
app.delete('/api/knowledge/documents/:id', authAPI.deleteKnowledgeDocument)

// ==================== AI对话 API ====================

// 智能对话
app.post('/api/ai/chat', aiAPI.chat)

// 获取专家列表
app.get('/api/ai/experts', aiAPI.getExperts)

// 获取专家详情
app.get('/api/ai/experts/:id', aiAPI.getExpertDetail)

// 添加自定义专家
app.post('/api/ai/experts/custom', aiAPI.addExpert)

// 删除自定义专家
app.delete('/api/ai/experts/custom/:id', aiAPI.deleteExpert)

// ==================== 全局AI配置管理 API ====================

// 获取配置摘要
app.get('/api/ai/config/summary', aiAPI.getConfigSummaryAPI)

// 获取完整配置
app.get('/api/ai/config', aiAPI.getGlobalConfigAPI)

// 更新配置
app.post('/api/ai/config', aiAPI.updateGlobalConfigAPI)

// 测试API连接
app.post('/api/ai/config/test', aiAPI.testConfigAPI)

// 重置为默认配置
app.post('/api/ai/config/reset', aiAPI.resetConfigAPI)

// ==================== 健康检查 API ====================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '破界实验室一人公司 API Server is running',
    timestamp: new Date().toISOString(),
    globalAIConfig: {
      initialized: true,
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat'
    }
  })
})

// ==================== 命令相关 API ====================

app.get('/api/commands', (req, res) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    message: 'Commands endpoint - 前端将使用模拟数据'
  })
})

app.get('/api/commands/org-update', (req, res) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    message: 'Org-update commands endpoint - 前端将使用模拟数据'
  })
})

app.get('/api/commands/by-category', (req, res) => {
  res.json({
    success: true,
    data: {},
    message: 'Commands by category endpoint - 前端将使用模拟数据'
  })
})

app.get('/api/commands/:name', (req, res) => {
  res.json({
    success: true,
    data: null,
    message: `Command ${req.params.name} endpoint - 前端将使用模拟数据`
  })
})

// ==================== 代理相关 API ====================

app.get('/api/agents', (req, res) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    message: 'Agents endpoint - 前端将使用模拟数据'
  })
})

app.get('/api/agents/v2-only', (req, res) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    message: 'V2 agents endpoint - 前端将使用模拟数据'
  })
})

app.get('/api/agents/:name', (req, res) => {
  res.json({
    success: true,
    data: null,
    message: `Agent ${req.params.name} endpoint - 前端将使用模拟数据`
  })
})

// ==================== 模板相关 API ====================

app.get('/api/templates', (req, res) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    message: 'Templates endpoint - 前端将使用模拟数据'
  })
})

app.get('/api/templates/by-type', (req, res) => {
  res.json({
    success: true,
    data: {},
    message: 'Templates by type endpoint - 前端将使用模拟数据'
  })
})

app.get('/api/templates/sop', (req, res) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    message: 'SOP templates endpoint - 前端将使用模拟数据'
  })
})

app.get('/api/templates/:name', (req, res) => {
  res.json({
    success: true,
    data: null,
    message: `Template ${req.params.name} endpoint - 前端将使用模拟数据`
  })
})

// ==================== 工作区相关 API ====================

app.get('/api/workspace/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalFiles: 0,
      initiatives: { total: 0, byStatus: {} },
      prds: 0,
      reports: 0,
      roadmaps: 0,
      lastActivity: new Date().toISOString()
    },
    message: 'Workspace stats endpoint - 前端将使用模拟数据'
  })
})

app.get('/api/workspace/initiatives', (req, res) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    message: 'Initiatives endpoint - 前端将使用模拟数据'
  })
})

app.get('/api/workspace/timeline', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Timeline endpoint - 前端将使用模拟数据'
  })
})

app.get('/api/workspace/heatmap', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Heatmap endpoint - 前端将使用模拟数据'
  })
})

// 404 错误处理
app.use((req, res) => {
  console.log(`\x1b[33m[404]\x1b[0m ${req.method} ${req.path} - Not Found`)
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.path
  })
})

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error(`\x1b[31m[ERROR]\x1b[0m ${req.method} ${req.path}`)
  console.error(err.stack)

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 启动服务器
app.listen(PORT, async () => {
  // 初始化全局AI配置
  initGlobalAIConfig()
  
  console.log('\n' + '='.repeat(60))
  console.log('|' + ' '.repeat(58) + '|')
  console.log('|   破界实验室一人公司 API Server' + ' '.repeat(23) + '|')
  console.log('|' + ' '.repeat(58) + '|')
  console.log(`|   Server running on: http://localhost:${PORT}` + ' '.repeat(15) + '|')
  console.log(`|   Health check: http://localhost:${PORT}/api/health` + ' '.repeat(9) + '|')
  console.log('|' + ' '.repeat(58) + '|')
  console.log('='.repeat(60))
  console.log('\n[INFO] Available API endpoints:')
  console.log('  - GET /api/health')
  console.log('  - GET /api/commands')
  console.log('  - GET /api/commands/org-update')
  console.log('  - GET /api/commands/by-category')
  console.log('  - GET /api/commands/:name')
  console.log('  - GET /api/agents')
  console.log('  - GET /api/agents/v2-only')
  console.log('  - GET /api/agents/:name')
  console.log('  - GET /api/templates')
  console.log('  - GET /api/templates/by-type')
  console.log('  - GET /api/templates/sop')
  console.log('  - GET /api/templates/:name')
  console.log('  - GET /api/workspace/stats')
  console.log('  - GET /api/workspace/initiatives')
  console.log('  - GET /api/workspace/timeline')
  console.log('  - GET /api/workspace/heatmap')
  console.log('\n[INFO] AI Configuration endpoints:')
  console.log('  - GET /api/ai/config/summary')
  console.log('  - GET /api/ai/config')
  console.log('  - POST /api/ai/config')
  console.log('  - POST /api/ai/config/test')
  console.log('  - POST /api/ai/config/reset')
  console.log('\n[INFO] All endpoints return empty data.')
  console.log('[INFO] Frontend will use mock data as fallback.')
  console.log('[INFO] AI service now uses global configuration.')
})