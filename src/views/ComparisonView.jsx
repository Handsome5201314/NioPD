import React, { useState, useEffect, useRef } from 'react'
import './ComparisonView.css'

const ComparisonView = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const rightPanelRef = useRef(null)

  // 官网版本特性
  const officialFeatures = [
    {
      id: 'basic-workflow',
      name: '基础工作流',
      description: '提供核心的产品管理工作流程',
      features: [
        'new-initiative - 创建新计划',
        'summarize-feedback - 反馈分析',
        'draft-prd - PRD生成',
        'update-roadmap - 路线图更新'
      ]
    },
    {
      id: 'discovery-commands',
      name: '探索命令',
      description: '用于市场研究和用户分析',
      features: [
        'analyze-competitor - 竞品分析',
        'summarize-interview - 访谈总结',
        'analyze-data - 数据分析',
        'generate-personas - 用户画像'
      ]
    },
    {
      id: 'planning-commands',
      name: '规划命令',
      description: '支持产品规划和需求管理',
      features: [
        'write-stories - 用户故事',
        'generate-faq - FAQ生成',
        'track-kpis - KPI跟踪',
        'generate-update - 更新报告'
      ]
    },
    {
      id: 'core-agents',
      name: '核心代理',
      description: '16个专业化AI代理',
      features: [
        'competitor-analyzer - 竞品分析师',
        'data-analyst - 数据分析师',
        'feedback-synthesizer - 反馈综合器',
        'market-researcher - 市场研究员'
      ]
    }
  ]

  // 2.0版本新增特性
  const v2Features = [
    {
      id: 'org-update-system',
      name: '组织更新系统',
      description: '全新的组织管理和自我进化系统',
      isNew: true,
      features: [
        'org-update-check - 检查更新机会',
        'org-update-new-command - 创建新命令',
        'org-update-new-agent - 创建新代理',
        'org-update-new-memory - 记录工作习惯'
      ],
      improvements: [
        '智能识别工作模式',
        '自动化流程优化',
        '个性化推荐系统',
        '持续学习进化'
      ]
    },
    {
      id: 'advanced-agents',
      name: '高级代理',
      description: '新增4个专业化AI代理',
      isNew: true,
      features: [
        'nio - 高级PM主管',
        'ai-assistant - AI助手',
        'automation-engineer - 自动化工程师',
        'growth-hacker - 增长黑客'
      ],
      improvements: [
        '苏格拉底式提问',
        '启发式对话',
        '第一性原理思维',
        '智能引导决策'
      ]
    },
    {
      id: 'sop-templates',
      name: 'SOP模板系统',
      description: '标准化操作流程模板',
      isNew: true,
      features: [
        '一人公司SOP',
        '产品开发SOP',
        '协作编辑功能',
        '示例数据生成'
      ],
      improvements: [
        '适合中国本土环境',
        '支持实时协作',
        '智能内容填充',
        '版本管理控制'
      ]
    },
    {
      id: 'intelligence-evolution',
      name: '智能自进化',
      description: 'AI驱动的自我进化系统',
      isNew: true,
      features: [
        '工作模式热力图',
        '推荐引擎透明化',
        '决策树可视化',
        '个性化优化建议'
      ],
      improvements: [
        '深度学习用户习惯',
        '智能推荐算法',
        '可视化决策过程',
        '持续优化迭代'
      ]
    }
  ]

  // 计算升级完整度
  const calculateUpgradeProgress = () => {
    const officialFeatureCount = officialFeatures.reduce((acc, feature) => 
      acc + feature.features.length, 0
    )
    const v2FeatureCount = v2Features.reduce((acc, feature) => 
      acc + feature.features.length, 0
    )
    
    const officialImplemented = 100 // 假设官网功能100%实现
    const v2Implemented = 40 // 假设2.0功能40%实现
    
    return Math.round((officialImplemented + v2Implemented) / 2)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (rightPanelRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = rightPanelRef.current
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100
        setScrollProgress(Math.round(progress))
      }
    }

    const rightPanel = rightPanelRef.current
    if (rightPanel) {
      rightPanel.addEventListener('scroll', handleScroll)
      return () => rightPanel.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const FeatureCard = ({ feature, isV2 = false }) => (
    <div className={`feature-card ${isV2 ? 'v2-feature' : 'official-feature'}`}>
      <div className="card-header">
        <h3>{feature.name}</h3>
        {isV2 && feature.isNew && (
          <span className="new-badge">NEW</span>
        )}
      </div>
      
      <p className="feature-description">{feature.description}</p>
      
      <div className="feature-list">
        <h4>核心功能</h4>
        <ul>
          {feature.features.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      
      {isV2 && feature.improvements && (
        <div className="improvements-list">
          <h4>改进亮点</h4>
          <ul>
            {feature.improvements.map((item, index) => (
              <li key={index} className="improvement-item">
                <span className="improvement-icon">✨</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="card-actions">
        <button 
          className="button button-secondary button-sm"
          onClick={() => setSelectedFeature(feature)}
        >
          <span className="magnifier-icon">🔍</span>
          查看详情
        </button>
      </div>
    </div>
  )

  return (
    <div className="comparison-view">
      <div className="module-header">
        <h1 className="module-title">2.0 vs 1.0.33 对比瀑布流</h1>
        <p className="module-description">
          左右分屏对比官网版本特性与2.0新增功能，实时显示升级完整度
        </p>
      </div>
      
      <div className="module-content">
        {/* 升级进度条 */}
        <div className="upgrade-progress">
          <div className="progress-header">
            <h3>升级完整度</h3>
            <span className="progress-percentage">{calculateUpgradeProgress()}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${calculateUpgradeProgress()}%` }}
            ></div>
          </div>
          <div className="progress-details">
            <span>官网功能: 100% | 2.0新增: 40%</span>
          </div>
        </div>

        {/* 对比区域 */}
        <div className="comparison-container">
          {/* 左侧：官网版本 */}
          <div className="comparison-panel official-panel">
            <div className="panel-header">
              <h2>官网版本 1.0.33</h2>
              <span className="version-badge official">稳定版</span>
            </div>
            
            <div className="panel-content">
              {officialFeatures.map(feature => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          </div>

          {/* 右侧：2.0版本 */}
          <div className="comparison-panel v2-panel" ref={rightPanelRef}>
            <div className="panel-header sticky">
              <h2>破界实验室 2.0</h2>
              <span className="version-badge v2">升级版</span>
            </div>
            
            <div className="panel-content">
              {v2Features.map(feature => (
                <FeatureCard key={feature.id} feature={feature} isV2={true} />
              ))}
            </div>
          </div>
        </div>

        {/* 滚动进度指示器 */}
        <div className="scroll-indicator">
          <div className="scroll-progress">
            <div 
              className="scroll-progress-fill"
              style={{ width: `${scrollProgress}%` }}
            ></div>
          </div>
          <span className="scroll-text">{scrollProgress}%</span>
        </div>

        {/* 特性详情弹窗 */}
        {selectedFeature && (
          <div className="feature-detail-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{selectedFeature.name}</h2>
                <button 
                  className="button button-secondary button-sm"
                  onClick={() => setSelectedFeature(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <div className="feature-overview">
                  <p className="feature-description">{selectedFeature.description}</p>
                  
                  <div className="feature-details">
                    <h3>核心功能</h3>
                    <ul>
                      {selectedFeature.features.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {selectedFeature.improvements && (
                    <div className="feature-improvements">
                      <h3>改进亮点</h3>
                      <ul>
                        {selectedFeature.improvements.map((item, index) => (
                          <li key={index} className="improvement-item">
                            <span className="improvement-icon">✨</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedFeature.isNew && (
                    <div className="new-feature-highlight">
                      <h3>🎉 2.0全新功能</h3>
                      <p>这是破界实验室2.0版本中新增的核心功能，带来了全新的体验和能力提升。</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComparisonView