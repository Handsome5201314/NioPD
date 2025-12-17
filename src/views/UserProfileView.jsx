import React, { useState, useEffect } from 'react'
import './UserProfileView.css'

const UserProfileView = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile') // 'profile', 'conversations', 'settings'
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '👤'
  })
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [useCustomModel, setUseCustomModel] = useState(false) // 是否使用自定义模型
  const [customModelName, setCustomModelName] = useState('') // 自定义模型名称
  const [baseModel, setBaseModel] = useState('gpt-4') // 默认基础模型
  const [baseApiEndpoint, setBaseApiEndpoint] = useState('') // API端点
  const [baseApiKey, setBaseApiKey] = useState('') // API密钥

  // 可用的大模型列表（与ModelConfigView保持一致）
  const availableModels = [
    // 国际大模型
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', icon: '🧠' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', icon: '⚡' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', icon: '🎭' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', icon: '🎵' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', icon: '💎' },
    // 国内大模型
    { id: 'qwen-max', name: '通义千问 Max', provider: 'Alibaba', icon: '🌟' },
    { id: 'qwen-plus', name: '通义千问 Plus', provider: 'Alibaba', icon: '✨' },
    { id: 'ernie-bot-4', name: '文心一言 4.0', provider: 'Baidu', icon: '📚' },
    { id: 'ernie-bot-turbo', name: '文心一言 Turbo', provider: 'Baidu', icon: '🚀' },
    { id: 'doubao-pro', name: '豆包 Pro', provider: '字节跳动', icon: '🎯' },
    { id: 'doubao-lite', name: '豆包 Lite', provider: '字节跳动', icon: '⚡' },
    { id: 'moonshot-v1', name: 'Moonshot v1', provider: '月之暗面', icon: '🌙' },
    { id: 'glm-4', name: 'GLM-4', provider: '智谱AI', icon: '🤖' },
    { id: 'siliconflow-qwen', name: '硅基流动 Qwen', provider: '硅基流动', icon: '🔷' },
    { id: 'siliconflow-llama', name: '硅基流动 Llama', provider: '硅基流动', icon: '🦙' },
    { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', icon: '🌊' }
  ]

  // 加载用户配置（包括基础模型）
  useEffect(() => {
    loadUserConfig()
  }, [])

  // 加载对话历史
  useEffect(() => {
    if (activeTab === 'conversations') {
      loadConversations()
    }
  }, [activeTab])

  // 加载用户配置
  const loadUserConfig = async () => {
    try {
      const token = localStorage.getItem('userToken')
      const response = await fetch('/api/user/config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await response.json()
      if (result.success && result.data) {
        if (result.data.useCustomModel !== undefined) {
          setUseCustomModel(result.data.useCustomModel)
        }
        if (result.data.customModelName) {
          setCustomModelName(result.data.customModelName)
        }
        if (result.data.baseModel) {
          setBaseModel(result.data.baseModel)
        }
        if (result.data.baseApiEndpoint) {
          setBaseApiEndpoint(result.data.baseApiEndpoint)
        }
        if (result.data.baseApiKey) {
          setBaseApiKey(result.data.baseApiKey)
        }
      }
    } catch (err) {
      console.error('Failed to load user config:', err)
      // 如果加载失败，尝试从localStorage加载
      try {
        const localUseCustomModel = localStorage.getItem('useCustomModel')
        const localCustomModelName = localStorage.getItem('customModelName')
        const localBaseModel = localStorage.getItem('baseModel')
        const localBaseApiEndpoint = localStorage.getItem('baseApiEndpoint')
        const localBaseApiKey = localStorage.getItem('baseApiKey')
        if (localUseCustomModel) {
          setUseCustomModel(localUseCustomModel === 'true')
        }
        if (localCustomModelName) {
          setCustomModelName(localCustomModelName)
        }
        if (localBaseModel) {
          setBaseModel(localBaseModel)
        }
        if (localBaseApiEndpoint) {
          setBaseApiEndpoint(localBaseApiEndpoint)
        }
        if (localBaseApiKey) {
          setBaseApiKey(localBaseApiKey)
        }
      } catch (parseErr) {
        console.error('Failed to parse local config:', parseErr)
      }
    }
  }

  const loadConversations = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('userToken')
      const response = await fetch('/api/user/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await response.json()
      if (result.success) {
        setConversations(result.data)
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('userToken')
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })
      const result = await response.json()
      if (result.success) {
        alert('个人信息更新成功！')
        // 更新本地存储的用户信息
        const updatedUser = { ...user, ...profileData }
        localStorage.setItem('userInfo', JSON.stringify(updatedUser))
      } else {
        alert(result.error || '更新失败')
      }
    } catch (err) {
      console.error('Update profile error:', err)
      alert('网络错误，请重试')
    }
  }

  const handleDeleteConversation = async (conversationId) => {
    if (!confirm('确定要删除这个对话吗？')) return

    try {
      const token = localStorage.getItem('userToken')
      const response = await fetch(`/api/user/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await response.json()
      if (result.success) {
        setConversations(prev => prev.filter(c => c.id !== conversationId))
      } else {
        alert(result.error || '删除失败')
      }
    } catch (err) {
      console.error('Delete conversation error:', err)
      alert('网络错误，请重试')
    }
  }

  const handleLoadConversation = (conversation) => {
    // 将对话历史加载到工作台
    localStorage.setItem('loadedConversation', JSON.stringify(conversation))
    window.location.href = '#/workbench'
  }

  const handleSaveBaseModel = async () => {
    try {
      // 先保存到localStorage（作为备份）
      localStorage.setItem('useCustomModel', String(useCustomModel))
      localStorage.setItem('customModelName', customModelName)
      localStorage.setItem('baseModel', baseModel)
      localStorage.setItem('baseApiEndpoint', baseApiEndpoint)
      localStorage.setItem('baseApiKey', baseApiKey)

      // 保存到后端
      const token = localStorage.getItem('userToken')
      const response = await fetch('/api/user/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          useCustomModel,
          customModelName,
          baseModel,
          baseApiEndpoint,
          baseApiKey
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('基础模型配置已保存！未单独配置的专家将使用此模型和API。')
      } else {
        alert(result.error || '保存到账户失败，但本地配置已保存')
      }
    } catch (err) {
      console.error('Save base model error:', err)
      alert('保存到账户失败，但本地配置已保存')
    }
  }

  return (
    <div className="user-profile-view">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar-large">{profileData.avatar}</div>
          <div className="profile-details">
            <h1>{user?.username}</h1>
            <p>{user?.email}</p>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          🚪 退出登录
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 个人信息
          </button>
          <button
            className={`profile-tab ${activeTab === 'conversations' ? 'active' : ''}`}
            onClick={() => setActiveTab('conversations')}
          >
            💬 对话历史
          </button>
          <button
            className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ API配置
          </button>
        </div>

        <div className="profile-panel">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h3>编辑个人信息</h3>
              <div className="form-group">
                <label>用户名</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>邮箱</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>头像 (emoji)</label>
                <input
                  type="text"
                  value={profileData.avatar}
                  onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                  maxLength={2}
                />
              </div>
              <button className="btn-save" onClick={handleUpdateProfile}>
                💾 保存修改
              </button>
            </div>
          )}

          {activeTab === 'conversations' && (
            <div className="conversations-section">
              <div className="section-header">
                <h3>对话历史</h3>
                <span className="conversation-count">
                  {conversations.length} 个对话
                </span>
              </div>

              {isLoading ? (
                <div className="loading-state">加载中...</div>
              ) : conversations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <p>暂无对话历史</p>
                </div>
              ) : (
                <div className="conversations-list">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="conversation-card">
                      <div className="conversation-header">
                        <h4>{conv.title || '未命名对话'}</h4>
                        <span className="conversation-date">
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="conversation-preview">
                        {conv.preview || '无内容'}
                      </p>
                      <div className="conversation-stats">
                        <span>🔄 {conv.iteration || 0} 轮迭代</span>
                        <span>💬 {conv.messageCount || 0} 条消息</span>
                      </div>
                      <div className="conversation-actions">
                        <button
                          className="btn-load"
                          onClick={() => handleLoadConversation(conv)}
                        >
                          加载
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteConversation(conv.id)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <h3>基础模型配置</h3>
              <p className="settings-hint">
                设置一个默认的基础模型及其API配置。当某个专家没有单独配置时，将自动使用这些配置。
              </p>

              <div className="model-type-selector">
                <label className="radio-option">
                  <input
                    type="radio"
                    checked={!useCustomModel}
                    onChange={() => setUseCustomModel(false)}
                  />
                  <span>使用预置模型</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    checked={useCustomModel}
                    onChange={() => setUseCustomModel(true)}
                  />
                  <span>自定义模型</span>
                </label>
              </div>

              {useCustomModel ? (
                <div className="form-group">
                  <label>模型名称</label>
                  <input
                    type="text"
                    placeholder="粘贴或输入模型名称，如: Qwen/Qwen2.5-7B-Instruct"
                    value={customModelName}
                    onChange={(e) => setCustomModelName(e.target.value)}
                  />
                  <span className="form-hint">
                    支持任意模型名称，如 Qwen/Qwen2.5-7B-Instruct, gpt-4o-mini, deepseek-chat 等
                  </span>
                </div>
              ) : (
                <div className="form-group">
                  <label>选择基础模型</label>
                  <select
                    className="model-select"
                    value={baseModel}
                    onChange={(e) => setBaseModel(e.target.value)}
                  >
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.icon} {model.name} ({model.provider})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>API 端点地址</label>
                <input
                  type="text"
                  placeholder="https://api.openai.com/v1"
                  value={baseApiEndpoint}
                  onChange={(e) => setBaseApiEndpoint(e.target.value)}
                />
                <span className="form-hint">留空将使用模型的默认端点</span>
              </div>

              <div className="form-group">
                <label>API 密钥</label>
                <input
                  type="password"
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={baseApiKey}
                  onChange={(e) => setBaseApiKey(e.target.value)}
                />
                <span className="form-hint">您的API密钥将被加密存储</span>
              </div>

              <button className="btn-save" onClick={handleSaveBaseModel}>
                💾 保存基础模型配置
              </button>

              <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #f0f0f0' }} />

              <h3>专家模型配置</h3>
              <p className="settings-hint">
                为每个专家单独配置模型和API密钥。如果某个专家未配置，将使用上面设置的基础模型。
              </p>
              <button
                className="btn-link"
                onClick={() => window.location.href = '#/model-config'}
              >
                前往专家模型配置页面 →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfileView
