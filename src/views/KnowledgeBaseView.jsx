import React, { useState, useEffect } from 'react'
import './KnowledgeBaseView.css'

const KnowledgeBaseView = ({ user }) => {
  const [documents, setDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)

  // 文档分类
  const categories = [
    { id: 'all', name: '全部文档', icon: '📚' },
    { id: 'product', name: '产品文档', icon: '📋' },
    { id: 'technical', name: '技术文档', icon: '🔧' },
    { id: 'design', name: '设计文档', icon: '🎨' },
    { id: 'business', name: '商业文档', icon: '💼' },
    { id: 'other', name: '其他', icon: '📄' }
  ]

  // 支持的文件类型
  const supportedFormats = [
    { type: 'PDF', ext: '.pdf', icon: '📕', color: '#e74c3c' },
    { type: 'Word', ext: '.docx,.doc', icon: '📘', color: '#2980b9' },
    { type: 'Excel', ext: '.xlsx,.xls', icon: '📗', color: '#27ae60' },
    { type: 'PowerPoint', ext: '.pptx,.ppt', icon: '📙', color: '#e67e22' },
    { type: 'Markdown', ext: '.md', icon: '📝', color: '#95a5a6' },
    { type: 'Text', ext: '.txt', icon: '📃', color: '#7f8c8d' }
  ]

  // 加载知识库文档
  useEffect(() => {
    // 清理旧的localStorage数据
    localStorage.removeItem('knowledgeBase')
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      // 先从localStorage加载（只存储元数据，不存储完整内容）
      const localDocs = localStorage.getItem('knowledgeBaseMeta')
      if (localDocs) {
        try {
          setDocuments(JSON.parse(localDocs))
        } catch (err) {
          console.error('Failed to parse local documents:', err)
          localStorage.removeItem('knowledgeBaseMeta')
        }
      }

      // 然后从后端加载
      if (user) {
        const token = localStorage.getItem('userToken')
        const response = await fetch('/api/knowledge/documents', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const result = await response.json()
        if (result.success) {
          setDocuments(result.data)
          // 只保存元数据到localStorage
          saveDocumentsMeta(result.data)
        }
      }
    } catch (err) {
      console.error('Failed to load documents:', err)
    }
  }

  // 保存文档元数据（不包含完整内容）
  const saveDocumentsMeta = (docs) => {
    try {
      const metaDocs = docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        category: doc.category,
        uploadDate: doc.uploadDate,
        vectorized: doc.vectorized,
        tags: doc.tags,
        contentPreview: doc.content ? doc.content.substring(0, 200) : '' // 只保存前200字符作为预览
      }))
      localStorage.setItem('knowledgeBaseMeta', JSON.stringify(metaDocs))
    } catch (err) {
      console.error('Failed to save documents meta:', err)
      // 如果还是超出配额，清空localStorage
      if (err.name === 'QuotaExceededError') {
        localStorage.removeItem('knowledgeBaseMeta')
      }
    }
  }

  // 处理文件上传
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    // 检查文件大小（限制为10MB）
    const maxSize = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = files.filter(f => f.size > maxSize)
    if (oversizedFiles.length > 0) {
      alert(`以下文件超过10MB限制：\n${oversizedFiles.map(f => f.name).join('\n')}\n\n请选择较小的文件或分批上传。`)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      try {
        // 读取文件内容
        const content = await readFileContent(file)

        // 创建文档对象
        const newDoc = {
          id: Date.now() + i,
          name: file.name,
          type: getFileType(file.name),
          size: formatFileSize(file.size),
          category: 'other',
          uploadDate: new Date().toISOString(),
          content: content, // 完整内容保存在内存中
          contentPreview: content.substring(0, 200), // 预览内容
          vectorized: false,
          tags: []
        }

        // 添加到文档列表
        setDocuments(prev => {
          const updated = [...prev, newDoc]
          // 只保存元数据到localStorage
          saveDocumentsMeta(updated)
          return updated
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        // 如果有后端，上传到服务器
        if (user) {
          await uploadToServer(newDoc)
        }
      } catch (err) {
        console.error('Upload failed:', err)
        alert(`上传失败: ${file.name}\n${err.message || '未知错误'}`)
      }
    }

    setTimeout(() => {
      setIsUploading(false)
      setUploadProgress(0)
      setShowUploadModal(false)
    }, 500)
  }

  // 读取文件内容
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        // 简化版：直接读取文本内容
        // 实际应用中需要根据文件类型使用不同的解析库
        resolve(e.target.result)
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  // 上传到服务器
  const uploadToServer = async (doc) => {
    try {
      const token = localStorage.getItem('userToken')
      await fetch('/api/knowledge/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(doc)
      })
    } catch (err) {
      console.error('Server upload failed:', err)
    }
  }

  // 获取文件类型
  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    const typeMap = {
      'pdf': 'PDF',
      'doc': 'Word',
      'docx': 'Word',
      'xls': 'Excel',
      'xlsx': 'Excel',
      'ppt': 'PowerPoint',
      'pptx': 'PowerPoint',
      'md': 'Markdown',
      'txt': 'Text'
    }
    return typeMap[ext] || 'Unknown'
  }

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // 删除文档
  const handleDeleteDocument = (docId) => {
    if (!confirm('确定要删除这个文档吗？')) return

    setDocuments(prev => {
      const updated = prev.filter(doc => doc.id !== docId)
      saveDocumentsMeta(updated)
      return updated
    })

    // 如果有后端，同步删除
    if (user) {
      const token = localStorage.getItem('userToken')
      fetch(`/api/knowledge/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(err => console.error('Delete failed:', err))
    }
  }

  // 更新文档分类
  const handleUpdateCategory = (docId, category) => {
    setDocuments(prev => {
      const updated = prev.map(doc =>
        doc.id === docId ? { ...doc, category } : doc
      )
      saveDocumentsMeta(updated)
      return updated
    })
  }

  // 搜索和过滤
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.content?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // 获取文档图标
  const getDocIcon = (type) => {
    const format = supportedFormats.find(f => f.type === type)
    return format ? format.icon : '📄'
  }

  // 获取文档颜色
  const getDocColor = (type) => {
    const format = supportedFormats.find(f => f.type === type)
    return format ? format.color : '#95a5a6'
  }

  return (
    <div className="knowledge-base-view">
      <div className="kb-header">
        <div className="kb-header-content">
          <h1>📚 知识库</h1>
          <p>上传文档，让AI专家团队基于您的知识库提供更精准的建议</p>
        </div>
        <button
          className="btn-upload"
          onClick={() => setShowUploadModal(true)}
        >
          <span>📤</span> 上传文档
        </button>
      </div>

      <div className="kb-toolbar">
        <div className="kb-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="搜索文档名称或内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="kb-categories">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span className="count">
                {cat.id === 'all'
                  ? documents.length
                  : documents.filter(d => d.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="kb-content">
        {filteredDocuments.length === 0 ? (
          <div className="kb-empty">
            <div className="empty-icon">📚</div>
            <h3>还没有文档</h3>
            <p>上传您的产品文档、技术规范、设计资料等，AI将基于这些内容提供更专业的建议</p>
            <button
              className="btn-primary"
              onClick={() => setShowUploadModal(true)}
            >
              上传第一个文档
            </button>
          </div>
        ) : (
          <div className="documents-grid">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="doc-card"
                onClick={() => setSelectedDoc(doc)}
              >
                <div
                  className="doc-icon"
                  style={{ background: getDocColor(doc.type) }}
                >
                  {getDocIcon(doc.type)}
                </div>
                <div className="doc-info">
                  <h3>{doc.name}</h3>
                  <div className="doc-meta">
                    <span className="doc-type">{doc.type}</span>
                    <span className="doc-size">{doc.size}</span>
                    <span className="doc-date">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="doc-category">
                    <select
                      value={doc.category}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleUpdateCategory(doc.id, e.target.value)
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {categories.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  className="doc-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteDocument(doc.id)
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 上传模态框 */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => !isUploading && setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📤 上传文档</h2>
              <button
                className="modal-close"
                onClick={() => !isUploading && setShowUploadModal(false)}
                disabled={isUploading}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="upload-area">
                <input
                  type="file"
                  id="fileInput"
                  multiple
                  accept={supportedFormats.map(f => f.ext).join(',')}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  style={{ display: 'none' }}
                />
                <label htmlFor="fileInput" className={`upload-label ${isUploading ? 'uploading' : ''}`}>
                  {isUploading ? (
                    <>
                      <div className="upload-progress">
                        <div
                          className="progress-fill"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p>上传中... {uploadProgress}%</p>
                    </>
                  ) : (
                    <>
                      <div className="upload-icon">📁</div>
                      <p>点击选择文件或拖拽到此处</p>
                      <span className="upload-hint">
                        支持 PDF、Word、Excel、PPT、Markdown、TXT<br/>
                        <strong style={{ color: '#e67e22' }}>单个文件最大10MB</strong>
                      </span>
                    </>
                  )}
                </label>
              </div>

              <div className="supported-formats">
                <h4>支持的文件格式：</h4>
                <div className="format-list">
                  {supportedFormats.map(format => (
                    <div key={format.type} className="format-item">
                      <span style={{ color: format.color }}>{format.icon}</span>
                      <span>{format.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 文档详情模态框 */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="doc-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDoc.name}</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedDoc(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="doc-metadata">
                <div className="meta-item">
                  <strong>类型：</strong>
                  <span>{selectedDoc.type}</span>
                </div>
                <div className="meta-item">
                  <strong>大小：</strong>
                  <span>{selectedDoc.size}</span>
                </div>
                <div className="meta-item">
                  <strong>上传时间：</strong>
                  <span>{new Date(selectedDoc.uploadDate).toLocaleString()}</span>
                </div>
                <div className="meta-item">
                  <strong>分类：</strong>
                  <span>
                    {categories.find(c => c.id === selectedDoc.category)?.name}
                  </span>
                </div>
              </div>
              <div className="doc-content-preview">
                <h4>内容预览</h4>
                <div className="content-text">
                  {selectedDoc.content ? (
                    <pre>{selectedDoc.content.substring(0, 1000)}...</pre>
                  ) : (
                    <p className="no-preview">此文件类型暂不支持预览</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KnowledgeBaseView
