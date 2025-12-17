import React, { useState, useRef, useEffect } from 'react'
import './WorkbenchViewV2.css'

const WorkbenchViewV2 = ({ user }) => {
  const [userInput, setUserInput] = useState('')
  const [conversations, setConversations] = useState([])
  const [savedConversations, setSavedConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [activeExperts, setActiveExperts] = useState([])
  const [currentIteration, setCurrentIteration] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showHistory, setShowHistory] = useState(true)
  const messagesEndRef = useRef(null)

  // 专家数据
  const allExperts = [
    { id: 'nio', name: 'nio', role: '核心编排代理', avatar: '🎯', color: '#667eea' },
    { id: 'product-manager', name: 'product-manager', role: '产品经理', avatar: '📋', color: '#f093fb' },
    { id: 'tech-architect', name: 'tech-architect', role: '技术架构师', avatar: '🏗️', color: '#4facfe' },
    { id: 'ux-designer', name: 'ux-designer', role: 'UX设计师', avatar: '🎨', color: '#fa709a' },
    { id: 'data-analyst', name: 'data-analyst', role: '数据分析师', avatar: '📊', color: '#30cfd0' },
    { id: 'qa-engineer', name: 'qa-engineer', role: 'QA工程师', avatar: '🔍', color: '#a8edea' }
  ]

  // 获取专家信息
  const getExpertInfo = (expertId) => {
    return allExperts.find(e => e.id === expertId) || { id: expertId, name: expertId, role: expertId, avatar: '🤖', color: '#999' }
  }

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversations])

  // 加载已保存的对话列表
  useEffect(() => {
    loadSavedConversations()
  }, [])

  const loadSavedConversations = async () => {
    try {
      const token = localStorage.getItem('userToken')
      const response = await fetch('/api/user/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()
      if (result.success) {
        setSavedConversations(result.data || [])
      }
    } catch (err) {
      console.error('加载对话历史失败:', err)
    }
  }

  // 加载特定对话
  const loadConversation = (conv) => {
    setConversations(conv.messages || [])
    setCurrentIteration(conv.iteration || 0)
    setCurrentConversationId(conv.id)

    // 提取活跃专家
    const experts = new Set()
    conv.messages.forEach(msg => {
      if (msg.experts) {
        msg.experts.forEach(exp => experts.add(exp))
      }
      if (msg.expertId) {
        experts.add(msg.expertId)
      }
    })
    setActiveExperts(Array.from(experts).map(getExpertInfo))
  }

  // 新建对话
  const newConversation = () => {
    if (conversations.length > 0 && !currentConversationId) {
      const confirm = window.confirm('当前对话未保存，确定要新建对话吗？')
      if (!confirm) return
    }

    setConversations([])
    setCurrentIteration(0)
    setCurrentConversationId(null)
    setActiveExperts([])
    setUserInput('')
  }

  // 处理用户输入
  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString()
    }

    setConversations(prev => [...prev, newMessage])
    const currentInput = userInput
    setUserInput('')
    setIsProcessing(true)

    try {
      const token = localStorage.getItem('userToken')

      // 构建对话历史（最近6条消息）
      const recentHistory = conversations.slice(-6).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userInput: currentInput,
          conversationHistory: recentHistory
        })
      })

      const result = await response.json()

      if (result.success) {
        // 更新活跃专家
        const expertsData = result.data.experts.map(getExpertInfo)
        setActiveExperts(expertsData)

        // 为每个专家创建独立的消息
        const expertMessages = []
        result.data.expertResponses.forEach((exp, index) => {
          const expertInfo = getExpertInfo(exp.expertId)
          expertMessages.push({
            id: Date.now() + index + 1,
            type: 'expert',
            expertId: exp.expertId,
            expertName: exp.expertName || expertInfo.role,
            avatar: expertInfo.avatar,
            color: expertInfo.color,
            content: exp.content,
            timestamp: new Date().toLocaleTimeString(),
            iteration: currentIteration + 1
          })
        })

        // 添加nio综合建议（如果不是nio的独立回复）
        if (!result.data.expertResponses.some(e => e.expertId === 'nio')) {
          const nioInfo = getExpertInfo('nio')
          expertMessages.push({
            id: Date.now() + expertMessages.length + 1,
            type: 'expert',
            expertId: 'nio',
            expertName: 'nio综合建议',
            avatar: nioInfo.avatar,
            color: nioInfo.color,
            content: result.data.response,
            timestamp: new Date().toLocaleTimeString(),
            iteration: currentIteration + 1,
            isNioSummary: true
          })
        }

        setConversations(prev => [...prev, ...expertMessages])

        console.log('[AI对话] 成功，编排方法:', result.data.orchestrationMethod)

        // 自动保存对话
        autoSaveConversation([...conversations, newMessage, ...expertMessages])
      } else {
        const errorResponse = {
          id: Date.now() + 1,
          type: 'system',
          content: `⚠️ AI服务调用失败：${result.error}\n\n${result.error.includes('API配置') ? '请前往"模型配置"页面设置您的API密钥和端点。' : '请检查您的API配置或网络连接。'}`,
          timestamp: new Date().toLocaleTimeString()
        }

        setConversations(prev => [...prev, errorResponse])
      }
    } catch (error) {
      console.error('[AI对话] 网络错误:', error)

      const errorResponse = {
        id: Date.now() + 1,
        type: 'system',
        content: `⚠️ 网络错误：${error.message}\n\n可能原因：\n• 后端服务未启动\n• 网络连接问题\n• API配置不正确\n\n请检查后端服务状态和API配置。`,
        timestamp: new Date().toLocaleTimeString()
      }

      setConversations(prev => [...prev, errorResponse])
    } finally {
      setIsProcessing(false)
    }
  }

  // 自动保存对话到服务端
  const autoSaveConversation = async (messages) => {
    if (!messages || messages.length === 0) return

    try {
      const token = localStorage.getItem('userToken')

      // 生成对话标题
      const firstUserMessage = messages.find(m => m.type === 'user')
      const title = firstUserMessage
        ? firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '')
        : '未命名对话'

      // 生成预览
      const firstExpertMessage = messages.find(m => m.type === 'expert')
      const preview = firstExpertMessage
        ? firstExpertMessage.content.substring(0, 100) + (firstExpertMessage.content.length > 100 ? '...' : '')
        : ''

      const conversationData = {
        id: currentConversationId,
        title,
        preview,
        messages,
        iteration: currentIteration + 1,
        messageCount: messages.length
      }

      const response = await fetch('/api/user/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(conversationData)
      })

      const result = await response.json()

      if (result.success) {
        console.log('[自动保存] 对话已保存')
        // 如果是新对话，设置ID
        if (!currentConversationId && result.data?.id) {
          setCurrentConversationId(result.data.id)
        }
        // 刷新对话列表
        loadSavedConversations()
      }
    } catch (err) {
      console.error('[自动保存] 失败:', err)
    }
  }

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 删除对话
  const deleteConversation = async (convId) => {
    if (!window.confirm('确定要删除这个对话吗？')) return

    try {
      const token = localStorage.getItem('userToken')
      const response = await fetch(`/api/user/conversations/${convId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()
      if (result.success) {
        loadSavedConversations()
        if (currentConversationId === convId) {
          newConversation()
        }
      }
    } catch (err) {
      console.error('删除对话失败:', err)
    }
  }

  return (
    <div className="workbench-view-v2">
      <div className="workbench-header">
        <h1 className="workbench-title">🚀 智能工作台</h1>
        <p className="workbench-subtitle">
          AI专家团队协助您完善想法，打造可落地的MVP方案
        </p>
      </div>

      <div className="workbench-container">
        {/* 左侧对话历史 */}
        <div className={`history-sidebar ${showHistory ? 'show' : 'hide'}`}>
          <div className="sidebar-header">
            <h3>💬 对话历史</h3>
            <button className="btn-icon" onClick={newConversation} title="新建对话">
              ➕
            </button>
          </div>

          <div className="history-list">
            {savedConversations.length === 0 ? (
              <div className="empty-history">
                <p>暂无保存的对话</p>
              </div>
            ) : (
              savedConversations.map(conv => (
                <div
                  key={conv.id}
                  className={`history-item ${currentConversationId === conv.id ? 'active' : ''}`}
                  onClick={() => loadConversation(conv)}
                >
                  <div className="history-title">{conv.title}</div>
                  <div className="history-meta">
                    <span>{conv.messageCount} 条消息</span>
                    <span>{new Date(conv.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="history-preview">{conv.preview}</div>
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conv.id)
                    }}
                    title="删除对话"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="sidebar-footer">
            <button className="btn-link" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? '◀ 收起' : '▶ 展开'}
            </button>
          </div>
        </div>

        {/* 主对话区 */}
        <div className="main-conversation">
          <div className="messages-container">
            {conversations.length === 0 && (
              <div className="welcome-message">
                <div className="welcome-icon">💡</div>
                <h3>欢迎使用智能工作台</h3>
                <p>请描述您的产品想法或问题，例如：</p>
                <ul className="example-list">
                  <li>我想做一个在线教育平台，帮助中小学生提升学习效率</li>
                  <li>开发一个智能健身APP，提供个性化训练计划</li>
                  <li>如何优化API响应速度？平均需要2秒，如何提升性能？</li>
                </ul>
              </div>
            )}

            {conversations.map((msg) => (
              <div key={msg.id} className={`message message-${msg.type}`}>
                {msg.type === 'user' ? (
                  <div className="message-user">
                    <div className="message-avatar">👤</div>
                    <div className="message-bubble">
                      <div className="message-header">
                        <span className="message-sender">您</span>
                        <span className="message-time">{msg.timestamp}</span>
                      </div>
                      <div className="message-content">{msg.content}</div>
                    </div>
                  </div>
                ) : msg.type === 'expert' ? (
                  <div className="message-expert">
                    <div className="expert-avatar" style={{ backgroundColor: msg.color }}>
                      {msg.avatar}
                    </div>
                    <div className="expert-bubble">
                      <div className="expert-header">
                        <div className="expert-name-group">
                          <span className="expert-name">{msg.expertName}</span>
                          {msg.isNioSummary && <span className="nio-badge">综合建议</span>}
                        </div>
                        <span className="expert-time">{msg.timestamp}</span>
                      </div>
                      <div className="expert-content">
                        {msg.content.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="message-system">
                    <div className="system-icon">⚙️</div>
                    <div className="system-content">{msg.content}</div>
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="message-loading">
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
                <span>AI专家团队正在分析...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入您的想法或问题... (Enter发送，Shift+Enter换行)"
              rows={3}
              disabled={isProcessing}
            />
            <div className="input-actions">
              <button
                className="btn btn-primary"
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isProcessing}
              >
                {isProcessing ? '发送中...' : '发送'}
              </button>
              <span className="hint-text">对话将自动保存</span>
            </div>
          </div>
        </div>

        {/* 右侧专家面板 */}
        <div className="experts-sidebar">
          <div className="sidebar-header">
            <h3>🎯 活跃专家</h3>
            <span className="experts-count">{activeExperts.length}</span>
          </div>

          {activeExperts.length === 0 ? (
            <div className="empty-experts">
              <div className="empty-icon">👥</div>
              <p>发送消息后，nio将智能调动相关专家为您提供建议</p>
            </div>
          ) : (
            <div className="experts-list">
              {activeExperts.map((expert) => (
                <div key={expert.id} className="expert-card">
                  <div className="expert-card-header">
                    <span className="expert-card-avatar" style={{ backgroundColor: expert.color }}>
                      {expert.avatar}
                    </span>
                    <div className="expert-card-info">
                      <h4>{expert.role}</h4>
                      <span className="expert-status">● 在线</span>
                    </div>
                  </div>
                  <div className="expert-description">
                    {expert.id === 'nio' && '负责需求分析和专家协调'}
                    {expert.id === 'product-manager' && '负责产品规划和需求分析'}
                    {expert.id === 'tech-architect' && '负责技术选型和架构设计'}
                    {expert.id === 'ux-designer' && '负责用户体验和界面设计'}
                    {expert.id === 'data-analyst' && '负责数据分析和指标体系'}
                    {expert.id === 'qa-engineer' && '负责质量保障和测试策略'}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="sidebar-footer">
            <button className="btn-link" onClick={() => window.location.href = '#/model-config'}>
              ⚙️ 配置模型
            </button>
          </div>
        </div>
      </div>

      {/* 收起/展开历史侧边栏的按钮 */}
      <button
        className="toggle-history-btn"
        onClick={() => setShowHistory(!showHistory)}
        title={showHistory ? '收起历史' : '展开历史'}
      >
        {showHistory ? '◀' : '▶'}
      </button>
    </div>
  )
}

export default WorkbenchViewV2
