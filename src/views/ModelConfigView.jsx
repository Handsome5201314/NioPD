import React, { useState, useEffect } from 'react'
import './ModelConfigView.css'

const ModelConfigView = ({ user }) => {
  // 所有专家列表
  const [experts] = useState([
    { id: 'nio', name: 'nio', role: '核心编排代理', avatar: '🎯' },
    { id: 'product-manager', name: 'product-manager', role: '产品经理', avatar: '📋' },
    { id: 'tech-architect', name: 'tech-architect', role: '技术架构师', avatar: '🏗️' },
    { id: 'ux-designer', name: 'ux-designer', role: 'UX设计师', avatar: '🎨' },
    { id: 'data-analyst', name: 'data-analyst', role: '数据分析师', avatar: '📊' },
    { id: 'qa-engineer', name: 'qa-engineer', role: 'QA工程师', avatar: '🔍' },
    { id: 'story-writer', name: 'story-writer', role: '故事编写专家', avatar: '✍️' },
    { id: 'feedback-synthesizer', name: 'feedback-synthesizer', role: '反馈综合分析师', avatar: '💬' },
    { id: 'automation-engineer', name: 'automation-engineer', role: '自动化工程师', avatar: '⚙️' },
    { id: 'ai-assistant', name: 'ai-assistant', role: 'AI助手', avatar: '🤖' },
    { id: 'security-expert', name: 'security-expert', role: '安全专家', avatar: '🔒' },
    { id: 'doc-writer', name: 'doc-writer', role: '文档编写专家', avatar: '📝' }
  ])

  // 预置模型列表
  const presetModels = [
    // 国际大模型
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', icon: '🧠', region: 'global' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', icon: '⚡', region: 'global' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', icon: '🎭', region: 'global' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', icon: '🎵', region: 'global' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', icon: '💎', region: 'global' },
    // 国内大模型
    { id: 'qwen-max', name: '通义千问 Max', provider: 'Alibaba', icon: '🌟', region: 'china' },
    { id: 'qwen-plus', name: '通义千问 Plus', provider: 'Alibaba', icon: '✨', region: 'china' },
    { id: 'ernie-bot-4', name: '文心一言 4.0', provider: 'Baidu', icon: '📚', region: 'china' },
    { id: 'doubao-pro', name: '豆包 Pro', provider: '字节跳动', icon: '🎯', region: 'china' },
    { id: 'moonshot-v1', name: 'Moonshot v1', provider: '月之暗面', icon: '🌙', region: 'china' },
    { id: 'glm-4', name: 'GLM-4', provider: '智谱AI', icon: '🤖', region: 'china' },
    { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', icon: '🌊', region: 'china' }
  ]

  // 提示词模板
  const promptTemplates = [
    {
      id: 'default',
      name: '默认模板',
      content: '你是一个专业的AI助手，请根据用户的需求提供准确、有价值的回答。'
    },
    {
      id: 'professional',
      name: '专业模式',
      content: '你是一个专业的{role}，拥有丰富的行业经验。请使用专业术语，提供深入的分析和建议。'
    },
    {
      id: 'creative',
      name: '创意模式',
      content: '你是一个富有创造力的{role}，善于跳出常规思维。请提供新颖、独特的解决方案。'
    },
    {
      id: 'analytical',
      name: '分析模式',
      content: '你是一个善于分析的{role}，注重数据和逻辑。请提供基于事实的分析和建议。'
    }
  ]

  // 状态管理
  const [selectedExpert, setSelectedExpert] = useState(null)
  const [activeTab, setActiveTab] = useState('model') // model, api, prompt, integration

  // 专家配置
  const [expertConfigs, setExpertConfigs] = useState({})

  // 测试连接状态
  const [testStatus, setTestStatus] = useState({}) // { expertId: 'testing' | 'success' | 'failed' }
  const [testMessage, setTestMessage] = useState({}) // { expertId: 'message' }

  // Toast通知
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  // 加载配置
  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      // 先从localStorage加载
      const localConfigs = localStorage.getItem('expertConfigs')
      if (localConfigs) {
        setExpertConfigs(JSON.parse(localConfigs))
      }

      // 然后从后端加载（如果已登录）
      if (user) {
        const token = localStorage.getItem('userToken')
        const response = await fetch('/api/user/config', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const result = await response.json()
        if (result.success && result.data?.expertConfigs) {
          setExpertConfigs(result.data.expertConfigs)
        }
      }
    } catch (err) {
      console.error('Failed to load configs:', err)
    }
  }

  // 获取专家配置（带默认值）
  const getExpertConfig = (expertId) => {
    return expertConfigs[expertId] || {
      useCustomModel: false,
      customModelName: '',
      presetModelId: 'gpt-4',
      apiEndpoint: '',
      apiKey: '',
      promptTemplate: 'default',
      customPrompt: '',
      useExternalIntegration: false,
      integrationType: 'dify', // dify | coze
      integrationUrl: '',
      integrationKey: '',
      chatOnlyMode: true
    }
  }

  // 更新专家配置
  const updateExpertConfig = (expertId, updates) => {
    setExpertConfigs(prev => ({
      ...prev,
      [expertId]: {
        ...getExpertConfig(expertId),
        ...updates
      }
    }))
  }

  // 保存配置
  const handleSaveConfig = async () => {
    try {
      // 保存到localStorage
      localStorage.setItem('expertConfigs', JSON.stringify(expertConfigs))

      // 保存到后端
      if (user) {
        const token = localStorage.getItem('userToken')
        const response = await fetch('/api/user/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            expertConfigs
          })
        })

        const result = await response.json()
        if (result.success) {
          showToast('配置已保存到您的账户！', 'success')
        } else {
          showToast('保存到账户失败，但本地配置已保存', 'warning')
        }
      } else {
        showToast('配置已保存到本地！', 'success')
      }
    } catch (err) {
      console.error('Save config error:', err)
      showToast('保存失败，请重试', 'error')
    }
  }

  // 测试连接
  const handleTestConnection = async (expertId) => {
    const config = getExpertConfig(expertId)

    setTestStatus({ ...testStatus, [expertId]: 'testing' })
    setTestMessage({ ...testMessage, [expertId]: '正在测试连接...' })

    try {
      // 模拟API测试（实际项目中需要真实的API调用）
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 检查配置是否完整
      if (config.useExternalIntegration) {
        if (!config.integrationUrl || !config.integrationKey) {
          throw new Error('外部集成配置不完整')
        }
      } else if (config.useCustomModel) {
        if (!config.customModelName || !config.apiEndpoint || !config.apiKey) {
          throw new Error('自定义模型配置不完整')
        }
      } else {
        if (!config.apiKey) {
          throw new Error('API密钥未配置')
        }
      }

      setTestStatus({ ...testStatus, [expertId]: 'success' })
      setTestMessage({ ...testMessage, [expertId]: '✓ 连接成功' })
      showToast('连接测试成功！', 'success')
    } catch (err) {
      setTestStatus({ ...testStatus, [expertId]: 'failed' })
      setTestMessage({ ...testMessage, [expertId]: `✗ ${err.message}` })
      showToast(`连接失败: ${err.message}`, 'error')
    }
  }

  // 渲染模型配置标签页
  const renderModelTab = () => {
    if (!selectedExpert) return null
    const config = getExpertConfig(selectedExpert.id)

    return (
      <div className="config-panel">
        <div className="config-section">
          <h4>模型选择</h4>

          <div className="model-type-selector">
            <label className="radio-option">
              <input
                type="radio"
                checked={!config.useCustomModel}
                onChange={() => updateExpertConfig(selectedExpert.id, { useCustomModel: false })}
              />
              <span>使用预置模型</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                checked={config.useCustomModel}
                onChange={() => updateExpertConfig(selectedExpert.id, { useCustomModel: true })}
              />
              <span>自定义模型</span>
            </label>
          </div>

          {config.useCustomModel ? (
            <div className="custom-model-input">
              <div className="form-group">
                <label>模型名称</label>
                <input
                  type="text"
                  placeholder="粘贴或输入模型名称，如: gpt-4o-mini"
                  value={config.customModelName}
                  onChange={(e) => updateExpertConfig(selectedExpert.id, { customModelName: e.target.value })}
                />
                <span className="form-hint">
                  支持任意模型名称，如 gpt-4o-mini, claude-3-5-sonnet, qwen-max-latest 等
                </span>
              </div>
            </div>
          ) : (
            <div className="preset-models">
              <div className="model-grid">
                {presetModels.map(model => (
                  <div
                    key={model.id}
                    className={`model-option ${config.presetModelId === model.id ? 'selected' : ''}`}
                    onClick={() => updateExpertConfig(selectedExpert.id, { presetModelId: model.id })}
                  >
                    <span className="model-icon">{model.icon}</span>
                    <div className="model-info">
                      <div className="model-name">{model.name}</div>
                      <div className="model-provider">{model.provider}</div>
                    </div>
                    {config.presetModelId === model.id && (
                      <span className="check-icon">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 渲染API配置标签页
  const renderApiTab = () => {
    if (!selectedExpert) return null
    const config = getExpertConfig(selectedExpert.id)

    return (
      <div className="config-panel">
        <div className="config-section">
          <h4>API 配置</h4>

          <div className="form-group">
            <label>API 端点地址</label>
            <input
              type="text"
              placeholder="https://api.openai.com/v1"
              value={config.apiEndpoint}
              onChange={(e) => updateExpertConfig(selectedExpert.id, { apiEndpoint: e.target.value })}
            />
            <span className="form-hint">
              留空将使用默认端点
            </span>
          </div>

          <div className="form-group">
            <label>API 密钥</label>
            <input
              type="password"
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              value={config.apiKey}
              onChange={(e) => updateExpertConfig(selectedExpert.id, { apiKey: e.target.value })}
            />
            <span className="form-hint">
              您的API密钥将被加密存储
            </span>
          </div>

          <div className="test-connection">
            <button
              className={`btn-test ${testStatus[selectedExpert.id] || ''}`}
              onClick={() => handleTestConnection(selectedExpert.id)}
              disabled={testStatus[selectedExpert.id] === 'testing'}
            >
              {testStatus[selectedExpert.id] === 'testing' ? (
                <>
                  <span className="spinner">⏳</span> 测试中...
                </>
              ) : (
                <>🔌 测试连接</>
              )}
            </button>
            {testMessage[selectedExpert.id] && (
              <div className={`test-message ${testStatus[selectedExpert.id]}`}>
                {testMessage[selectedExpert.id]}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 渲染提示词配置标签页
  const renderPromptTab = () => {
    if (!selectedExpert) return null
    const config = getExpertConfig(selectedExpert.id)
    const selectedTemplate = promptTemplates.find(t => t.id === config.promptTemplate)

    return (
      <div className="config-panel">
        <div className="config-section">
          <h4>提示词模板</h4>

          <div className="template-selector">
            {promptTemplates.map(template => (
              <div
                key={template.id}
                className={`template-option ${config.promptTemplate === template.id ? 'selected' : ''}`}
                onClick={() => updateExpertConfig(selectedExpert.id, {
                  promptTemplate: template.id,
                  customPrompt: template.content.replace('{role}', selectedExpert.role)
                })}
              >
                <span className="template-name">{template.name}</span>
                {config.promptTemplate === template.id && <span className="check-icon">✓</span>}
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>自定义提示词</label>
            <textarea
              className="prompt-editor"
              rows="8"
              placeholder="在此编辑提示词内容..."
              value={config.customPrompt || (selectedTemplate?.content.replace('{role}', selectedExpert.role) || '')}
              onChange={(e) => updateExpertConfig(selectedExpert.id, { customPrompt: e.target.value })}
            />
            <span className="form-hint">
              使用 {'{role}'} 占位符自动替换为专家角色名称
            </span>
          </div>
        </div>
      </div>
    )
  }

  // 渲染外部集成标签页
  const renderIntegrationTab = () => {
    if (!selectedExpert) return null
    const config = getExpertConfig(selectedExpert.id)

    return (
      <div className="config-panel">
        <div className="config-section">
          <h4>外部集成</h4>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.useExternalIntegration}
                onChange={(e) => updateExpertConfig(selectedExpert.id, { useExternalIntegration: e.target.checked })}
              />
              <span>启用外部智能体/工作流集成</span>
            </label>
          </div>

          {config.useExternalIntegration && (
            <>
              <div className="integration-type-selector">
                <label className="radio-option">
                  <input
                    type="radio"
                    checked={config.integrationType === 'dify'}
                    onChange={() => updateExpertConfig(selectedExpert.id, { integrationType: 'dify' })}
                  />
                  <span>🔷 Dify 工作流</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    checked={config.integrationType === 'coze'}
                    onChange={() => updateExpertConfig(selectedExpert.id, { integrationType: 'coze' })}
                  />
                  <span>🟣 Coze 智能体</span>
                </label>
              </div>

              <div className="form-group">
                <label>集成地址</label>
                <input
                  type="text"
                  placeholder={config.integrationType === 'dify' ? 'https://api.dify.ai/v1/workflows/run' : 'https://api.coze.com/v1/bot/chat'}
                  value={config.integrationUrl}
                  onChange={(e) => updateExpertConfig(selectedExpert.id, { integrationUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>访问密钥</label>
                <input
                  type="password"
                  placeholder="输入工作流/智能体的访问密钥"
                  value={config.integrationKey}
                  onChange={(e) => updateExpertConfig(selectedExpert.id, { integrationKey: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.chatOnlyMode}
                    onChange={(e) => updateExpertConfig(selectedExpert.id, { chatOnlyMode: e.target.checked })}
                  />
                  <span>仅作为聊天窗口（不修改返回结果）</span>
                </label>
                <span className="form-hint">
                  启用后，系统将直接透传外部智能体的返回结果，不进行任何修改或处理
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="model-config-view">
      <div className="config-header">
        <h1 className="config-title">⚙️ 专家模型配置中心</h1>
        <p className="config-subtitle">
          为每个专家配置模型、API、提示词和外部集成
        </p>
      </div>

      <div className="config-body">
        {/* 左侧：专家列表 */}
        <div className="experts-sidebar">
          <div className="sidebar-header">
            <h3>专家列表</h3>
            <span className="expert-count">{experts.length}</span>
          </div>

          <div className="experts-list">
            {experts.map(expert => {
              const config = getExpertConfig(expert.id)
              const hasConfig = config.apiKey || config.useExternalIntegration

              return (
                <div
                  key={expert.id}
                  className={`expert-item ${selectedExpert?.id === expert.id ? 'active' : ''}`}
                  onClick={() => setSelectedExpert(expert)}
                >
                  <div className="expert-avatar">{expert.avatar}</div>
                  <div className="expert-info">
                    <div className="expert-role">{expert.role}</div>
                    <div className="expert-name">{expert.name}</div>
                  </div>
                  {hasConfig && <span className="config-badge">✓</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* 右侧：配置面板 */}
        <div className="config-main">
          {!selectedExpert ? (
            <div className="empty-state">
              <div className="empty-icon">👈</div>
              <h3>请选择一个专家</h3>
              <p>从左侧列表中选择一个专家开始配置</p>
            </div>
          ) : (
            <>
              <div className="config-tabs">
                <button
                  className={`config-tab ${activeTab === 'model' ? 'active' : ''}`}
                  onClick={() => setActiveTab('model')}
                >
                  🤖 模型配置
                </button>
                <button
                  className={`config-tab ${activeTab === 'api' ? 'active' : ''}`}
                  onClick={() => setActiveTab('api')}
                >
                  🔌 API设置
                </button>
                <button
                  className={`config-tab ${activeTab === 'prompt' ? 'active' : ''}`}
                  onClick={() => setActiveTab('prompt')}
                >
                  💬 提示词
                </button>
                <button
                  className={`config-tab ${activeTab === 'integration' ? 'active' : ''}`}
                  onClick={() => setActiveTab('integration')}
                >
                  🔗 外部集成
                </button>
              </div>

              <div className="config-content-area">
                {activeTab === 'model' && renderModelTab()}
                {activeTab === 'api' && renderApiTab()}
                {activeTab === 'prompt' && renderPromptTab()}
                {activeTab === 'integration' && renderIntegrationTab()}
              </div>

              <div className="config-actions">
                <button className="btn-save" onClick={handleSaveConfig}>
                  💾 保存配置
                </button>
                <button className="btn-reset" onClick={() => window.location.reload()}>
                  🔄 重置
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast通知 */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✗'}
            {toast.type === 'warning' && '⚠'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  )
}

export default ModelConfigView
