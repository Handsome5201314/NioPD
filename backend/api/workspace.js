import { scanMarkdownFilesRecursive, parseMarkdownFile } from '../parsers/markdown.js'
import path from 'path'
import fs from 'fs'

const WORKSPACE_DIR = path.resolve('..', 'niopd-workspace')

/**
 * 获取工作区统计信息
 */
export function getWorkspaceStats() {
  const stats = {
    totalFiles: 0,
    initiatives: {
      total: 0,
      byStatus: {}
    },
    prds: 0,
    reports: 0,
    roadmaps: 0,
    sources: 0,
    lastActivity: null,
    isEmpty: true
  }

  try {
    // 扫描各个子目录
    const subdirs = ['initiatives', 'prds', 'reports', 'roadmaps', 'sources']

    for (const subdir of subdirs) {
      const dirPath = path.join(WORKSPACE_DIR, subdir)

      if (fs.existsSync(dirPath)) {
        const files = scanMarkdownFilesRecursive(dirPath)

        if (subdir === 'initiatives') {
          stats.initiatives.total = files.length
          // 解析 initiative 文件以获取状态
          for (const filePath of files) {
            const file = parseMarkdownFile(filePath)
            if (file && file.metadata.status) {
              const status = file.metadata.status
              stats.initiatives.byStatus[status] = (stats.initiatives.byStatus[status] || 0) + 1
            }
          }
        } else {
          stats[subdir] = files.length
        }

        stats.totalFiles += files.length

        // 更新最后活动时间
        for (const filePath of files) {
          const stat = fs.statSync(filePath)
          if (!stats.lastActivity || stat.mtime > stats.lastActivity) {
            stats.lastActivity = stat.mtime
          }
        }
      }
    }

    stats.isEmpty = stats.totalFiles === 0

  } catch (error) {
    console.error('Error getting workspace stats:', error.message)
  }

  return stats
}

/**
 * 获取所有 initiative 文件
 */
export function getAllInitiatives() {
  const initiativesDir = path.join(WORKSPACE_DIR, 'initiatives')

  if (!fs.existsSync(initiativesDir)) {
    return []
  }

  const filePaths = scanMarkdownFilesRecursive(initiativesDir)

  return filePaths.map(filePath => {
    const file = parseMarkdownFile(filePath)
    if (!file) return null

    return {
      ...file,
      status: file.metadata.status || 'unknown',
      priority: file.metadata.priority || 'medium',
      owner: file.metadata.owner || null,
      quarter: file.metadata.quarter || null,
      kpis: file.metadata.kpis || []
    }
  }).filter(Boolean)
}

/**
 * 获取工作区时间线数据（用于热力图）
 */
export function getWorkspaceTimeline() {
  const timeline = {}

  try {
    const allFiles = scanMarkdownFilesRecursive(WORKSPACE_DIR)

    for (const filePath of allFiles) {
      const stat = fs.statSync(filePath)
      const date = stat.mtime.toISOString().split('T')[0] // YYYY-MM-DD

      if (!timeline[date]) {
        timeline[date] = {
          date,
          fileCount: 0,
          modifications: 0
        }
      }

      timeline[date].modifications++

      // 如果创建日期和修改日期相同，则计为新建
      if (stat.birthtime.toDateString() === stat.mtime.toDateString()) {
        timeline[date].fileCount++
      }
    }

    // 转换为数组并排序
    return Object.values(timeline).sort((a, b) => new Date(a.date) - new Date(b.date))

  } catch (error) {
    console.error('Error getting workspace timeline:', error.message)
    return []
  }
}

/**
 * 获取文件活动热力图数据
 */
export function getActivityHeatmap() {
  const heatmap = []
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  try {
    const allFiles = scanMarkdownFilesRecursive(WORKSPACE_DIR)
    const activityMap = {}

    // 初始化 24小时 x 7天 的数据结构
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        activityMap[`${day}-${hour}`] = 0
      }
    }

    // 统计文件修改时间
    for (const filePath of allFiles) {
      const stat = fs.statSync(filePath)
      const date = new Date(stat.mtime)
      const day = date.getDay()
      const hour = date.getHours()

      const key = `${day}-${hour}`
      activityMap[key]++
    }

    // 转换为 ECharts 需要的格式 [hour, day, value]
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`
        heatmap.push([hour, day, activityMap[key]])
      }
    }

  } catch (error) {
    console.error('Error generating activity heatmap:', error.message)
  }

  return heatmap
}
