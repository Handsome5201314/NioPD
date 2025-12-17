import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { fetchOrgUpdateCommands } from '../services/api'
import './ArchitectureView.css'

const ArchitectureView = () => {
  const svgRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [orgUpdateData, setOrgUpdateData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 从真实数据构建组织更新系统流程图
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const commands = await fetchOrgUpdateCommands()

        // 构建流程图数据
        const graphData = buildOrgUpdateGraph(commands)
        setOrgUpdateData(graphData)
        setError(null)
      } catch (err) {
        console.error('Failed to load org-update commands:', err)
        setError('无法加载命令数据，请确保后端服务器正在运行')
        // 使用默认数据
        setOrgUpdateData(getDefaultOrgUpdateData())
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // 构建组织更新系统流程图
  function buildOrgUpdateGraph(commands) {
    const nodes = []
    const links = []

    // 查找关键命令
    const checkCmd = commands.find(c => c.name === 'org-update-check')
    const newCommandCmd = commands.find(c => c.name === 'org-update-new-command')
    const newAgentCmd = commands.find(c => c.name === 'org-update-new-agent')
    const newMemoryCmd = commands.find(c => c.name === 'org-update-new-memory')

    // 添加节点
    if (checkCmd) {
      nodes.push({
        id: 'org-update-check',
        label: checkCmd.fullName,
        type: 'command',
        description: checkCmd.description,
        x: 400,
        y: 100
      })
    }

    // 添加流程节点
    nodes.push(
      {
        id: 'workspace-analysis',
        label: '工作空间分析',
        type: 'process',
        description: '分析当前工作空间结构和文件',
        x: 400,
        y: 200
      },
      {
        id: 'task-pattern',
        label: '任务模式识别',
        type: 'process',
        description: '识别重复任务和优化机会',
        x: 400,
        y: 300
      }
    )

    if (newCommandCmd) {
      nodes.push({
        id: 'org-update-new-command',
        label: newCommandCmd.fullName,
        type: 'command',
        description: newCommandCmd.description,
        x: 200,
        y: 400
      })
    }

    if (newAgentCmd) {
      nodes.push({
        id: 'org-update-new-agent',
        label: newAgentCmd.fullName,
        type: 'command',
        description: newAgentCmd.description,
        x: 400,
        y: 400
      })
    }

    if (newMemoryCmd) {
      nodes.push({
        id: 'org-update-new-memory',
        label: newMemoryCmd.fullName,
        type: 'command',
        description: newMemoryCmd.description,
        x: 600,
        y: 400
      })
    }

    nodes.push({
      id: 'report',
      label: '生成报告',
      type: 'output',
      description: '输出组织更新建议报告',
      x: 400,
      y: 500
    })

    // 添加连线
    links.push(
      { source: 'org-update-check', target: 'workspace-analysis', type: 'flow' },
      { source: 'workspace-analysis', target: 'task-pattern', type: 'flow' },
      { source: 'task-pattern', target: 'org-update-new-command', type: 'option' },
      { source: 'task-pattern', target: 'org-update-new-agent', type: 'option' },
      { source: 'task-pattern', target: 'org-update-new-memory', type: 'option' },
      { source: 'org-update-new-command', target: 'report', type: 'flow' },
      { source: 'org-update-new-agent', target: 'report', type: 'flow' },
      { source: 'org-update-new-memory', target: 'report', type: 'flow' }
    )

    return { nodes, links }
  }

  // 默认数据（后备方案）
  function getDefaultOrgUpdateData() {
    return {
      nodes: [
      {
        id: 'org-update-check',
        label: '/niopd:org-update-check',
        type: 'command',
        description: '检查组织更新机会',
        x: 400,
        y: 100
      },
      {
        id: 'workspace-analysis',
        label: '工作空间分析',
        type: 'process',
        description: '分析当前工作空间结构',
        x: 400,
        y: 200
      },
      {
        id: 'task-pattern',
        label: '任务模式识别',
        type: 'process',
        description: '识别重复任务模式',
        x: 400,
        y: 300
      },
      {
        id: 'org-update-new-command',
        label: '/niopd:org-update-new-command',
        type: 'command',
        description: '创建新命令',
        x: 200,
        y: 400
      },
      {
        id: 'org-update-new-agent',
        label: '/niopd:org-update-new-agent',
        type: 'command',
        description: '创建新代理',
        x: 400,
        y: 400
      },
      {
        id: 'org-update-new-memory',
        label: '/niopd:org-update-new-memory',
        type: 'command',
        description: '记录个人工作习惯',
        x: 600,
        y: 400
      },
      {
        id: 'report',
        label: '生成报告',
        type: 'output',
        description: '输出组织更新报告',
        x: 400,
        y: 500
      }
    ],
    links: [
      {
        source: 'org-update-check',
        target: 'workspace-analysis',
        type: 'flow'
      },
      {
        source: 'workspace-analysis',
        target: 'task-pattern',
        type: 'flow'
      },
      {
        source: 'task-pattern',
        target: 'org-update-new-command',
        type: 'option'
      },
      {
        source: 'task-pattern',
        target: 'org-update-new-agent',
        type: 'option'
      },
      {
        source: 'task-pattern',
        target: 'org-update-new-memory',
        type: 'option'
      },
      {
        source: 'org-update-new-command',
        target: 'report',
        type: 'flow'
      },
      {
        source: 'org-update-new-agent',
        target: 'report',
        type: 'flow'
      },
      {
        source: 'org-update-new-memory',
        target: 'report',
        type: 'flow'
      }
    ]
    }
  }

  // 绘制流程图
  useEffect(() => {
    if (!svgRef.current || !orgUpdateData) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 600

    // 创建箭头标记
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 13)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')

    // 创建连线
    const links = svg.selectAll('.link')
      .data(orgUpdateData.links)
      .enter()
      .append('g')
      .attr('class', 'link')

    links.append('line')
      .attr('x1', d => {
        const node = orgUpdateData.nodes.find(n => n.id === d.source)
        return node ? node.x : 0
      })
      .attr('y1', d => {
        const node = orgUpdateData.nodes.find(n => n.id === d.source)
        return node ? node.y : 0
      })
      .attr('x2', d => {
        const node = orgUpdateData.nodes.find(n => n.id === d.target)
        return node ? node.x : 0
      })
      .attr('y2', d => {
        const node = orgUpdateData.nodes.find(n => n.id === d.target)
        return node ? node.y : 0
      })
      .attr('stroke', d => d.type === 'flow' ? '#1890ff' : '#52c41a')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)')
      .attr('stroke-dasharray', d => d.type === 'option' ? '5,5' : '0')

    // 创建节点组
    const nodes = svg.selectAll('.node')
      .data(orgUpdateData.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d)
      })
      .on('mouseenter', function(event, d) {
        d3.select(this).select('rect')
          .attr('stroke', '#1890ff')
          .attr('stroke-width', 2)
      })
      .on('mouseleave', function(event, d) {
        d3.select(this).select('rect')
          .attr('stroke', '#d9d9d9')
          .attr('stroke-width', 1)
      })

    // 添加节点背景
    nodes.append('rect')
      .attr('x', -80)
      .attr('y', -20)
      .attr('width', 160)
      .attr('height', 40)
      .attr('rx', 4)
      .attr('fill', d => {
        switch (d.type) {
          case 'command': return '#e6f7ff'
          case 'process': return '#f6ffed'
          case 'output': return '#fff2e8'
          default: return '#f9f0ff'
        }
      })
      .attr('stroke', '#d9d9d9')
      .attr('stroke-width', 1)

    // 添加节点文本
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .text(d => d.label)
      .style('font-size', '12px')
      .style('fill', '#262626')

  }, [orgUpdateData])

  const handleRunAnimation = () => {
    if (!svgRef.current || isAnimating) return

    setIsAnimating(true)
    const svg = d3.select(svgRef.current)

    // 创建动画路径
    const animationPath = [
      'org-update-check',
      'workspace-analysis',
      'task-pattern',
      'org-update-new-agent',
      'report'
    ]

    let currentIndex = 0

    const animateStep = () => {
      if (currentIndex >= animationPath.length - 1) {
        setIsAnimating(false)
        return
      }

      const currentId = animationPath[currentIndex]
      const nextId = animationPath[currentIndex + 1]

      const currentNode = orgUpdateData.nodes.find(n => n.id === currentId)
      const nextNode = orgUpdateData.nodes.find(n => n.id === nextId)

      // 如果找不到节点，跳过这一步
      if (!currentNode || !nextNode) {
        console.warn('Animation node not found:', currentId, nextId)
        currentIndex++
        if (currentIndex < animationPath.length - 1) {
          setTimeout(animateStep, 200)
        } else {
          setIsAnimating(false)
        }
        return
      }

      // 高亮当前节点
      svg.selectAll('.node rect')
        .attr('fill', d => d.id === currentId ? '#1890ff' :
          d.type === 'command' ? '#e6f7ff' :
          d.type === 'process' ? '#f6ffed' :
          d.type === 'output' ? '#fff2e8' : '#f9f0ff')

      // 创建动画箭头
      const arrow = svg.append('circle')
        .attr('r', 6)
        .attr('fill', '#52c41a')
        .attr('cx', currentNode.x)
        .attr('cy', currentNode.y)

      arrow.transition()
        .duration(1000)
        .attr('cx', nextNode.x)
        .attr('cy', nextNode.y)
        .on('end', () => {
          arrow.remove()
          currentIndex++
          setTimeout(animateStep, 200)
        })
    }

    animateStep()
  }

  const handleExportImage = () => {
    if (!svgRef.current) return

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = 800
    canvas.height = 600

    img.onload = () => {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      
      const link = document.createElement('a')
      link.download = 'niopd-architecture.png'
      link.href = canvas.toDataURL()
      link.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="architecture-view">
      <div className="module-header">
        <h1 className="module-title">动态架构图：组织更新系统</h1>
        <p className="module-description">
          交互式展示破界实验室组织更新系统的命令执行流程和参数说明
        </p>
      </div>

      <div className="module-content">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {isLoading && (
          <div className="loading-indicator">
            加载中...
          </div>
        )}
        <div className="architecture-controls">
          <button 
            className={`button ${isAnimating ? 'button-secondary' : 'button-primary'}`}
            onClick={handleRunAnimation}
            disabled={isAnimating}
          >
            {isAnimating ? '正在执行动画...' : '运行执行动画'}
          </button>
          <button className="button button-secondary" onClick={handleExportImage}>
            导出为图片
          </button>
        </div>

        <div className="architecture-diagram">
          <svg ref={svgRef} width="800" height="600"></svg>
        </div>

        {selectedNode && (
          <div className="node-details">
            <div className="node-details-header">
              <h3>{selectedNode.label}</h3>
              <button 
                className="button button-secondary button-sm"
                onClick={() => setSelectedNode(null)}
              >
                ✕
              </button>
            </div>
            <div className="node-details-content">
              <p><strong>类型：</strong>{selectedNode.type}</p>
              <p><strong>描述：</strong>{selectedNode.description}</p>
              {selectedNode.type === 'command' && (
                <div className="command-examples">
                  <strong>使用示例：</strong>
                  <pre>{`${selectedNode.label}`}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ArchitectureView