/**
 * AI调用服务 - 全局配置版本
 * 支持多种AI API提供商（OpenAI、硅基流动等）
 * 统一使用全局配置，无需重复配置
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { getGlobalAIConfig } from './global-ai-config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 加载专家提示词配置
let expertPrompts = {}
try {
  const promptsPath = join(__dirname, '../config/expert-prompts.json')
  expertPrompts = JSON.parse(readFileSync(promptsPath, 'utf-8'))
} catch (err) {
  console.error('加载专家提示词配置失败:', err)
}

/**
 * 调用AI API - 使用全局配置
 * @param {Array} messages - 消息数组
 * @param {Object} options - 可选参数
 */
export async function callAI(messages, options = {}) {
  // 使用全局配置
  const globalConfig = getGlobalAIConfig()
  
  const {
    modelName = globalConfig.modelName || 'deepseek-chat',
    temperature = globalConfig.temperature || 0.7,
    maxTokens = globalConfig.maxTokens || 2000
  } = options

  if (!globalConfig.baseUrl || !globalConfig.apiKey) {
    throw new Error('全局AI配置不完整：缺少baseUrl或apiKey，请先在"模型配置"中设置')
  }

  try {
    // 构建请求体（兼容OpenAI格式）
    const requestBody = {
      model: modelName,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
      stream: false,
      ...options
    }

    console.log(`[AI调用] 提供商: 全局配置, 模型: ${modelName}`)

    // 调用API
    const response = await fetch(`${globalConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${globalConfig.apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(globalConfig.timeout || 30000)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`AI API调用失败 [${response.status}]: ${errorText}`)
    }

    const data = await response.json()

    // 提取回复内容
    const content = data.choices?.[0]?.message?.content || ''

    console.log(`[AI调用] 成功，返回长度: ${content.length}字符`)

    return {
      success: true,
      content: content,
      usage: data.usage || {},
      model: data.model || modelName
    }
  } catch (error) {
    console.error('[AI调用] 错误:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * nio核心编排：分析用户输入，决定调用哪些专家
 * @param {string} userInput - 用户输入
 */
export async function nioOrchestrate(userInput) {
  const nioPrompt = expertPrompts.nio?.systemPrompt || '你是破界实验室的核心编排代理nio。'

  const messages = [
    {
      role: 'system',
      content: nioPrompt + '\n\n请分析用户需求，决定需要调动哪些专家。可选专家：product-manager（产品经理）、tech-architect（技术架构师）、ux-designer（UX设计师）、data-analyst（数据分析师）、qa-engineer（QA工程师）。\n\n请用JSON格式回复：{"experts": ["expert-id-1", "expert-id-2"], "reasoning": "选择理由"}'
    },
    {
      role: 'user',
      content: `用户需求：${userInput}\n\n请分析需要调动哪些专家，并说明理由。`
    }
  ]

  const result = await callAI(messages, { temperature: 0.3 })

  if (!result.success) {
    // 降级：使用关键词匹配
    return fallbackExpertSelection(userInput)
  }

  try {
    // 尝试解析JSON
    const jsonMatch = result.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const decision = JSON.parse(jsonMatch[0])
      return {
        experts: decision.experts || [],
        reasoning: decision.reasoning || '智能分析结果',
        method: 'ai'
      }
    }
  } catch (err) {
    console.error('[nio编排] JSON解析失败:', err)
  }

  // 如果AI返回格式不对，降级到关键词匹配
  return fallbackExpertSelection(userInput)
}

/**
 * 降级方案：基于关键词的专家选择
 */
function fallbackExpertSelection(userInput) {
  const experts = []
  const reasons = []

  // 产品相关
  if (/产品|需求|功能|用户|场景|痛点|价值/.test(userInput)) {
    experts.push('product-manager')
    reasons.push('涉及产品需求分析')
  }

  // 技术相关
  if (/技术|架构|开发|实现|代码|系统|后端|前端|数据库|性能|扩展/.test(userInput)) {
    experts.push('tech-architect')
    reasons.push('涉及技术架构设计')
  }

  // 设计相关
  if (/设计|界面|体验|UI|UX|交互|视觉|原型/.test(userInput)) {
    experts.push('ux-designer')
    reasons.push('涉及用户体验设计')
  }

  // 数据相关
  if (/数据|分析|指标|统计|增长|转化|留存|埋点/.test(userInput)) {
    experts.push('data-analyst')
    reasons.push('涉及数据分析')
  }

  // 测试相关
  if (/测试|质量|bug|问题|自动化|性能|安全/.test(userInput)) {
    experts.push('qa-engineer')
    reasons.push('涉及质量保障')
  }

  return {
    experts: experts.length > 0 ? experts : ['product-manager'],
    reasoning: reasons.join('、') || '通用产品咨询',
    method: 'keyword'
  }
}

/**
 * 调用专家进行分析
 * @param {string} expertId - 专家ID
 * @param {string} userInput - 用户输入
 * @param {Array} conversationHistory - 对话历史（可选）
 */
export async function callExpert(expertId, userInput, conversationHistory = []) {
  const expert = expertPrompts[expertId]

  if (!expert) {
    return {
      success: false,
      error: `未找到专家: ${expertId}`
    }
  }

  const systemPrompt = expert.systemPrompt || `你是${expert.role}。`

  // 构建消息
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    // 添加历史对话上下文（最多保留最近3轮）
    ...conversationHistory.slice(-6),
    {
      role: 'user',
      content: userInput
    }
  ]

  console.log(`[专家调用] ${expert.role} (${expertId}) 开始分析`)

  const result = await callAI(messages)

  if (result.success) {
    return {
      success: true,
      expertId: expertId,
      expertName: expert.role,
      content: result.content,
      usage: result.usage
    }
  } else {
    return {
      success: false,
      expertId: expertId,
      expertName: expert.role,
      error: result.error
    }
  }
}

/**
 * nio综合所有专家意见，给出最终建议
 * @param {string} userInput - 用户输入
 * @param {Array} expertResponses - 专家回复列表
 */
export async function nioSynthesize(userInput, expertResponses) {
  const nioPrompt = expertPrompts.nio?.systemPrompt || '你是破界实验室的核心编排代理nio。'

  // 构建专家意见摘要
  const expertOpinions = expertResponses
    .filter(r => r.success)
    .map(r => `【${r.expertName}】\n${r.content}`)
    .join('\n\n---\n\n')

  const messages = [
    {
      role: 'system',
      content: nioPrompt + '\n\n请综合各专家意见，给出结构化的行动建议。要求：1)确认理解需求 2)提炼核心建议(3-5条,带优先级) 3)给出下一步行动。保持简洁专业。'
    },
    {
      role: 'user',
      content: `用户需求：${userInput}\n\n专家意见汇总：\n${expertOpinions}\n\n请综合上述意见，给出最终建议。`
    }
  ]

  console.log('[nio综合] 开始综合各专家意见')

  const result = await callAI(messages)

  return result
}

/**
 * 完整的智能对话流程
 * @param {string} userInput - 用户输入
 * @param {Array} conversationHistory - 对话历史
 */
export async function intelligentConversation(userInput, conversationHistory = []) {
  console.log('\n[智能对话] ========== 开始新一轮对话 ==========')
  console.log('[用户输入]', userInput)

  try {
    // 1. nio编排：决定调用哪些专家
    console.log('\n[步骤1] nio编排决策')
    const orchestration = await nioOrchestrate(userInput)
    console.log('[编排结果]', orchestration)

    // 2. 并行调用所有选定的专家
    console.log('\n[步骤2] 并行调用专家')
    const expertPromises = orchestration.experts.map(expertId =>
      callExpert(expertId, userInput, conversationHistory)
    )
    const expertResponses = await Promise.all(expertPromises)

    // 3. nio综合各专家意见
    console.log('\n[步骤3] nio综合意见')
    const synthesis = await nioSynthesize(userInput, expertResponses)

    console.log('[对话完成] ==========================================\n')

    return {
      success: true,
      orchestration: orchestration,
      expertResponses: expertResponses,
      finalResponse: synthesis.content,
      usage: {
        orchestrationUsage: orchestration.usage || {},
        expertUsages: expertResponses.map(r => r.usage || {}),
        synthesisUsage: synthesis.usage || {}
      }
    }
  } catch (error) {
    console.error('[智能对话] 错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 获取专家列表
 */
export function getExpertList() {
  return Object.values(expertPrompts).map(expert => ({
    id: expert.id,
    name: expert.name,
    role: expert.role,
    expertiseAreas: expert.expertiseAreas || [],
    triggerKeywords: expert.triggerKeywords || []
  }))
}

/**
 * 获取单个专家信息
 */
export function getExpert(expertId) {
  return expertPrompts[expertId] || null
}

/**
 * 添加自定义专家
 */
export function addCustomExpert(expertData) {
  const { id, name, role, systemPrompt, expertiseAreas = [], triggerKeywords = [] } = expertData

  if (!id || !name || !role || !systemPrompt) {
    throw new Error('自定义专家数据不完整')
  }

  expertPrompts[id] = {
    id,
    name,
    role,
    systemPrompt,
    expertiseAreas,
    triggerKeywords,
    custom: true
  }

  return expertPrompts[id]
}

/**
 * 删除自定义专家
 */
export function removeCustomExpert(expertId) {
  const expert = expertPrompts[expertId]

  if (!expert) {
    throw new Error('专家不存在')
  }

  if (!expert.custom) {
    throw new Error('不能删除系统内置专家')
  }

  delete expertPrompts[expertId]
  return true
}