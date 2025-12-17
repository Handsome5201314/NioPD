import React, { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { fetchActivityHeatmap, fetchWorkspaceStats } from '../services/api'
import './EvolutionDashboardView.css'

const EvolutionDashboardView = () => {
  const [selectedRecommendation, setSelectedRecommendation] = useState(null)
  const [showDecisionTree, setShowDecisionTree] = useState(false)
  const [heatmapData, setHeatmapData] = useState([])
  const [activityData, setActivityData] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 加载真实数据
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)

        // 加载热力图数据
        const heatmap = await fetchActivityHeatmap()
        setHeatmapData(heatmap)

        // 加载工作区统计
        const stats = await fetchWorkspaceStats()

        // 根据统计生成活动分布数据
        const activity = [
          { name: 'Initiatives', value: stats.initiatives.total, color: '#1890ff' },
          { name: 'PRDs', value: stats.prds, color: '#52c41a' },
          { name: 'Reports', value: stats.reports, color: '#faad14' },
          { name: 'Roadmaps', value: stats.roadmaps, color: '#722ed1' },
          { name: 'Sources', value: stats.sources, color: '#f5222d' }
        ].filter(item => item.value > 0)

        setActivityData(activity)

        // 生成推荐
        setRecommendations(generateRecommendations(stats))

        setError(null)
      } catch (err) {
        console.error('Failed to load evolution data:', err)
        setError('无法加载数据，请确保后端服务器正在运行')
        // 使用模拟数据
        setHeatmapData(generateMockHeatmapData())
        setActivityData(generateMockActivityData())
        setRecommendations(generateMockRecommendations())
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // 根据工作区统计生成推荐
  function generateRecommendations(stats) {
    const recs = []

    // 如果工作区为空
    if (stats.isEmpty) {
      recs.push({
        id: 1,
        type: 'action',
        title: '开始使用破界实验室',
        description: '工作区当前为空，建议创建第一个 initiative 开始产品管理之旅',
        confidence: 95,
        reasons: [
          '工作区尚无文件',
          '可使用 /niopd:new-initiative 命令',
          '系统已准备就绪'
        ]
      })
    }

    // 如果有很多 initiative 但没有 PRD
    if (stats.initiatives.total > 0 && stats.prds === 0) {
      recs.push({
        id: 2,
        type: 'command',
        title: '创建 PRD 文档',
        description: `您有 ${stats.initiatives.total} 个 initiative，建议开始编写 PRD`,
        confidence: 85,
        reasons: [
          `${stats.initiatives.total} 个 initiative 待文档化`,
          '使用 /niopd:draft-prd 命令',
          'PRD 是产品开发的关键文档'
        ]
      })
    }

    // 如果有很多文件但活跃度低
    if (stats.totalFiles > 5 && stats.lastActivity) {
      const daysSinceActivity = Math.floor((Date.now() - new Date(stats.lastActivity)) / (1000 * 60 * 60 * 24))
      if (daysSinceActivity > 7) {
        recs.push({
          id: 3,
          type: 'reminder',
          title: '更新项目进度',
          description: `上次活动距今 ${daysSinceActivity} 天，建议更新项目状态`,
          confidence: 70,
          reasons: [
            `${daysSinceActivity} 天未更新`,
            '定期更新有助于项目跟踪',
            '可使用 /niopd:track-kpis 命令'
          ]
        })
      }
    }

    return recs.length > 0 ? recs : generateMockRecommendations()
  }

  // 模拟热力图数据
  function generateMockHeatmapData() {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const data = []

    days.forEach((day, dayIndex) => {
      hours.forEach((hour, hourIndex) => {
        // 模拟不同时间段的活跃度
        let value = Math.random() * 100
        
        // 工作时间活跃度更高
        if (hourIndex >= 9 && hourIndex <= 18) {
          value += Math.random() * 50
        }
        
        // 周末活跃度较低
        if (dayIndex >= 5) {
          value *= 0.7
        }

        data.push([hourIndex, dayIndex, Math.round(value)])
      })
    })

    return data
  }

  // 模拟活动数据
  function generateMockActivityData() {
    return [
      { name: '命令创建', value: 45, color: '#1890ff' },
      { name: '代理调用', value: 38, color: '#52c41a' },
      { name: '模板编辑', value: 28, color: '#faad14' },
      { name: '文档生成', value: 22, color: '#722ed1' },
      { name: '数据分析', value: 18, color: '#f5222d' },
      { name: '协作编辑', value: 15, color: '#13c2c2' }
    ]
  }

  // 模拟推荐数据
  function generateMockRecommendations() {
    return [
      {
        id: 1,
        type: 'agent',
        title: '使用 growth-hacker 代理',
        description: '基于您的用户增长需求，建议使用增长黑客代理来制定增长策略',
        confidence: 87,
        reasons: [
          '最近频繁查看用户数据',
          '产品处于增长阶段',
          '历史成功案例匹配度92%'
        ]
      },
      {
        id: 2,
        type: 'command',
        title: '创建自定义命令',
        description: '检测到您重复执行相似操作，建议创建自定义命令提高效率',
        confidence: 76,
        reasons: [
          '每周执行5次相似操作',
          '可节省约2小时/周',
          '操作复杂度中等'
        ]
      },
      {
        id: 3,
        type: 'template',
        title: '优化SOP模板',
        description: '基于您的使用习惯，建议优化当前SOP模板结构',
        confidence: 68,
        reasons: [
          '模板使用频率高',
          '部分章节较少使用',
          '可提高30%效率'
        ]
      }
    ]
  }

  // 删除原有的 useEffect，数据加载已移到开头

  // 决策树数据
  const getDecisionTreeOption = () => ({
    title: {
      text: '推荐决策逻辑',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    series: [
      {
        type: 'tree',
        data: [
          {
            name: '用户行为分析',
            value: 100,
            children: [
              {
                name: '操作频率',
                value: 40,
                children: [
                  {
                    name: '高频操作',
                    value: 25
                  },
                  {
                    name: '中频操作',
                    value: 10
                  },
                  {
                    name: '低频操作',
                    value: 5
                  }
                ]
              },
              {
                name: '内容偏好',
                value: 35,
                children: [
                  {
                    name: '数据分析',
                    value: 20
                  },
                  {
                    name: '文档编辑',
                    value: 10
                  },
                  {
                    name: '代理交互',
                    value: 5
                  }
                ]
              },
              {
                name: '时间模式',
                value: 25,
                children: [
                  {
                    name: '工作时间',
                    value: 15
                  },
                  {
                    name: '非工作时间',
                    value: 10
                  }
                ]
              }
            ]
          }
        ],
        top: '5%',
        left: '10%',
        bottom: '5%',
        right: '20%',
        symbolSize: 10,
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 12
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left'
          }
        },
        emphasis: {
          focus: 'descendant'
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750
      }
    ]
  })

  // 热力图配置
  const getHeatmapOption = () => ({
    title: {
      text: '工作模式热力图',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `${params.data[1]} ${params.data[0]}:00<br/>活跃度: ${params.data[2]}`
      }
    },
    grid: {
      height: '70%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 150,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#e0f3ff', '#1890ff', '#0050b3']
      }
    },
    series: [{
      name: '活跃度',
      type: 'heatmap',
      data: heatmapData,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  })

  // 活动分布配置
  const getActivityOption = () => ({
    title: {
      text: '活动分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: activityData.map(item => item.name)
    },
    series: [
      {
        name: '活动类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: activityData
      }
    ]
  })

  useEffect(() => {
    // 数据加载已在开头处理，这里无需重复
  }, [])

  return (
    <div className="evolution-dashboard-view">
      <div className="module-header">
        <h1 className="module-title">智能自进化系统仪表盘</h1>
        <p className="module-description">
          动态展示工作模式热力图和推荐引擎透明化
        </p>
      </div>
      
      <div className="module-content">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {isLoading && (
          <div className="loading-indicator">
            加载工作区数据中...
          </div>
        )}

        <div className="dashboard-grid">
          {/* 工作模式热力图 */}
          <div className="dashboard-card">
            <ReactECharts 
              option={getHeatmapOption()} 
              style={{ height: '400px', width: '100%' }}
            />
          </div>

          {/* 活动分布 */}
          <div className="dashboard-card">
            <ReactECharts 
              option={getActivityOption()} 
              style={{ height: '400px', width: '100%' }}
            />
          </div>
        </div>

        {/* 推荐面板 */}
        <div className="recommendations-section">
          <h3>智能推荐</h3>
          <div className="recommendations-grid">
            {recommendations.map(recommendation => (
              <div 
                key={recommendation.id}
                className={`recommendation-card ${selectedRecommendation?.id === recommendation.id ? 'selected' : ''}`}
                onClick={() => setSelectedRecommendation(recommendation)}
              >
                <div className="recommendation-header">
                  <div className="recommendation-type">
                    {recommendation.type === 'agent' && '🤖 代理推荐'}
                    {recommendation.type === 'command' && '⚡ 命令推荐'}
                    {recommendation.type === 'template' && '📋 模板推荐'}
                  </div>
                  <div className="confidence-score">
                    {recommendation.confidence}%
                  </div>
                </div>
                
                <h4>{recommendation.title}</h4>
                <p>{recommendation.description}</p>
                
                <div className="recommendation-actions">
                  <button 
                    className="button button-primary button-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      // 这里可以执行推荐的操作
                      console.log('执行推荐:', recommendation)
                    }}
                  >
                    应用推荐
                  </button>
                  <button 
                    className="button button-secondary button-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDecisionTree(true)
                    }}
                  >
                    为什么？
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 决策树弹窗 */}
        {showDecisionTree && (
          <div className="decision-tree-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>推荐决策逻辑</h3>
                <button 
                  className="button button-secondary button-sm"
                  onClick={() => setShowDecisionTree(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <ReactECharts 
                  option={getDecisionTreeOption()} 
                  style={{ height: '500px', width: '100%' }}
                />
                <div className="decision-explanation">
                  <h4>决策依据</h4>
                  {selectedRecommendation && (
                    <ul>
                      {selectedRecommendation.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
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

export default EvolutionDashboardView