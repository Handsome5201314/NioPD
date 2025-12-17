import React, { useState } from 'react'
import './AuthView.css'

const AuthView = ({ onLogin }) => {
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // 清除错误
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('用户名不能为空')
      return false
    }
    if (!formData.password) {
      setError('密码不能为空')
      return false
    }
    if (formData.password.length < 6) {
      setError('密码长度至少6位')
      return false
    }
    if (mode === 'register') {
      if (!formData.email.trim()) {
        setError('邮箱不能为空')
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('邮箱格式不正确')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('两次输入的密码不一致')
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: mode === 'register' ? formData.email : undefined
        })
      })

      const result = await response.json()

      if (result.success) {
        // 保存用户信息和token
        localStorage.setItem('userToken', result.data.token)
        localStorage.setItem('userInfo', JSON.stringify(result.data.user))

        // 触发登录回调
        onLogin(result.data.user)
      } else {
        setError(result.error || '操作失败，请重试')
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('网络错误，请检查后端服务是否启动')
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      email: ''
    })
  }

  return (
    <div className="auth-view">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">🚀</div>
          <h1 className="auth-title">破界实验室</h1>
          <p className="auth-subtitle">一人公司智能协作平台</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            登录
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            注册
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="请输入用户名"
              disabled={isLoading}
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="请输入邮箱"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="请输入密码（至少6位）"
              disabled={isLoading}
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="请再次输入密码"
                disabled={isLoading}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-submit"
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-hint">
            {mode === 'login' ? '还没有账号？' : '已有账号？'}
            <button className="btn-switch" onClick={switchMode}>
              {mode === 'login' ? '立即注册' : '立即登录'}
            </button>
          </p>
        </div>
      </div>

      <div className="auth-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>
    </div>
  )
}

export default AuthView
