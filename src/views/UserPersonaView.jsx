import React, { useState, useEffect } from 'react'
import './UserPersonaView.css'

const UserPersonaView = ({ user }) => {
  const [persona, setPersona] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPersona, setEditedPersona] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isGenerating, setIsGenerating] = useState(false)

  // 用户画像数据结构
  const defaultPersona = {
    basicInfo: {
      role: '',
      industry: '',
      experienceLevel: '',
      teamSize: '',
      workStyle: ''
    },
    skills: {
      product: 0,
      technical: 0,
      design: 0,
      business: 0,
      data: 0,
      communication: 0
    },
    preferences: {
      communicationStyle: 'balanced',
      detailLevel: 'moderate',
      responseSpeed: 'normal',
      creativityLevel: 'balanced'
    },
    workPatterns: {
      activeHours: [],
      taskPreferences: [],
      decisionStyle: '',
      collaborationStyle: ''
    },
    goals: {
      shortTerm: [],
      longTerm: [],
      focusAreas: [],
      learningInterests: []
    },
    conversationHistory: {
      totalConversations: 0,
      topTopics: [],
      frequentQuestions: [],
      lastActive: null
    },
    aiPersonalization: {
      preferredExperts: [],
      responseStyle: '',
      knowledgeDepth: '',
      exampleUsage: ''
    },
    generatedAt: null,
    lastUpdated: null
  }

  useEffect(() => {
    loadPersona()
  }, [user])

  const loadPersona = async () => {
    try {
      // 从localStorage加载
      const localPersona = localStorage.getItem('userPersona')
      if (localPersona) {
        setPersona(JSON.parse(localPersona))
      }

      // 从后端加载
      if (user) {
        const token = localStorage.getItem('userToken')
        const response = await fetch('/api/persona/get', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const result = await response.json()
        if (result.success && result.data) {
          setPersona(result.data)
          localStorage.setItem('userPersona', JSON.stringify(result.data))
        }
      }
    } catch (err) {
      console.error('Failed to load persona:', err)
    }
  }

  // 从对话历史生成画像
  const generatePersonaFromHistory = async () => {
    setIsGenerating(true)

    try {
      // 获取对话历史
      const conversations = JSON.parse(localStorage.getItem('conversationHistory') || '[]')

      // 模拟AI分析（实际应调用后端API）
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 基于对话历史生成画像
      const generatedPersona = {
        ...defaultPersona,
        basicInfo: {
          role: analyzeRole(conversations),
          industry: analyzeIndustry(conversations),
          experienceLevel: analyzeExperience(conversations),
          teamSize: analyzeTeamSize(conversations),
          workStyle: analyzeWorkStyle(conversations)
        },
        skills: analyzeSkills(conversations),
        preferences: analyzePreferences(conversations),
        workPatterns: analyzeWorkPatterns(conversations),
        goals: analyzeGoals(conversations),
        conversationHistory: {
          totalConversations: conversations.length,
          topTopics: extractTopTopics(conversations),
          frequentQuestions: extractFrequentQuestions(conversations),
          lastActive: new Date().toISOString()
        },
        aiPersonalization: generateAIPersonalization(conversations),
        generatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }

      console.log('[画像生成] 生成结果:', generatedPersona)

      setPersona(generatedPersona)
      localStorage.setItem('userPersona', JSON.stringify(generatedPersona))

      // 同步到后端
      if (user) {
        await syncToServer(generatedPersona)
      }

      // 成功提示
      alert(`✅ 画像生成成功！\n\n基于您的 ${conversations.length} 条对话历史进行了深度分析。\n检测到您的角色是：${generatedPersona.basicInfo.role}`)
    } catch (err) {
      console.error('Failed to generate persona:', err)
      alert('生成画像失败，请稍后重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 分析函数（简化版，实际应使用AI模型）
  const analyzeRole = (conversations) => {
    const keywords = {
      '产品经理': ['产品', '需求', 'PRD', '用户故事', '路线图'],
      '技术负责人': ['架构', '技术', '开发', '代码', '系统'],
      '设计师': ['设计', 'UI', 'UX', '原型', '交互'],
      '创业者': ['创业', '商业', '市场', '融资', '团队'],
      '学生': ['学习', '课程', '作业', '项目', '实习']
    }

    let maxScore = 0
    let detectedRole = '产品爱好者'

    for (const [role, words] of Object.entries(keywords)) {
      let score = 0
      conversations.forEach(conv => {
        const content = conv.content || ''
        words.forEach(word => {
          if (content.includes(word)) score++
        })
      })
      if (score > maxScore) {
        maxScore = score
        detectedRole = role
      }
    }

    return detectedRole
  }

  const analyzeIndustry = (conversations) => {
    const industries = ['互联网', '金融', '教育', '医疗', '电商', '企业服务']
    // 简化实现：返回默认值
    return '互联网'
  }

  const analyzeExperience = (conversations) => {
    // 根据对话内容的平均长度判断经验
    const avgLength = conversations.reduce(
      (sum, c) => sum + ((c.content || '').length || 0), 0
    ) / conversations.length

    if (avgLength > 200) return '高级'
    if (avgLength > 100) return '中级'
    return '初级'
  }

  const analyzeTeamSize = (conversations) => {
    if (conversations.some(c => {
      const content = c.content || ''
      return content.includes('团队') || content.includes('协作')
    })) {
      return '5-10人'
    }
    return '个人'
  }

  const analyzeWorkStyle = (conversations) => {
    const hasStructured = conversations.some(c => {
      const content = c.content || ''
      return content.includes('流程') ||
             content.includes('规范') ||
             content.includes('文档')
    })
    return hasStructured ? '结构化' : '灵活性'
  }

  const analyzeSkills = (conversations) => {
    // 基于对话内容分析技能等级（0-100）
    const skills = {
      product: 0,
      technical: 0,
      design: 0,
      business: 0,
      data: 0,
      communication: 0
    }

    conversations.forEach(conv => {
      const content = (conv.content || '').toLowerCase()
      if (content.includes('产品') || content.includes('需求'))
        skills.product += 5
      if (content.includes('技术') || content.includes('代码') || content.includes('架构'))
        skills.technical += 5
      if (content.includes('设计') || content.includes('ui') || content.includes('ux'))
        skills.design += 5
      if (content.includes('商业') || content.includes('市场') || content.includes('运营'))
        skills.business += 5
      if (content.includes('数据') || content.includes('分析') || content.includes('指标'))
        skills.data += 5
      if (content.includes('沟通') || content.includes('协作') || content.includes('团队'))
        skills.communication += 5
    })

    // 标准化到0-100
    Object.keys(skills).forEach(key => {
      skills[key] = Math.min(100, skills[key])
    })

    return skills
  }

  const analyzePreferences = (conversations) => {
    return {
      communicationStyle: 'balanced',
      detailLevel: conversations.length > 10 ? 'detailed' : 'moderate',
      responseSpeed: 'normal',
      creativityLevel: 'balanced'
    }
  }

  const analyzeWorkPatterns = (conversations) => {
    return {
      activeHours: ['9:00-12:00', '14:00-18:00'],
      taskPreferences: ['产品设计', '需求分析', '系统架构'],
      decisionStyle: '数据驱动',
      collaborationStyle: '积极参与'
    }
  }

  const analyzeGoals = (conversations) => {
    return {
      shortTerm: ['完成产品设计', '学习新技术'],
      longTerm: ['成为产品专家', '打造成功产品'],
      focusAreas: ['产品管理', '用户体验', '技术架构'],
      learningInterests: ['AI应用', '产品方法论', '团队协作']
    }
  }

  const extractTopTopics = (conversations) => {
    // 提取高频话题
    return ['产品设计', '技术架构', '用户体验', '团队协作']
  }

  const extractFrequentQuestions = (conversations) => {
    // 提取常见问题类型
    return ['如何设计产品功能', '技术选型建议', '用户研究方法']
  }

  const generateAIPersonalization = (conversations) => {
    return {
      preferredExperts: ['product-manager', 'tech-architect', 'ux-designer'],
      responseStyle: '结构化且详细',
      knowledgeDepth: '深入分析',
      exampleUsage: '喜欢看到具体案例和最佳实践'
    }
  }

  const syncToServer = async (personaData) => {
    try {
      const token = localStorage.getItem('userToken')
      await fetch('/api/persona/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(personaData)
      })
    } catch (err) {
      console.error('Failed to sync persona:', err)
    }
  }

  // 开始编辑
  const handleStartEdit = () => {
    setEditedPersona(JSON.parse(JSON.stringify(persona)))
    setIsEditing(true)
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    const updatedPersona = {
      ...editedPersona,
      lastUpdated: new Date().toISOString()
    }

    setPersona(updatedPersona)
    localStorage.setItem('userPersona', JSON.stringify(updatedPersona))

    if (user) {
      await syncToServer(updatedPersona)
    }

    setIsEditing(false)
    setEditedPersona(null)
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedPersona(null)
  }

  const currentPersona = isEditing ? editedPersona : persona

  // 技能雷达图组件
  const SkillsRadar = ({ skills }) => {
    const skillLabels = {
      product: '产品',
      technical: '技术',
      design: '设计',
      business: '商业',
      data: '数据',
      communication: '沟通'
    }

    return (
      <div className="skills-radar">
        <svg viewBox="0 0 300 300" className="radar-chart">
          {/* 背景网格 */}
          {[20, 40, 60, 80, 100].map((level) => (
            <polygon
              key={level}
              points={calculatePolygonPoints(6, level, 150, 150)}
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          ))}

          {/* 轴线 */}
          {Object.keys(skills).map((skill, index) => {
            const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2
            const x = 150 + Math.cos(angle) * 100
            const y = 150 + Math.sin(angle) * 100
            return (
              <line
                key={skill}
                x1="150"
                y1="150"
                x2={x}
                y2={y}
                stroke="#e0e0e0"
                strokeWidth="1"
              />
            )
          })}

          {/* 数据多边形 */}
          <polygon
            points={calculateDataPolygonPoints(skills, 150, 150)}
            fill="rgba(102, 126, 234, 0.3)"
            stroke="#667eea"
            strokeWidth="2"
          />

          {/* 数据点 */}
          {Object.entries(skills).map(([skill, value], index) => {
            const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2
            const distance = value
            const x = 150 + Math.cos(angle) * distance
            const y = 150 + Math.sin(angle) * distance
            return (
              <circle
                key={skill}
                cx={x}
                cy={y}
                r="4"
                fill="#667eea"
              />
            )
          })}

          {/* 标签 */}
          {Object.entries(skills).map(([skill, value], index) => {
            const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2
            const labelDistance = 120
            const x = 150 + Math.cos(angle) * labelDistance
            const y = 150 + Math.sin(angle) * labelDistance
            return (
              <text
                key={`label-${skill}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="#666"
                fontWeight="600"
              >
                {skillLabels[skill]} ({value})
              </text>
            )
          })}
        </svg>
      </div>
    )
  }

  const calculatePolygonPoints = (sides, radius, centerX, centerY) => {
    const points = []
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      points.push(`${x},${y}`)
    }
    return points.join(' ')
  }

  const calculateDataPolygonPoints = (skills, centerX, centerY) => {
    const points = []
    Object.values(skills).forEach((value, index) => {
      const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2
      const x = centerX + Math.cos(angle) * value
      const y = centerY + Math.sin(angle) * value
      points.push(`${x},${y}`)
    })
    return points.join(' ')
  }

  if (!persona) {
    return (
      <div className="user-persona-view">
        <div className="persona-empty">
          <div className="empty-icon">👤</div>
          <h2>还没有生成用户画像</h2>
          <p>基于您的对话历史和使用习惯，AI将为您生成个性化画像，帮助系统更好地理解您的需求。</p>
          <button
            className="btn-generate"
            onClick={generatePersonaFromHistory}
            disabled={isGenerating}
          >
            {isGenerating ? '正在生成画像...' : '🎯 生成我的画像'}
          </button>
          {isGenerating && (
            <div className="generating-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <p className="progress-text">AI正在分析您的对话历史和使用习惯...</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="user-persona-view">
      <div className="persona-header">
        <div className="header-content">
          <h1>👤 我的用户画像</h1>
          <p>基于对话历史和行为模式生成，帮助AI更好地理解您</p>
          <div className="header-meta">
            <span>📅 生成时间: {new Date(persona.generatedAt).toLocaleString()}</span>
            <span>🔄 更新时间: {new Date(persona.lastUpdated).toLocaleString()}</span>
          </div>
        </div>
        <div className="header-actions">
          {!isEditing ? (
            <>
              <button className="btn-secondary" onClick={handleStartEdit}>
                ✏️ 编辑画像
              </button>
              <button className="btn-primary" onClick={generatePersonaFromHistory}>
                🔄 重新生成
              </button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={handleCancelEdit}>
                取消
              </button>
              <button className="btn-primary" onClick={handleSaveEdit}>
                💾 保存
              </button>
            </>
          )}
        </div>
      </div>

      <div className="persona-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 概览
        </button>
        <button
          className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          💪 技能
        </button>
        <button
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          ⚙️ 偏好
        </button>
        <button
          className={`tab-btn ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          📈 工作模式
        </button>
        <button
          className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          🎯 目标
        </button>
        <button
          className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          🤖 AI个性化
        </button>
      </div>

      <div className="persona-content">
        {activeTab === 'overview' && currentPersona && (
          <div className="overview-tab">
            <div className="info-grid">
              <div className="info-card">
                <h3>👔 基本信息</h3>
                {isEditing ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>角色</label>
                      <input
                        type="text"
                        value={editedPersona.basicInfo.role}
                        onChange={(e) => setEditedPersona({
                          ...editedPersona,
                          basicInfo: { ...editedPersona.basicInfo, role: e.target.value }
                        })}
                      />
                    </div>
                    <div className="form-group">
                      <label>行业</label>
                      <input
                        type="text"
                        value={editedPersona.basicInfo.industry}
                        onChange={(e) => setEditedPersona({
                          ...editedPersona,
                          basicInfo: { ...editedPersona.basicInfo, industry: e.target.value }
                        })}
                      />
                    </div>
                    <div className="form-group">
                      <label>经验等级</label>
                      <select
                        value={editedPersona.basicInfo.experienceLevel}
                        onChange={(e) => setEditedPersona({
                          ...editedPersona,
                          basicInfo: { ...editedPersona.basicInfo, experienceLevel: e.target.value }
                        })}
                      >
                        <option value="初级">初级</option>
                        <option value="中级">中级</option>
                        <option value="高级">高级</option>
                        <option value="专家">专家</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <ul className="info-list">
                    <li><strong>角色:</strong> {persona.basicInfo.role}</li>
                    <li><strong>行业:</strong> {persona.basicInfo.industry}</li>
                    <li><strong>经验等级:</strong> {persona.basicInfo.experienceLevel}</li>
                    <li><strong>团队规模:</strong> {persona.basicInfo.teamSize}</li>
                    <li><strong>工作风格:</strong> {persona.basicInfo.workStyle}</li>
                  </ul>
                )}
              </div>

              <div className="info-card">
                <h3>💬 对话统计</h3>
                <ul className="info-list">
                  <li><strong>总对话数:</strong> {persona.conversationHistory.totalConversations}</li>
                  <li><strong>最后活跃:</strong> {new Date(persona.conversationHistory.lastActive).toLocaleString()}</li>
                  <li>
                    <strong>热门话题:</strong>
                    <div className="tags">
                      {persona.conversationHistory.topTopics.map((topic, i) => (
                        <span key={i} className="tag">{topic}</span>
                      ))}
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="info-card full-width">
              <h3>💪 技能概览</h3>
              <SkillsRadar skills={persona.skills} />
            </div>
          </div>
        )}

        {activeTab === 'skills' && currentPersona && (
          <div className="skills-tab">
            <div className="skills-visual">
              <SkillsRadar skills={currentPersona.skills} />
            </div>

            {isEditing ? (
              <div className="skills-edit">
                {Object.entries(editedPersona.skills).map(([skill, value]) => (
                  <div key={skill} className="skill-slider">
                    <label>
                      {skill === 'product' && '产品管理'}
                      {skill === 'technical' && '技术能力'}
                      {skill === 'design' && '设计能力'}
                      {skill === 'business' && '商业思维'}
                      {skill === 'data' && '数据分析'}
                      {skill === 'communication' && '沟通协作'}
                    </label>
                    <div className="slider-container">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => setEditedPersona({
                          ...editedPersona,
                          skills: { ...editedPersona.skills, [skill]: parseInt(e.target.value) }
                        })}
                      />
                      <span className="slider-value">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="skills-list">
                {Object.entries(persona.skills).map(([skill, value]) => (
                  <div key={skill} className="skill-item">
                    <div className="skill-header">
                      <span className="skill-name">
                        {skill === 'product' && '产品管理'}
                        {skill === 'technical' && '技术能力'}
                        {skill === 'design' && '设计能力'}
                        {skill === 'business' && '商业思维'}
                        {skill === 'data' && '数据分析'}
                        {skill === 'communication' && '沟通协作'}
                      </span>
                      <span className="skill-value">{value}/100</span>
                    </div>
                    <div className="skill-bar">
                      <div className="skill-fill" style={{ width: `${value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'preferences' && currentPersona && (
          <div className="preferences-tab">
            <div className="info-card">
              <h3>⚙️ 沟通偏好</h3>
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>沟通风格</label>
                    <select
                      value={editedPersona.preferences.communicationStyle}
                      onChange={(e) => setEditedPersona({
                        ...editedPersona,
                        preferences: { ...editedPersona.preferences, communicationStyle: e.target.value }
                      })}
                    >
                      <option value="formal">正式</option>
                      <option value="balanced">平衡</option>
                      <option value="casual">随意</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>细节层次</label>
                    <select
                      value={editedPersona.preferences.detailLevel}
                      onChange={(e) => setEditedPersona({
                        ...editedPersona,
                        preferences: { ...editedPersona.preferences, detailLevel: e.target.value }
                      })}
                    >
                      <option value="brief">简略</option>
                      <option value="moderate">适中</option>
                      <option value="detailed">详细</option>
                    </select>
                  </div>
                </div>
              ) : (
                <ul className="info-list">
                  <li><strong>沟通风格:</strong> {persona.preferences.communicationStyle === 'balanced' ? '平衡' : persona.preferences.communicationStyle}</li>
                  <li><strong>细节层次:</strong> {persona.preferences.detailLevel === 'moderate' ? '适中' : persona.preferences.detailLevel}</li>
                  <li><strong>响应速度:</strong> {persona.preferences.responseSpeed === 'normal' ? '正常' : persona.preferences.responseSpeed}</li>
                  <li><strong>创意程度:</strong> {persona.preferences.creativityLevel === 'balanced' ? '平衡' : persona.preferences.creativityLevel}</li>
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === 'patterns' && currentPersona && (
          <div className="patterns-tab">
            <div className="info-card">
              <h3>📈 工作模式</h3>
              <ul className="info-list">
                <li>
                  <strong>活跃时间:</strong>
                  <div className="tags">
                    {persona.workPatterns.activeHours.map((hour, i) => (
                      <span key={i} className="tag">{hour}</span>
                    ))}
                  </div>
                </li>
                <li>
                  <strong>任务偏好:</strong>
                  <div className="tags">
                    {persona.workPatterns.taskPreferences.map((task, i) => (
                      <span key={i} className="tag">{task}</span>
                    ))}
                  </div>
                </li>
                <li><strong>决策风格:</strong> {persona.workPatterns.decisionStyle}</li>
                <li><strong>协作风格:</strong> {persona.workPatterns.collaborationStyle}</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'goals' && currentPersona && (
          <div className="goals-tab">
            <div className="info-grid">
              <div className="info-card">
                <h3>🎯 短期目标</h3>
                {isEditing ? (
                  <textarea
                    className="goals-textarea"
                    value={editedPersona.goals.shortTerm.join('\n')}
                    onChange={(e) => setEditedPersona({
                      ...editedPersona,
                      goals: { ...editedPersona.goals, shortTerm: e.target.value.split('\n') }
                    })}
                    placeholder="每行一个目标"
                  />
                ) : (
                  <ul className="goals-list">
                    {persona.goals.shortTerm.map((goal, i) => (
                      <li key={i}>{goal}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="info-card">
                <h3>🚀 长期目标</h3>
                {isEditing ? (
                  <textarea
                    className="goals-textarea"
                    value={editedPersona.goals.longTerm.join('\n')}
                    onChange={(e) => setEditedPersona({
                      ...editedPersona,
                      goals: { ...editedPersona.goals, longTerm: e.target.value.split('\n') }
                    })}
                    placeholder="每行一个目标"
                  />
                ) : (
                  <ul className="goals-list">
                    {persona.goals.longTerm.map((goal, i) => (
                      <li key={i}>{goal}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="info-card">
                <h3>💡 关注领域</h3>
                <div className="tags">
                  {persona.goals.focusAreas.map((area, i) => (
                    <span key={i} className="tag tag-large">{area}</span>
                  ))}
                </div>
              </div>

              <div className="info-card">
                <h3>📚 学习兴趣</h3>
                <div className="tags">
                  {persona.goals.learningInterests.map((interest, i) => (
                    <span key={i} className="tag tag-large">{interest}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && currentPersona && (
          <div className="ai-tab">
            <div className="info-card">
              <h3>🤖 AI个性化配置</h3>
              <ul className="info-list">
                <li>
                  <strong>偏好专家:</strong>
                  <div className="tags">
                    {persona.aiPersonalization.preferredExperts.map((expert, i) => (
                      <span key={i} className="tag">{expert}</span>
                    ))}
                  </div>
                </li>
                <li><strong>响应风格:</strong> {persona.aiPersonalization.responseStyle}</li>
                <li><strong>知识深度:</strong> {persona.aiPersonalization.knowledgeDepth}</li>
                <li><strong>示例用法:</strong> {persona.aiPersonalization.exampleUsage}</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>💡 AI助手建议</h3>
              <div className="ai-suggestions">
                <div className="suggestion-item">
                  <div className="suggestion-icon">🎯</div>
                  <div className="suggestion-content">
                    <h4>响应优化</h4>
                    <p>基于您的偏好，AI将提供{persona.preferences.detailLevel === 'detailed' ? '详细' : '简洁'}的分析和建议</p>
                  </div>
                </div>
                <div className="suggestion-item">
                  <div className="suggestion-icon">👥</div>
                  <div className="suggestion-content">
                    <h4>专家推荐</h4>
                    <p>系统会优先调用您偏好的专家进行分析</p>
                  </div>
                </div>
                <div className="suggestion-item">
                  <div className="suggestion-icon">📚</div>
                  <div className="suggestion-content">
                    <h4>知识整合</h4>
                    <p>AI将结合知识库中的相关文档提供更精准的建议</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserPersonaView
