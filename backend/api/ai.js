/**
 * AI对话API路由 - 全局配置版本
 * 简化配置管理，统一使用全局AI配置
 */

import fs from 'fs'
import { 
  intelligentConversation, 
  getExpertList, 
  getExpert, 
  addCustomExpert, 
  removeCustomExpert 
} from '../services/ai-service.js'
import { 
  getGlobalAIConfig, 
  updateGlobalAIConfig, 
  validateConfig, 
  testAPIConnection,
  getConfigSummary 
} from '../services/global-ai-config.js'

const CONFIGS_FILE = './api/data/configs.json'

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

/**
 * 从token获取用户ID
 */
function getUserIdFromToken(token) {
  if (!token) return null
  const parts = token.split('_')
  return parts.length === 2 ? parts[1] : null
}

/**
 * 智能对话接口
 * POST /api/ai/chat
 */
export async function chat(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  // 检查全局AI配置
  const globalConfig = getGlobalAIConfig()
  if (!globalConfig.baseUrl || !globalConfig.apiKey) {
    return res.json({
      success: false,
      error: '请先在"模型配置"中设置API密钥和端点'
    })
  }

  const { userInput, conversationHistory = [] } = req.body

  if (!userInput || !userInput.trim()) {
    return res.json({
      success: false,
      error: '用户输入不能为空'
    })
  }

  try {
    console.log(`[AI对话API] 用户 ${userId} 发起对话`)

    // 调用智能对话服务（使用全局配置）
    const result = await intelligentConversation(
      userInput,
      conversationHistory
    )

    if (result.success) {
      res.json({
        success: true,
        data: {
          response: result.finalResponse,
          experts: result.orchestration.experts,
          expertResponses: result.expertResponses.map(r => ({
            expertId: r.expertId,
            expertName: r.expertName,
            content: r.content,
            success: r.success
          })),
          orchestrationMethod: result.orchestration.method,
          orchestrationReasoning: result.orchestration.reasoning
        }
      })
    } else {
      res.json({
        success: false,
        error: result.error || '对话处理失败'
      })
    }
  } catch (error) {
    console.error('[AI对话API] 错误:', error)
    res.json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 获取专家列表
 * GET /api/ai/experts
 */
export function getExperts(req, res) {
  try {
    const experts = getExpertList()
    res.json({
      success: true,
      data: experts
    })
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 获取单个专家详情
 * GET /api/ai/experts/:id
 */
export function getExpertDetail(req, res) {
  try {
    const { id } = req.params
    const expert = getExpert(id)

    if (!expert) {
      return res.json({
        success: false,
        error: '专家不存在'
      })
    }

    res.json({
      success: true,
      data: expert
    })
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 添加自定义专家
 * POST /api/ai/experts/custom
 */
export function addExpert(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  try {
    const expertData = req.body
    const expert = addCustomExpert(expertData)

    res.json({
      success: true,
      data: expert
    })
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 删除自定义专家
 * DELETE /api/ai/experts/custom/:id
 */
export function deleteExpert(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  if (!userId) {
    return res.json({
      success: false,
      error: '未授权'
    })
  }

  try {
    const { id } = req.params
    removeCustomExpert(id)

    res.json({
      success: true,
      data: { id }
    })
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    })
  }
}

// ==================== 全局AI配置管理 API ====================

/**
 * 获取全局AI配置摘要
 * GET /api/ai/config/summary
 */
export function getConfigSummaryAPI(req, res) {
  try {
    const summary = getConfigSummary()
    res.json({
      success: true,
      data: summary
    })
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 获取全局AI配置详情
 * GET /api/ai/config
 */
export function getGlobalConfigAPI(req, res) {
  try {
    const config = getGlobalAIConfig()
    res.json({
      success: true,
      data: config
    })
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 更新全局AI配置
 * POST /api/ai/config
 */
export function updateGlobalConfigAPI(req, res) {
  try {
    const { baseUrl, apiKey, modelName, temperature, maxTokens, timeout } = req.body

    // 验证配置
    const newConfig = {
      baseUrl,
      apiKey,
      modelName,
      temperature: temperature ? parseFloat(temperature) : 0.7,
      maxTokens: maxTokens ? parseInt(maxTokens) : 2000,
      timeout: timeout ? parseInt(timeout) : 30000
    }

    const validation = validateConfig(newConfig)
    if (!validation.isValid) {
      return res.json({
        success: false,
        error: '配置验证失败',
        details: validation.errors
      })
    }

    // 更新配置
    const updatedConfig = updateGlobalAIConfig(newConfig)

    res.json({
      success: true,
      data: {
        message: '全局AI配置更新成功',
        config: getConfigSummary()
      }
    })
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 测试API连接
 * POST /api/ai/config/test
 */
export async function testConfigAPI(req, res) {
  try {
    const { baseUrl, apiKey, modelName } = req.body
    
    const testConfig = {
      baseUrl,
      apiKey,
      modelName: modelName || 'deepseek-chat',
      timeout: 30000
    }

    const result = await testAPIConnection(testConfig)

    res.json({
      success: result.success,
      data: result.success ? {
        message: result.message,
        response: result.response,
        usage: result.usage
      } : {
        error: result.error
      }
    })
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 重置为默认配置
 * POST /api/ai/config/reset
 */
export function resetConfigAPI(req, res) {
  try {
    const defaultConfig = {
      baseUrl: 'https://api.deepseek.com',
      apiKey: 'sk-9cbd9a74e19649839586b3b6a4ea321b',
      modelName: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 2000,
      timeout: 30000
    }

    const updatedConfig = updateGlobalAIConfig(defaultConfig)

    res.json({
      success: true,
      data: {
        message: '已重置为默认配置',
        config: getConfigSummary()
      }
    })
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    })
  }
}