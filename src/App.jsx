import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/Layout/MainLayout'
import AuthView from './views/AuthView'
import UserProfileView from './views/UserProfileView'
import WorkbenchViewV2 from './views/WorkbenchViewV2'
import ModelConfigView from './views/ModelConfigView'
import SOPSandboxView from './views/SOPSandboxView'
import EvolutionDashboardView from './views/EvolutionDashboardView'
import KnowledgeBaseView from './views/KnowledgeBaseView'
import UserPersonaView from './views/UserPersonaView'
import './App.css'

function App() {
  const [activeModule, setActiveModule] = useState('workbench')
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // 检查是否已登录
    const checkAuth = () => {
      const token = localStorage.getItem('userToken')
      const userInfo = localStorage.getItem('userInfo')

      if (token && userInfo) {
        try {
          setUser(JSON.parse(userInfo))
        } catch (err) {
          console.error('Failed to parse user info:', err)
          localStorage.removeItem('userToken')
          localStorage.removeItem('userInfo')
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userInfo')
    setUser(null)
    window.location.href = '/'
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">正在加载破界实验室一人公司...</div>
      </div>
    )
  }

  // 如果未登录，显示登录页面
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<AuthView onLogin={handleLogin} />} />
        </Routes>
      </Router>
    )
  }

  // 已登录，显示主应用
  return (
    <Router>
      <MainLayout
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        user={user}
        onLogout={handleLogout}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/workbench" replace />} />
          <Route path="/workbench" element={<WorkbenchViewV2 user={user} />} />
          <Route path="/profile" element={<UserProfileView user={user} onLogout={handleLogout} />} />
          <Route path="/persona" element={<UserPersonaView user={user} />} />
          <Route path="/knowledge" element={<KnowledgeBaseView user={user} />} />
          <Route path="/model-config" element={<ModelConfigView user={user} />} />
          <Route path="/sop" element={<SOPSandboxView />} />
          <Route path="/evolution" element={<EvolutionDashboardView />} />
          <Route path="*" element={<Navigate to="/workbench" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App