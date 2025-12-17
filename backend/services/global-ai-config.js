/**
 * 全局AI配置服务
 * 统一管理所有AI相关的配置，避免重复配置
 */

import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 默认配置
const DEFAULT_CONFIG = {
  // DeepSeek配置（可作为默认值）
  baseUrl: 'https://api.deepseek.com',
  apiKey: 'sk-9cbd9a74e19649839586b3b6a4ea321b',
  modelName: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 30000
}

// 全局配置缓存
let globalConfig = null
let configLastLoaded = 0
const CONFIG_CACHE_DURATION = 60000 // 缓存1分钟

// 配置文件路径
const CONFIG_FILE = join(__dirname, '../api/data/global-ai-config.json')

/**
 * 初始化全局配置
 */
export function initGlobalAIConfig() {
  try {
    globalConfig = loadConfig()
    console.log('[全局AI配置] 初始化成功')
    console.log(`[全局AI配置] Base URL: ${globalConfig.baseUrl}`)
    console.log(`[全局AI配置] 模型: ${globalConfig.modelName}`)
  } catch (error) {
    console.error('[全局AI配置] 初始化失败:', error)
    // 使用默认配置
    globalConfig = DEFAULT_CONFIG
    console.log('[全局AI配置] 使用默认配置')
  }
}

/**
 * 加载配置文件
 */
function loadConfig() {
  try {
    // 检查缓存
    const now = Date.now()
    if (globalConfig && (now - configLastLoaded) < CONFIG_CACHE_DURATION) {
      return globalConfig
    }

    // 读取配置文件
    if (!fs.existsSync(CONFIG_FILE)) {
      console.log('[全局AI配置] 配置文件不存在，使用默认配置')
      saveConfig(DEFAULT_CONFIG)
      return DEFAULT_CONFIG
    }

    const configData = fs.readFileSync(CONFIG_FILE, 'utf8')
    const config = JSON.parse(configData)
    
    // 验证配置
    if (!config.baseUrl || !config.apiKey) {
      console.log('[全局AI配置] 配置不完整，使用默认配置')
      saveConfig(DEFAULT_CONFIG)
      return DEFAULT_CONFIG
    }

    // 更新缓存
    globalConfig = config
    configLastLoaded = now
    
    console.log('[全局AI配置] 配置加载成功')
    return config
    
  } catch (error) {
    console.error('[全局AI配置] 加载配置失败:', error)
    return DEFAULT_CONFIG
  }
}

/**
 * 保存配置到文件
 */
function saveConfig(config) {
  try {
    const configDir = dirname(CONFIG_FILE)
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
    console.log('[全局AI配置] 配置保存成功')
    
    // 更新缓存
    globalConfig = config
    configLastLoaded = Date.now()
    
  } catch (error) {
    console.error('[全局AI配置] 保存配置失败:', error)
    throw error
  }
}

/**
 * 获取当前全局配置
 */
export function getGlobalAIConfig() {
  return loadConfig()
}

/**
 * 更新全局配置
 */
export function updateGlobalAIConfig(newConfig) {
  const updatedConfig = {
    ...getGlobalAIConfig(),
    ...newConfig,
    updatedAt: new Date().toISOString()
  }
  
  saveConfig(updatedConfig)
  return updatedConfig
}

/**
 * 验证配置是否有效
 */
export function validateConfig(config) {
  const errors = []
  
  if (!config.baseUrl) {
    errors.push('Base URL不能为空')
  }
  
  if (!config.apiKey) {
    errors.push('API Key不能为空')
  }
  
  if (config.baseUrl && !config.baseUrl.startsWith('http')) {
    errors.push('Base URL必须是有效的HTTP(S)地址')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 测试API连接
 */
export async function testAPIConnection(config) {
  try {
    const testConfig = config || getGlobalAIConfig()
    
    const response = await fetch(`${testConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testConfig.apiKey}`
      },
      body: JSON.stringify({
        model: testConfig.modelName || 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: '你好，请回复"连接测试成功"'
          }
        ],
        max_tokens: 10,
        temperature: 0
      }),
      signal: AbortSignal.timeout(testConfig.timeout || 30000)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API调用失败 [${response.status}]: ${errorText}`)
    }
    
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    
    return {
      success: true,
      message: 'API连接测试成功',
      response: content,
      usage: data.usage || {}
    }
    
  } catch (error) {
    console.error('[全局AI配置] API连接测试失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 获取配置摘要（用于显示，不包含敏感信息）
 */
export function getConfigSummary() {
  const config = getGlobalAIConfig()
  return {
    baseUrl: config.baseUrl,
    modelName: config.modelName,
    hasApiKey: !!config.apiKey,
    isConfigured: !!(config.baseUrl && config.apiKey),
    updatedAt: config.updatedAt
  }
}