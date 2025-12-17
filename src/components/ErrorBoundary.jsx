import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
          backgroundColor: '#fff5f5',
          minHeight: '100vh'
        }}>
          <h1 style={{ color: '#f5222d' }}>⚠️ 页面加载出错</h1>
          <p style={{ color: '#8c8c8c', margin: '20px 0' }}>
            {this.state.error?.message || '未知错误'}
          </p>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '6px',
            textAlign: 'left',
            maxWidth: '800px',
            margin: '0 auto',
            overflow: 'auto'
          }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            重新加载页面
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
