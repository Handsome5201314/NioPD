import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

/**
 * 解析指定目录下的所有 Markdown 文件
 * @param {string} directory - 目录路径
 * @returns {Array} 解析后的文件数组
 */
export function parseMarkdownFiles(directory) {
  try {
    if (!fs.existsSync(directory)) {
      console.warn(`Directory not found: ${directory}`)
      return []
    }

    const files = fs.readdirSync(directory)

    return files
      .filter(f => f.endsWith('.md'))
      .map(file => {
        try {
          const filePath = path.join(directory, file)
          const content = fs.readFileSync(filePath, 'utf8')
          const { data, content: body } = matter(content)

          // 获取文件统计信息
          const stats = fs.statSync(filePath)

          return {
            filename: file,
            name: file.replace('.md', ''),
            metadata: data,
            content: body,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            size: stats.size
          }
        } catch (error) {
          console.error(`Error parsing file ${file}:`, error.message)
          return null
        }
      })
      .filter(Boolean) // 移除解析失败的文件
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error.message)
    return []
  }
}

/**
 * 解析单个 Markdown 文件
 * @param {string} filePath - 文件路径
 * @returns {Object|null} 解析后的文件对象
 */
export function parseMarkdownFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null
    }

    const content = fs.readFileSync(filePath, 'utf8')
    const { data, content: body } = matter(content)
    const stats = fs.statSync(filePath)

    return {
      filename: path.basename(filePath),
      name: path.basename(filePath, '.md'),
      metadata: data,
      content: body,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      size: stats.size
    }
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error.message)
    return null
  }
}

/**
 * 递归扫描目录下的所有 Markdown 文件
 * @param {string} directory - 目录路径
 * @returns {Array} 所有 Markdown 文件的路径
 */
export function scanMarkdownFilesRecursive(directory) {
  const results = []

  try {
    if (!fs.existsSync(directory)) {
      return results
    }

    const items = fs.readdirSync(directory)

    for (const item of items) {
      const fullPath = path.join(directory, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        // 递归扫描子目录
        results.push(...scanMarkdownFilesRecursive(fullPath))
      } else if (item.endsWith('.md')) {
        results.push(fullPath)
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${directory}:`, error.message)
  }

  return results
}

/**
 * 从内容中提取第一级标题
 * @param {string} content - Markdown 内容
 * @returns {string|null} 标题文本
 */
export function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

/**
 * 从内容中提取描述（第一段文本）
 * @param {string} content - Markdown 内容
 * @returns {string} 描述文本
 */
export function extractDescription(content) {
  // 移除标题行
  const withoutTitle = content.replace(/^#.*$/gm, '').trim()
  // 获取第一段
  const firstParagraph = withoutTitle.split('\n\n')[0]
  return firstParagraph ? firstParagraph.trim() : ''
}
