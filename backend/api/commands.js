import { parseMarkdownFiles, extractTitle, extractDescription } from '../parsers/markdown.js'
import path from 'path'

const COMMANDS_DIR = path.resolve('..', '.iflow', 'commands', 'niopd')

/**
 * 获取所有命令列表
 */
export function getAllCommands() {
  const files = parseMarkdownFiles(COMMANDS_DIR)

  return files.map(file => {
    const title = extractTitle(file.content) || file.name
    const description = extractDescription(file.content)

    // 从文件名推断命令类别
    let category = 'other'
    if (file.name.includes('org-update')) {
      category = 'evolution'
    } else if (['init', 'hi', 'help', 'note'].includes(file.name)) {
      category = 'workflow'
    } else if (['analyze', 'research', 'summarize'].some(word => file.name.includes(word))) {
      category = 'analysis'
    } else if (['generate', 'create', 'draft', 'write'].some(word => file.name.includes(word))) {
      category = 'generation'
    } else if (['track', 'update', 'launch'].some(word => file.name.includes(word))) {
      category = 'management'
    }

    return {
      name: file.name,
      fullName: `/niopd:${file.name}`,
      title,
      description,
      category,
      filename: file.filename,
      content: file.content,
      metadata: file.metadata,
      createdAt: file.createdAt,
      modifiedAt: file.modifiedAt
    }
  })
}

/**
 * 获取组织更新系统相关的命令
 */
export function getOrgUpdateCommands() {
  const allCommands = getAllCommands()
  return allCommands.filter(cmd => cmd.name.includes('org-update'))
}

/**
 * 按类别分组命令
 */
export function getCommandsByCategory() {
  const allCommands = getAllCommands()
  const grouped = {}

  for (const command of allCommands) {
    if (!grouped[command.category]) {
      grouped[command.category] = []
    }
    grouped[command.category].push(command)
  }

  return grouped
}

/**
 * 获取单个命令详情
 */
export function getCommandByName(name) {
  const allCommands = getAllCommands()
  return allCommands.find(cmd => cmd.name === name)
}
