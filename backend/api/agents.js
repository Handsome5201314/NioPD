import { parseMarkdownFiles, extractTitle, extractDescription } from '../parsers/markdown.js'
import path from 'path'
import fs from 'fs'

const AGENTS_DIR = path.resolve('..', '.iflow', 'agents', 'niopd')
const AGENT_SKILLS_FILE = path.resolve('backend', 'config', 'agent-skills.json')

/**
 * 加载代理技能配置
 */
function loadAgentSkills() {
  try {
    if (fs.existsSync(AGENT_SKILLS_FILE)) {
      const content = fs.readFileSync(AGENT_SKILLS_FILE, 'utf8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error('Error loading agent skills:', error.message)
  }
  return {}
}

/**
 * 从代理内容中提取角色信息
 */
function extractRole(content) {
  // 查找 "You are a ..." 或 "Role: ..." 模式
  const rolePatterns = [
    /You are (?:a |an |the )?([^.]+)\./i,
    /Role:\s*([^.\n]+)/i,
    /#\s*([^\n]+)/  // 标题作为角色
  ]

  for (const pattern of rolePatterns) {
    const match = content.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return null
}

/**
 * 从代理内容中提取工具列表
 */
function extractTools(content, metadata) {
  // 优先使用 metadata 中的 tools
  if (metadata.tools && Array.isArray(metadata.tools)) {
    return metadata.tools
  }

  // 从内容中提取
  const toolsSection = content.match(/##\s*Tools[^#]*([\s\S]*?)(?=##|$)/i)
  if (toolsSection) {
    const tools = []
    const lines = toolsSection[1].split('\n')
    for (const line of lines) {
      const match = line.match(/[-*]\s*([A-Z][a-zA-Z]+)/i)
      if (match) {
        tools.push(match[1])
      }
    }
    return tools
  }

  return []
}

/**
 * 获取所有代理列表
 */
export function getAllAgents() {
  const files = parseMarkdownFiles(AGENTS_DIR)
  const skills = loadAgentSkills()

  return files.map(file => {
    const title = extractTitle(file.content) || file.name
    const description = extractDescription(file.content)
    const role = extractRole(file.content) || file.metadata.role
    const tools = extractTools(file.content, file.metadata)
    const color = file.metadata.color || '#1890ff'

    // 判断是否为 2.0 版本新增
    const isV2Only = ['nio', 'ai-assistant', 'automation-engineer'].includes(file.name)

    return {
      name: file.name,
      title,
      description,
      role,
      tools,
      color,
      isV2Only,
      skills: skills[file.name] || null,
      filename: file.filename,
      content: file.content,
      metadata: file.metadata,
      createdAt: file.createdAt,
      modifiedAt: file.modifiedAt
    }
  })
}

/**
 * 获取单个代理详情
 */
export function getAgentByName(name) {
  const allAgents = getAllAgents()
  return allAgents.find(agent => agent.name === name)
}

/**
 * 获取 2.0 新增的代理
 */
export function getV2Agents() {
  const allAgents = getAllAgents()
  return allAgents.filter(agent => agent.isV2Only)
}
