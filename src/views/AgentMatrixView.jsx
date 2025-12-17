import React, { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { fetchAgents } from '../services/api'
import './AgentMatrixView.css'

// 模拟数据作为降级方案 - 完整的19个代理信息
const getMockAgents = () => [
  {
    name: 'nio',
    role: '核心编排代理',
    description: '破界实验室核心编排代理，负责整体流程协调和任务分配',
    scope: '全局流程编排、代理调度、任务协调',
    isV2Only: true,
    skills: { analysis: 85, research: 80, communication: 95, automation: 70, creativity: 90, strategy: 95 }
  },
  {
    name: 'tech-architect',
    role: '技术架构师',
    description: '负责系统架构设计、技术选型和架构评审',
    scope: '架构设计、技术选型、系统设计评审',
    skills: { analysis: 90, research: 85, communication: 80, automation: 75, creativity: 85, strategy: 95 }
  },
  {
    name: 'story-writer',
    role: '故事编写专家',
    description: '专注于用户故事编写和需求描述',
    scope: '用户故事、需求文档、场景描述',
    skills: { analysis: 75, research: 80, communication: 95, automation: 60, creativity: 90, strategy: 70 }
  },
  {
    name: 'feedback-synthesizer',
    role: '反馈综合分析师',
    description: '收集、分析和综合各方反馈意见',
    scope: '反馈收集、意见综合、改进建议',
    skills: { analysis: 95, research: 85, communication: 90, automation: 70, creativity: 75, strategy: 85 }
  },
  {
    name: 'automation-engineer',
    role: '自动化工程师',
    description: '负责流程自动化和工具开发',
    scope: '流程自动化、工具开发、效率优化',
    isV2Only: true,
    skills: { analysis: 80, research: 75, communication: 70, automation: 95, creativity: 85, strategy: 80 }
  },
  {
    name: 'ai-assistant',
    role: 'AI助手',
    description: '通用AI助手，提供智能问答和辅助决策',
    scope: '智能问答、辅助决策、知识检索',
    isV2Only: true,
    skills: { analysis: 85, research: 90, communication: 90, automation: 75, creativity: 85, strategy: 80 }
  },
  {
    name: 'product-manager',
    role: '产品经理',
    description: '负责产品规划、需求管理和路线图制定',
    scope: '产品规划、需求管理、路线图制定',
    skills: { analysis: 85, research: 80, communication: 90, automation: 60, creativity: 85, strategy: 95 }
  },
  {
    name: 'ux-designer',
    role: '用户体验设计师',
    description: '负责用户体验设计和交互原型',
    scope: 'UX设计、交互原型、用户研究',
    skills: { analysis: 80, research: 85, communication: 85, automation: 65, creativity: 95, strategy: 75 }
  },
  {
    name: 'qa-engineer',
    role: '质量保证工程师',
    description: '负责测试计划、质量保证和缺陷管理',
    scope: '测试计划、质量保证、缺陷跟踪',
    skills: { analysis: 90, research: 75, communication: 80, automation: 85, creativity: 70, strategy: 80 }
  },
  {
    name: 'dev-ops',
    role: 'DevOps工程师',
    description: '负责CI/CD、部署和运维自动化',
    scope: 'CI/CD、部署自动化、系统监控',
    skills: { analysis: 80, research: 70, communication: 75, automation: 95, creativity: 75, strategy: 85 }
  },
  {
    name: 'data-analyst',
    role: '数据分析师',
    description: '负责数据分析、指标监控和数据报告',
    scope: '数据分析、指标监控、数据可视化',
    skills: { analysis: 95, research: 90, communication: 80, automation: 80, creativity: 75, strategy: 85 }
  },
  {
    name: 'security-expert',
    role: '安全专家',
    description: '负责安全评审、漏洞扫描和安全加固',
    scope: '安全评审、漏洞扫描、安全加固',
    skills: { analysis: 95, research: 85, communication: 75, automation: 80, creativity: 70, strategy: 90 }
  },
  {
    name: 'doc-writer',
    role: '文档编写专家',
    description: '负责技术文档、用户手册和API文档编写',
    scope: '技术文档、用户手册、API文档',
    skills: { analysis: 75, research: 80, communication: 95, automation: 65, creativity: 85, strategy: 70 }
  },
  {
    name: 'performance-optimizer',
    role: '性能优化专家',
    description: '负责性能分析、优化和性能测试',
    scope: '性能分析、系统优化、压力测试',
    skills: { analysis: 90, research: 85, communication: 75, automation: 85, creativity: 80, strategy: 85 }
  },
  {
    name: 'integration-specialist',
    role: '集成专家',
    description: '负责系统集成、API对接和第三方服务集成',
    scope: '系统集成、API设计、第三方对接',
    skills: { analysis: 85, research: 80, communication: 80, automation: 85, creativity: 75, strategy: 85 }
  },
  {
    name: 'sre',
    role: '站点可靠性工程师',
    description: '负责系统稳定性、可靠性和故障恢复',
    scope: '系统稳定性、故障处理、容灾设计',
    skills: { analysis: 90, research: 80, communication: 80, automation: 90, creativity: 75, strategy: 90 }
  },
  {
    name: 'ml-engineer',
    role: '机器学习工程师',
    description: '负责机器学习模型训练、优化和部署',
    scope: '模型训练、算法优化、ML部署',
    skills: { analysis: 90, research: 95, communication: 75, automation: 85, creativity: 90, strategy: 85 }
  },
  {
    name: 'ui-developer',
    role: '前端开发工程师',
    description: '负责前端开发、组件开发和UI实现',
    scope: '前端开发、组件库、UI实现',
    skills: { analysis: 75, research: 70, communication: 80, automation: 80, creativity: 90, strategy: 70 }
  },
  {
    name: 'backend-developer',
    role: '后端开发工程师',
    description: '负责后端服务开发、API开发和数据库设计',
    scope: '后端服务、API开发、数据库设计',
    skills: { analysis: 85, research: 75, communication: 75, automation: 85, creativity: 80, strategy: 80 }
  }
]

const AgentMatrixView = () => {
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [simulationMode, setSimulationMode] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [activeTab, setActiveTab] = useState('radar')
  const [agents, setAgents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 加载代理数据
  useEffect(() => {
    async function loadAgents() {
      try {
        setIsLoading(true)
        const data = await fetchAgents()
        setAgents(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load agents:', err)
        setError('⚠️ 无法连接后端服务器，使用模拟数据展示（部分功能受限）')
        // 使用模拟数据作为降级方案
        setAgents(getMockAgents())
      } finally {
        setIsLoading(false)
      }
    }
    loadAgents()
  }, [])

  // 雷达图配置
  const getRadarOption = (agent) => {
    // 确保技能数据存在
    const skillsData = agent.skills || {
      analysis: 70,
      research: 70,
      communication: 70,
      automation: 70,
      creativity: 70,
      strategy: 70
    }

    return {
    title: {
      text: agent.name,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: ['技能评分'],
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    radar: {
      indicator: [
        { name: '分析能力', max: 100 },
        { name: '研究能力', max: 100 },
        { name: '沟通能力', max: 100 },
        { name: '自动化', max: 100 },
        { name: '创造力', max: 100 },
        { name: '战略思维', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: 'rgb(118, 134, 158)'
      },
      splitLine: {
        lineStyle: {
          color: [
            'rgba(238, 197, 102, 0.1)',
            'rgba(238, 197, 102, 0.2)',
            'rgba(238, 197, 102, 0.4)',
            'rgba(238, 197, 102, 0.6)',
            'rgba(238, 197, 102, 0.8)',
            'rgba(238, 197, 102, 1)'
          ].reverse()
        }
      },
      splitArea: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(238, 197, 102, 0.5)'
        }
      }
    },
    series: [{
      name: '技能评分',
      type: 'radar',
      data: [{
        value: Object.values(skillsData),
        name: '技能评分',
        itemStyle: {
          color: agent.isV2Only ? '#722ed1' : '#1890ff'
        },
        areaStyle: {
          color: agent.isV2Only ? 'rgba(114, 46, 209, 0.2)' : 'rgba(24, 144, 255, 0.2)'
        }
      }]
    }]
  }
}

  // 模拟对话逻辑
  const simulateConversation = (userInput) => {
    if (!userInput.trim()) return

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString()
    }
    
    setChatMessages(prev => [...prev, userMessage])

    // 简单的关键词匹配来选择合适的代理
    let selectedAgentName = 'nio' // 默认使用nio
    let response = ''

    if (userInput.includes('设计') || userInput.includes('开发') || userInput.includes('技术')) {
      selectedAgentName = 'tech-architect'
      response = '作为技术架构师，我建议我们从系统架构角度来分析这个需求。首先，我们需要考虑技术栈的选择和可扩展性...'
    } else if (userInput.includes('故事') || userInput.includes('内容') || userInput.includes('写作')) {
      selectedAgentName = 'story-writer'
      response = '作为故事编写者，我可以帮您构建一个引人入胜的叙述。让我们从用户的角度出发，思考如何让内容更有吸引力...'
    } else if (userInput.includes('自动化') || userInput.includes('流程') || userInput.includes('效率')) {
      selectedAgentName = 'automation-engineer'
      response = '作为自动化工程师，我专注于优化工作流程。让我们分析当前流程中的瓶颈，并设计自动化解决方案...'
    } else {
      // 使用苏格拉底式提问
      response = '这是一个很有趣的问题。让我先了解一下：您认为这个需求背后的核心目标是什么？有没有考虑过可能的替代方案？'
    }

    const agent = agents.find(a => a.name === selectedAgentName)
    
    // 添加代理回复
    setTimeout(() => {
      const agentMessage = {
        id: Date.now() + 1,
        type: 'agent',
        agent: selectedAgentName,
        content: response,
        timestamp: new Date().toLocaleTimeString()
      }
      
      setChatMessages(prev => [...prev, agentMessage])
    }, 1000)
  }

  const handleSendMessage = () => {
    if (userInput.trim()) {
      simulateConversation(userInput)
      setUserInput('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="agent-matrix-view">
      <div className="module-header">
        <h1 className="module-title">高级代理矩阵</h1>
        <p className="module-description">
          展示所有 {agents.length} 个代理的核心技能和对话模拟
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
            加载代理数据中...
          </div>
        )}
        <div className="agent-tabs">
          <button 
            className={`tab-button ${activeTab === 'radar' ? 'active' : ''}`}
            onClick={() => setActiveTab('radar')}
          >
            代理能力雷达图
          </button>
          <button 
            className={`tab-button ${activeTab === 'simulation' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulation')}
          >
            代理对话模拟器
          </button>
        </div>

        {activeTab === 'radar' && !isLoading && (
          <div className="radar-view">
            <div className="agent-grid">
              {agents.map((agent, index) => (
                <div
                  key={agent.name}
                  className={`agent-card ${agent.isV2Only ? 'v2-only' : ''}`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="agent-header">
                    <div>
                      <h3>{agent.name}</h3>
                      {agent.role && <div className="agent-role">{agent.role}</div>}
                    </div>
                    {agent.isV2Only && <span className="v2-badge">2.0新增</span>}
                  </div>
                  <div className="agent-radar">
                    <ReactECharts
                      option={getRadarOption(agent)}
                      style={{ height: '300px', width: '100%' }}
                    />
                  </div>
                  {agent.description && (
                    <div className="agent-description">
                      <p><strong>描述：</strong>{agent.description}</p>
                    </div>
                  )}
                  {agent.scope && (
                    <div className="agent-scope">
                      <p><strong>工作范围：</strong>{agent.scope}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'simulation' && (
          <div className="simulation-view">
            <div className="simulation-controls">
              <div className="mode-toggle">
                <label>
                  <input 
                    type="checkbox"
                    checked={simulationMode}
                    onChange={(e) => setSimulationMode(e.target.checked)}
                  />
                  苏格拉底式提问模式
                </label>
              </div>
            </div>

            <div className="chat-container">
              <div className="chat-messages">
                {chatMessages.map((message) => (
                  <div 
                    key={message.id}
                    className={`message ${message.type}`}
                  >
                    <div className="message-header">
                      <span className="message-sender">
                        {message.type === 'user' ? '用户' : message.agent}
                      </span>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                    <div className="message-content">
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入您的指令，例如：帮我设计产品SOP..."
                  rows={3}
                />
                <button 
                  className="button button-primary"
                  onClick={handleSendMessage}
                  disabled={!userInput.trim()}
                >
                  发送
                </button>
              </div>
            </div>

            <div className="agent-suggestions">
              <h4>推荐代理</h4>
              <div className="suggestion-list">
                <div className="suggestion-item" onClick={() => setUserInput('帮我设计产品SOP')}>
                  <strong>tech-architect</strong> - 技术架构设计
                </div>
                <div className="suggestion-item" onClick={() => setUserInput('写一个用户故事')}>
                  <strong>story-writer</strong> - 故事编写
                </div>
                <div className="suggestion-item" onClick={() => setUserInput('优化工作流程')}>
                  <strong>automation-engineer</strong> - 自动化流程
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentMatrixView