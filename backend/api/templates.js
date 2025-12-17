import { parseMarkdownFiles, extractTitle, extractDescription } from '../parsers/markdown.js'
import path from 'path'

const TEMPLATES_DIR = path.resolve('..', '.iflow', 'templates')

/**
 * 获取所有模板列表
 */
export function getAllTemplates() {
  const files = parseMarkdownFiles(TEMPLATES_DIR)

  return files.map(file => {
    const title = extractTitle(file.content) || file.name
    const description = extractDescription(file.content)

    // 从文件名推断模板类型
    let type = 'other'
    if (file.name.includes('sop')) {
      type = 'sop'
    } else if (file.name.includes('prd')) {
      type = 'prd'
    } else if (file.name.includes('initiative')) {
      type = 'initiative'
    } else if (file.name.includes('report') || file.name.includes('analysis') || file.name.includes('summary')) {
      type = 'report'
    } else if (file.name.includes('story')) {
      type = 'story'
    } else if (file.name.includes('persona')) {
      type = 'persona'
    } else if (file.name.includes('roadmap')) {
      type = 'roadmap'
    } else if (file.name.includes('kpi')) {
      type = 'kpi'
    } else if (file.name.includes('update')) {
      type = 'update'
    }

    return {
      name: file.name,
      title,
      description,
      type,
      filename: file.filename,
      content: file.content,
      metadata: file.metadata,
      createdAt: file.createdAt,
      modifiedAt: file.modifiedAt,
      size: file.size
    }
  })
}

/**
 * 按类型分组模板
 */
export function getTemplatesByType() {
  const allTemplates = getAllTemplates()
  const grouped = {}

  for (const template of allTemplates) {
    if (!grouped[template.type]) {
      grouped[template.type] = []
    }
    grouped[template.type].push(template)
  }

  return grouped
}

/**
 * 获取单个模板详情
 */
export function getTemplateByName(name) {
  const allTemplates = getAllTemplates()
  return allTemplates.find(tpl => tpl.name === name)
}

/**
 * 获取 SOP 模板列表
 */
export function getSOPTemplates() {
  const allTemplates = getAllTemplates()
  return allTemplates.filter(tpl => tpl.type === 'sop')
}
