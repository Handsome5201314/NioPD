import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './LocalizationView.css'

const LocalizationView = () => {
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [showOriginal, setShowOriginal] = useState(true)
  const [highlightLocalization, setHighlightLocalization] = useState(true)

  // 本地化特性数据
  const localizationFeatures = [
    {
      id: 'org-update-system',
      original: {
        title: 'Organizational Update System',
        description: 'A system for tracking and implementing organizational improvements through new commands, agents, and memory patterns.',
        features: [
          'Command creation and management',
          'Agent specialization and optimization',
          'Personal work habit documentation',
          'Systematic improvement tracking'
        ]
      },
      localized: {
        title: '组织更新系统',
        description: '通过新命令、代理和记忆模式跟踪和实施组织改进的系统。',
        features: [
          '命令创建和管理',
          '代理专业化和优化',
          '个人工作习惯记录',
          '系统性改进跟踪'
        ],
        chinaSpecific: [
          '符合中国团队协作习惯',
          '支持中文文档和工作流程',
          '适配国内项目管理模式',
          '考虑中国用户使用场景'
        ]
      }
    },
    {
      id: 'nio-agent',
      original: {
        title: 'Nio Senior PM Supervisor',
        description: 'An advanced AI agent that uses Socratic questioning and heuristic dialogue to guide users through product design and reflection.',
        features: [
          'Socratic questioning methodology',
          'Heuristic dialogue techniques',
          'First-principles thinking approach',
          'Silent archiving capabilities'
        ]
      },
      localized: {
        title: 'Nio高级PM主管',
        description: '使用苏格拉底式提问和启发式对话引导用户进行产品设计和反思的高级AI代理。',
        features: [
          '苏格拉底式提问方法',
          '启发式对话技术',
          '第一性原理思维方法',
          '静默归档能力'
        ],
        chinaSpecific: [
          '适应中国式沟通风格',
          '理解中国产品管理环境',
          '支持中文深度对话',
          '考虑国内团队协作特点'
        ]
      }
    },
    {
      id: 'sop-templates',
      original: {
        title: 'SOP Template System',
        description: 'Standardized Operating Procedure templates for one-person companies and product development teams.',
        features: [
          'One-person company SOP',
          'Product development SOP',
          'Collaborative editing features',
          'Example data generation'
        ]
      },
      localized: {
        title: 'SOP模板系统',
        description: '为一人公司和产品开发团队提供的标准化操作流程模板。',
        features: [
          '一人公司SOP',
          '产品开发SOP',
          '协作编辑功能',
          '示例数据生成'
        ],
        chinaSpecific: [
          '符合国内创业环境',
          '适配中国法规要求',
          '支持国内商业实践',
          '考虑本土市场特点'
        ]
      }
    },
    {
      id: 'intelligence-evolution',
      original: {
        title: 'Intelligent Self-Evolution System',
        description: 'An AI-powered system that learns from user behavior and provides personalized recommendations for improvement.',
        features: [
          'Work pattern heatmap analysis',
          'Recommendation engine transparency',
          'Decision tree visualization',
          'Personalized optimization suggestions'
        ]
      },
      localized: {
        title: '智能自进化系统',
        description: '从用户行为中学习并提供个性化改进建议的AI驱动系统。',
        features: [
          '工作模式热力图分析',
          '推荐引擎透明化',
          '决策树可视化',
          '个性化优化建议'
        ],
        chinaSpecific: [
          '适应中国工作时间模式',
          '理解国内用户习惯',
          '支持中文交互反馈',
          '考虑本土工作文化'
        ]
      }
    }
  ]

  const FeatureCard = ({ feature }) => (
    <div className="feature-card">
      <div className="feature-header">
        <h3>{feature.localized.title}</h3>
        <div className="feature-tags">
          <span className="tag localized">中文本地化</span>
          {feature.localized.chinaSpecific && (
            <span className="tag china-specific">中国特色</span>
          )}
        </div>
      </div>
      
      <div className="comparison-container">
        {showOriginal && (
          <div className="original-section">
            <h4>英文原版</h4>
            <p>{feature.original.description}</p>
            <ul>
              {feature.original.features.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="localized-section">
          <h4>中文版本</h4>
          <p>{feature.localized.description}</p>
          <ul>
            {feature.localized.features.map((item, index) => (
              <React.Fragment key={index}>
                <li>{item}</li>
                {highlightLocalization && index === 0 && (
                  <span className="localization-highlight">🇨🇳 适合中国用户</span>
                )}
              </React.Fragment>
            ))}
          </ul>
          
          {feature.localized.chinaSpecific && (
            <div className="china-specific-section">
              <h5>🇨🇳 中国特色适配</h5>
              <ul>
                {feature.localized.chinaSpecific.map((item, index) => (
                  <li key={index} className="china-item">
                    <span className="china-icon">🔴</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="feature-actions">
        <button 
          className="button button-secondary"
          onClick={() => setSelectedFeature(feature)}
        >
          查看详情
        </button>
      </div>
    </div>
  )

  return (
    <div className="localization-view">
      <div className="module-header">
        <h1 className="module-title">中文本地化对比视图</h1>
        <p className="module-description">
          双语对照模式展示英文原版与中文版本，突出中国特色适配
        </p>
      </div>
      
      <div className="module-content">
        <div className="localization-controls">
          <div className="control-group">
            <label>
              <input 
                type="checkbox"
                checked={showOriginal}
                onChange={(e) => setShowOriginal(e.target.checked)}
              />
              显示英文原版
            </label>
          </div>
          
          <div className="control-group">
            <label>
              <input 
                type="checkbox"
                checked={highlightLocalization}
                onChange={(e) => setHighlightLocalization(e.target.checked)}
              />
              高亮本地化内容
            </label>
          </div>
        </div>

        <div className="features-grid">
          {localizationFeatures.map(feature => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>

        {/* 特性详情弹窗 */}
        {selectedFeature && (
          <div className="feature-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{selectedFeature.localized.title}</h2>
                <button 
                  className="button button-secondary button-sm"
                  onClick={() => setSelectedFeature(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <div className="detailed-comparison">
                  <div className="detailed-original">
                    <h3>英文原版功能描述</h3>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {`## ${selectedFeature.original.title}

${selectedFeature.original.description}

### 核心功能
${selectedFeature.original.features.map(feature => `- ${feature}`).join('\n')}`}
                    </ReactMarkdown>
                  </div>
                  
                  <div className="detailed-localized">
                    <h3>中文版本功能描述</h3>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {`## ${selectedFeature.localized.title}

${selectedFeature.localized.description}

### 核心功能
${selectedFeature.localized.features.map(feature => `- ${feature}`).join('\n')}

### 🇨🇳 中国特色适配
${selectedFeature.localized.chinaSpecific.map(feature => `- ${feature}`).join('\n')}

### 本地化优势
- 更符合中国用户使用习惯
- 支持中文工作流程
- 适配国内商业环境
- 考虑本土文化因素`}
                    </ReactMarkdown>
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

export default LocalizationView