import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './MainLayout.css'

const MainLayout = ({ children, activeModule, setActiveModule, user, onLogout }) => {
  const location = useLocation()
  const [showHelpModal, setShowHelpModal] = React.useState(false)

  const menuItems = [
    {
      key: 'workbench',
      label: '🚀 智能工作台',
      path: '/workbench',
      icon: '🚀',
      highlight: true
    },
    {
      key: 'persona',
      label: '👤 我的画像',
      path: '/persona',
      icon: '👤'
    },
    {
      key: 'knowledge',
      label: '📚 知识库',
      path: '/knowledge',
      icon: '📚'
    },
    {
      key: 'model-config',
      label: '⚙️ 模型配置',
      path: '/model-config',
      icon: '⚙️'
    },
    {
      key: 'sop',
      label: '📋 SOP模板沙盒',
      path: '/sop',
      icon: '📋'
    },
    {
      key: 'evolution',
      label: '📊 智能自进化系统',
      path: '/evolution',
      icon: '📊'
    }
  ]

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon">🚀</span>
              <span className="logo-text">破界实验室</span>
              <span className="logo-badge">一人公司</span>
            </div>
            <nav className="main-nav">
              <ul className="nav-list">
                {menuItems.map(item => (
                  <li key={item.key} className="nav-item">
                    <Link
                      to={item.path}
                      className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                      onClick={() => setActiveModule(item.key)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-text">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="header-actions">
              {user && (
                <Link to="/profile" className="user-menu">
                  <span className="user-avatar">{user.avatar || '👤'}</span>
                  <span className="user-name">{user.username}</span>
                </Link>
              )}
              <button
                className="button button-secondary button-sm"
                onClick={() => setShowHelpModal(true)}
              >
                帮助
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="content-area">
        <div className="module-container">
          {children}
        </div>
      </main>

      {/* 帮助模态框 */}
      {showHelpModal && (
        <div className="help-modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-header">
              <h2>📚 破界实验室使用指南</h2>
              <button
                className="help-modal-close"
                onClick={() => setShowHelpModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="help-modal-content">
              <section className="help-section">
                <h3>🚀 智能工作台</h3>
                <p>与AI团队协作，通过自然语言输入需求，系统自动编排专家进行产品开发。</p>
                <ul>
                  <li>输入产品需求描述</li>
                  <li>查看AI专家的分析和建议</li>
                  <li>追踪项目迭代进度</li>
                </ul>
              </section>

              <section className="help-section">
                <h3>📚 知识库管理</h3>
                <p>上传和管理您的文档资料，让AI专家基于知识库提供更精准的建议。</p>
                <h4>支持的文档格式</h4>
                <ul>
                  <li>📕 PDF文档 (.pdf)</li>
                  <li>📘 Word文档 (.doc, .docx)</li>
                  <li>📗 Excel表格 (.xls, .xlsx)</li>
                  <li>📙 PowerPoint演示 (.ppt, .pptx)</li>
                  <li>📝 Markdown文档 (.md)</li>
                  <li>📃 纯文本文件 (.txt)</li>
                </ul>
                <h4>核心功能</h4>
                <ul>
                  <li><strong>文档上传：</strong>支持多文件同时上传，实时进度显示（单文件最大10MB）</li>
                  <li><strong>分类管理：</strong>产品文档、技术文档、设计文档、商业文档等分类</li>
                  <li><strong>智能搜索：</strong>按文档名称和内容快速检索</li>
                  <li><strong>文档预览：</strong>查看文档元数据和内容片段</li>
                  <li><strong>向量化索引：</strong>自动处理文档，支持语义搜索（开发中）</li>
                  <li><strong>对话集成：</strong>AI专家可引用知识库内容（开发中）</li>
                </ul>
                <h4>使用建议</h4>
                <ul>
                  <li>上传产品需求文档、技术规范、设计稿等相关资料</li>
                  <li>单个文件建议不超过10MB，大文件可分批上传</li>
                  <li>合理分类文档，便于快速查找和管理</li>
                  <li>定期更新知识库，保持内容时效性</li>
                  <li>AI对话时会自动引用相关文档内容</li>
                </ul>
              </section>

              <section className="help-section">
                <h3>👤 我的用户画像</h3>
                <p>基于对话历史和使用行为自动生成个性化用户画像，帮助AI更好地理解您。</p>
                <h4>画像维度</h4>
                <ul>
                  <li><strong>基本信息：</strong>角色、行业、经验等级、团队规模、工作风格</li>
                  <li><strong>技能分布：</strong>产品、技术、设计、商业、数据、沟通六大维度</li>
                  <li><strong>沟通偏好：</strong>沟通风格、细节层次、响应速度、创意程度</li>
                  <li><strong>工作模式：</strong>活跃时间、任务偏好、决策风格、协作风格</li>
                  <li><strong>目标规划：</strong>短期目标、长期目标、关注领域、学习兴趣</li>
                  <li><strong>AI个性化：</strong>偏好专家、响应风格、知识深度、示例用法</li>
                </ul>
                <h4>核心功能</h4>
                <ul>
                  <li><strong>智能生成：</strong>AI自动分析对话历史和行为模式生成画像</li>
                  <li><strong>技能雷达图：</strong>直观展示六大维度技能分布</li>
                  <li><strong>行为分析：</strong>识别工作习惯、任务偏好、决策模式</li>
                  <li><strong>自定义编辑：</strong>支持手动修改和完善画像信息</li>
                  <li><strong>多维展示：</strong>概览、技能、偏好、模式、目标、AI配置六大标签页</li>
                  <li><strong>持续更新：</strong>随使用不断优化，保持画像准确性</li>
                </ul>
                <h4>AI个性化应用</h4>
                <ul>
                  <li>AI根据您的角色和经验调整回答的专业度</li>
                  <li>基于沟通偏好控制回答的详细程度和风格</li>
                  <li>优先调用您偏好的专家进行分析</li>
                  <li>结合知识库和画像提供精准建议</li>
                  <li>适应您的工作时间和任务习惯</li>
                </ul>
                <h4>使用建议</h4>
                <ul>
                  <li>首次使用时点击"生成我的画像"让AI分析</li>
                  <li>定期查看和更新画像，确保准确性</li>
                  <li>详细编辑技能和偏好，帮助AI更好理解</li>
                  <li>在AI个性化标签查看AI如何使用您的画像</li>
                </ul>
              </section>

              <section className="help-section">
                <h3>⚙️ 模型配置指南</h3>
                <p>为每个AI专家配置最合适的大语言模型，优化团队表现。</p>
                <h4>基础模型配置</h4>
                <ul>
                  <li>在个人中心 → API配置中设置基础模型</li>
                  <li>配置API端点地址和API密钥</li>
                  <li>支持国际模型：GPT-4、Claude 3、Gemini Pro等</li>
                  <li>支持国内模型：通义千问、文心一言、豆包、GLM-4、DeepSeek等</li>
                </ul>
                <h4>专家模型配置</h4>
                <ul>
                  <li>可为每个专家单独配置专用模型</li>
                  <li>支持自定义模型名称（粘贴任意模型名）</li>
                  <li>配置独立的API端点和密钥</li>
                  <li>测试连接确保配置正确</li>
                  <li>未配置的专家自动使用基础模型</li>
                </ul>
                <h4>高级功能</h4>
                <ul>
                  <li><strong>提示词模板：</strong>选择默认、专业、创意或分析模式</li>
                  <li><strong>自定义提示词：</strong>为专家编写个性化提示词</li>
                  <li><strong>外部集成：</strong>连接Dify工作流或Coze智能体</li>
                  <li><strong>聊天模式：</strong>外部智能体可设为仅聊天，避免结果被修改</li>
                </ul>
              </section>

              <section className="help-section">
                <h3>🤖 AI专家团队（共19位）</h3>
                <p>破界实验室拥有19位专业AI专家，各司其职协同工作。</p>

                <h4>🌟 2.0核心新增专家</h4>
                <ul>
                  <li><strong>nio</strong> - 核心编排代理，负责整体流程协调和任务分配</li>
                  <li><strong>ai-assistant</strong> - AI助手，提供智能问答和辅助决策</li>
                  <li><strong>automation-engineer</strong> - 自动化工程师，负责流程自动化和工具开发</li>
                </ul>

                <h4>📋 产品与设计专家</h4>
                <ul>
                  <li><strong>product-manager</strong> - 产品经理，负责产品规划和需求管理</li>
                  <li><strong>ux-designer</strong> - UX设计师，负责用户体验设计和交互原型</li>
                  <li><strong>story-writer</strong> - 故事编写专家，专注于用户故事和需求描述</li>
                </ul>

                <h4>🏗️ 技术开发专家</h4>
                <ul>
                  <li><strong>tech-architect</strong> - 技术架构师，负责架构设计和技术选型</li>
                  <li><strong>backend-developer</strong> - 后端开发工程师，负责后端服务和API开发</li>
                  <li><strong>ui-developer</strong> - 前端开发工程师，负责前端开发和UI实现</li>
                  <li><strong>ml-engineer</strong> - 机器学习工程师，负责ML模型训练和部署</li>
                </ul>

                <h4>🔧 运维与质量专家</h4>
                <ul>
                  <li><strong>dev-ops</strong> - DevOps工程师，负责CI/CD和部署自动化</li>
                  <li><strong>sre</strong> - 站点可靠性工程师，负责系统稳定性和故障恢复</li>
                  <li><strong>qa-engineer</strong> - QA工程师，负责测试计划和质量保证</li>
                  <li><strong>performance-optimizer</strong> - 性能优化专家，负责性能分析和优化</li>
                </ul>

                <h4>📊 分析与安全专家</h4>
                <ul>
                  <li><strong>data-analyst</strong> - 数据分析师，负责数据分析和指标监控</li>
                  <li><strong>feedback-synthesizer</strong> - 反馈综合分析师，收集和分析各方反馈</li>
                  <li><strong>security-expert</strong> - 安全专家，负责安全评审和漏洞扫描</li>
                </ul>

                <h4>🔗 集成与文档专家</h4>
                <ul>
                  <li><strong>integration-specialist</strong> - 集成专家，负责系统集成和API对接</li>
                  <li><strong>doc-writer</strong> - 文档编写专家，负责技术文档和用户手册</li>
                </ul>
              </section>

              <section className="help-section">
                <h3>🔄 组织更新系统</h3>
                <p>破界实验室核心特性，支持系统自我进化和持续优化。</p>
                <h4>核心命令</h4>
                <ul>
                  <li><strong>org-update-check</strong> - 检查组织更新机会，分析工作空间和任务模式</li>
                  <li><strong>org-update-new-command</strong> - 创建新命令，自动化重复任务</li>
                  <li><strong>org-update-new-agent</strong> - 创建新代理，扩展团队专业能力</li>
                  <li><strong>org-update-new-memory</strong> - 记录个人工作习惯，持续学习优化</li>
                </ul>
                <h4>工作流程</h4>
                <ol>
                  <li>执行 org-update-check 命令分析当前工作空间</li>
                  <li>系统识别重复任务和优化机会</li>
                  <li>根据需要创建新命令、新代理或记录工作模式</li>
                  <li>生成组织更新建议报告</li>
                </ol>
              </section>

              <section className="help-section">
                <h3>📋 SOP模板沙盒</h3>
                <p>编辑和管理标准操作流程模板，支持Markdown格式和实时预览。</p>
                <h4>使用方法</h4>
                <ul>
                  <li>选择预置模板或创建自定义模板</li>
                  <li>使用Markdown编辑器进行编辑</li>
                  <li>支持实时预览</li>
                  <li>导出为Markdown文件</li>
                  <li>配置自动保存到本地</li>
                </ul>
                <h4>预置模板</h4>
                <ul>
                  <li><strong>一人公司SOP</strong> - 适合独立创业者的完整运营流程</li>
                  <li><strong>产品开发SOP</strong> - 从需求到上线的标准开发流程</li>
                  <li><strong>Nio对话模式</strong> - 苏格拉底式提问的对话框架</li>
                  <li><strong>用户研究SOP</strong> - 用户访谈和需求分析流程</li>
                  <li><strong>敏捷开发SOP</strong> - Sprint规划和迭代管理流程</li>
                  <li><strong>产品上线SOP</strong> - 发布前检查和上线部署流程</li>
                </ul>
              </section>

              <section className="help-section">
                <h3>📊 智能自进化系统</h3>
                <p>AI驱动的系统学习和自我优化能力。</p>
                <h4>核心功能</h4>
                <ul>
                  <li><strong>工作模式热力图：</strong>分析工作时间分布和任务模式</li>
                  <li><strong>推荐引擎透明化：</strong>可视化推荐决策过程</li>
                  <li><strong>决策树可视化：</strong>展示AI决策逻辑</li>
                  <li><strong>个性化优化建议：</strong>基于使用习惯提供改进方案</li>
                </ul>
                <h4>学习能力</h4>
                <ul>
                  <li>深度学习用户工作习惯</li>
                  <li>识别重复任务并推荐自动化</li>
                  <li>持续优化专家协作流程</li>
                  <li>适应个人工作节奏和偏好</li>
                </ul>
              </section>

              <section className="help-section">
                <h3>🌏 中国本土化特性</h3>
                <p>破界实验室专为中国用户和团队优化设计。</p>
                <ul>
                  <li><strong>支持国内大模型：</strong>通义千问、文心一言、豆包、GLM-4、DeepSeek等</li>
                  <li><strong>中文优先：</strong>全中文界面和对话系统</li>
                  <li><strong>本土化工作流：</strong>符合国内团队协作习惯</li>
                  <li><strong>适配商业环境：</strong>考虑国内法规和市场特点</li>
                  <li><strong>工作时间优化：</strong>适应中国工作时间模式</li>
                  <li><strong>创业场景：</strong>特别优化一人公司和小团队场景</li>
                </ul>
              </section>

              <section className="help-section">
                <h3>💡 快速上手</h3>
                <h4>首次使用步骤</h4>
                <ol>
                  <li>进入个人中心 → API配置</li>
                  <li>配置基础模型和API密钥</li>
                  <li>（可选）在模型配置中为专家单独配置</li>
                  <li>前往智能工作台开始使用</li>
                </ol>
                <h4>重要提示</h4>
                <ul>
                  <li><strong>基础模型必配：</strong>至少配置一个基础模型才能使用</li>
                  <li><strong>专家模型可选：</strong>未配置的专家自动使用基础模型</li>
                  <li><strong>数据同步：</strong>所有配置同步到账户，支持多设备访问</li>
                  <li><strong>对话历史：</strong>可在个人中心查看和恢复历史对话</li>
                  <li><strong>外部集成：</strong>可连接Dify/Coze扩展能力</li>
                </ul>
              </section>

              <section className="help-section">
                <h3>🎯 2.0版本核心升级</h3>
                <ul>
                  <li>🆕 <strong>组织更新系统：</strong>智能识别工作模式，自动化流程优化</li>
                  <li>🆕 <strong>高级代理nio：</strong>苏格拉底式提问，启发式对话引导</li>
                  <li>🆕 <strong>SOP模板系统：</strong>标准化操作流程，支持协作编辑</li>
                  <li>🆕 <strong>智能自进化：</strong>AI驱动的持续学习和优化</li>
                  <li>✨ <strong>Cherry Studio风格：</strong>现代化模型配置界面</li>
                  <li>✨ <strong>外部集成：</strong>支持Dify工作流和Coze智能体</li>
                  <li>✨ <strong>国产模型支持：</strong>深度集成国内主流大模型</li>
                </ul>
              </section>

              <section className="help-section">
                <h3>🔗 相关链接</h3>
                <ul>
                  <li><a href="https://github.com/your-repo/niopd" target="_blank" rel="noopener noreferrer">GitHub 仓库</a></li>
                  <li><a href="https://docs.niopd.com" target="_blank" rel="noopener noreferrer">完整文档</a></li>
                  <li><a href="mailto:support@niopd.com">联系支持</a></li>
                </ul>
              </section>
            </div>
            <div className="help-modal-footer">
              <button
                className="button button-primary"
                onClick={() => setShowHelpModal(false)}
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainLayout