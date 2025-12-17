const API_BASE = import.meta.env.VITE_API_BASE || '/api'

/**
 * 通用 API 请求封装
 */
async function fetchAPI(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'API request failed')
    }

    return result.data
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    throw error
  }
}

// ==================== 命令相关 API ====================

/**
 * 获取所有命令
 */
export const fetchCommands = () => fetchAPI('/commands')

/**
 * 获取组织更新系统命令
 */
export const fetchOrgUpdateCommands = () => fetchAPI('/commands/org-update')

/**
 * 按类别获取命令
 */
export const fetchCommandsByCategory = () => fetchAPI('/commands/by-category')

/**
 * 获取单个命令详情
 */
export const fetchCommandByName = (name) => fetchAPI(`/commands/${name}`)

// ==================== 代理相关 API ====================

/**
 * 获取所有代理
 */
export const fetchAgents = () => fetchAPI('/agents')

/**
 * 获取 2.0 新增代理
 */
export const fetchV2Agents = () => fetchAPI('/agents/v2-only')

/**
 * 获取单个代理详情
 */
export const fetchAgentByName = (name) => fetchAPI(`/agents/${name}`)

// ==================== 模板相关 API ====================

/**
 * 获取所有模板
 */
export const fetchTemplates = () => fetchAPI('/templates')

/**
 * 按类型获取模板
 */
export const fetchTemplatesByType = () => fetchAPI('/templates/by-type')

/**
 * 获取 SOP 模板
 */
export const fetchSOPTemplates = () => fetchAPI('/templates/sop')

/**
 * 获取单个模板详情
 */
export const fetchTemplateByName = (name) => fetchAPI(`/templates/${name}`)

// ==================== 工作区相关 API ====================

/**
 * 获取工作区统计信息
 */
export const fetchWorkspaceStats = () => fetchAPI('/workspace/stats')

/**
 * 获取所有 initiative
 */
export const fetchInitiatives = () => fetchAPI('/workspace/initiatives')

/**
 * 获取工作区时间线
 */
export const fetchWorkspaceTimeline = () => fetchAPI('/workspace/timeline')

/**
 * 获取活动热力图数据
 */
export const fetchActivityHeatmap = () => fetchAPI('/workspace/heatmap')

// ==================== 健康检查 ====================

/**
 * 检查 API 服务器是否运行
 */
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`)
    const result = await response.json()
    return result.success
  } catch (error) {
    return false
  }
}
