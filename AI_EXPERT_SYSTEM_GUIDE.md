---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 304402207b41a57a8e64344fe935ae6242d606b9b4e0cfeb5d08bdde446817e27563376d02203376a42b9016dc366738c21de96cac1e57ad3d33c6249c5e1d01d3145a8785e7
    ReservedCode2: 3046022100f7514b258d1894256a70b4669e8e68a6080a7eead841bc7911c644af7b5cc72e022100b89458d210b1354fa204a9bd34bc95906b39944c58adbc258a707c29e1a77a69
---

# AI专家系统架构说明 🤖🧠

## 系统概述

本次升级实现了完整的AI专家系统，包含：
1. ✅ **专家身份提示词系统** - 每个专家都有专业的角色定位和提示词
2. ✅ **nio核心编排** - 自主决定调用哪些专家
3. ✅ **用户API配置** - 使用用户在"模型配置"中设置的API
4. ✅ **自定义专家支持** - 用户可以创建自己的专家

---

## 架构设计

### 1. 专家提示词配置

**文件**: [backend/config/expert-prompts.json](backend/config/expert-prompts.json)

包含6个内置专家的完整提示词：

```json
{
  "nio": {
    "id": "nio",
    "role": "核心编排代理",
    "systemPrompt": "你是破界实验室的核心编排代理nio，负责统筹协调...",
    "expertiseAreas": ["需求分析", "MVP规划", "团队协作"],
    "triggerKeywords": []
  },
  "product-manager": {
    "id": "product-manager",
    "role": "产品经理",
    "systemPrompt": "你是破界实验室的资深产品经理...",
    "expertiseAreas": ["需求分析", "功能规划", "用户体验"],
    "triggerKeywords": ["产品", "需求", "功能", "用户"]
  },
  // ... 其他专家
}
```

**每个专家包含**:
- `id`: 唯一标识
- `name`: 专家名称
- `role`: 角色描述（中文）
- `systemPrompt`: 完整的系统提示词（定义专长、职责、分析框架、回复要点）
- `expertiseAreas`: 专业领域列表
- `triggerKeywords`: 触发关键词（用于降级方案）

### 2. AI服务模块

**文件**: [backend/services/ai-service.js](backend/services/ai-service.js)

#### 核心功能：

**A. nio编排决策**
```javascript
nioOrchestrate(userInput, apiConfig)
```
- nio分析用户需求，决定调用哪些专家
- 优先使用AI智能分析
- 降级方案：关键词匹配

**B. 专家调用**
```javascript
callExpert(expertId, userInput, apiConfig, conversationHistory)
```
- 使用专家的systemPrompt
- 支持对话上下文（最近6条消息）
- 返回专家的专业分析

**C. nio综合**
```javascript
nioSynthesize(userInput, expertResponses, apiConfig)
```
- nio综合所有专家意见
- 提供结构化的行动建议
- 给出优先级和下一步

**D. 完整对话流程**
```javascript
intelligentConversation(userInput, apiConfig, conversationHistory)
```
流程：
1. nio编排 → 决定专家
2. 并行调用专家 → 获取意见
3. nio综合 → 最终建议

#### 自定义专家功能：

```javascript
// 添加自定义专家
addCustomExpert({
  id: 'my-expert',
  name: 'my-expert',
  role: '我的专家',
  systemPrompt: '你是...',
  expertiseAreas: [],
  triggerKeywords: []
})

// 删除自定义专家
removeCustomExpert('my-expert')
```

### 3. AI API路由

**文件**: [backend/api/ai.js](backend/api/ai.js)

**已实现的API端点**:

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/ai/chat` | POST | 智能对话接口 |
| `/api/ai/experts` | GET | 获取专家列表 |
| `/api/ai/experts/:id` | GET | 获取专家详情 |
| `/api/ai/experts/custom` | POST | 添加自定义专家 |
| `/api/ai/experts/custom/:id` | DELETE | 删除自定义专家 |

**智能对话接口请求格式**:
```json
{
  "userInput": "用户问题",
  "conversationHistory": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

**响应格式**:
```json
{
  "success": true,
  "data": {
    "response": "nio综合后的最终建议",
    "experts": ["product-manager", "tech-architect"],
    "expertResponses": [
      {
        "expertId": "product-manager",
        "expertName": "产品经理",
        "content": "产品经理的专业分析...",
        "success": true
      }
    ],
    "orchestrationMethod": "ai",  // 或 "keyword"
    "orchestrationReasoning": "涉及产品需求和技术架构"
  }
}
```

### 4. 前端集成

**文件**: [src/views/WorkbenchView.jsx](src/views/WorkbenchView.jsx)

**修改要点**:
1. 不再使用模拟逻辑，改为调用真实AI API
2. 从localStorage读取userToken进行认证
3. 传递对话历史（最近6条消息）
4. 展示AI返回的专家回复和综合建议
5. 错误处理：显示友好的错误提示

**关键代码**:
```javascript
const handleSendMessage = async () => {
  // ... 准备消息

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      userInput: currentInput,
      conversationHistory: recentHistory
    })
  })

  const result = await response.json()

  if (result.success) {
    // 更新专家、建议、AI回复
    setActiveExperts(...)
    setSuggestions(...)
    setConversations(...)
  }
}
```

---

## 使用指南

### 步骤1: 配置API密钥

1. 登录系统
2. 进入 **"⚙️ 模型配置"** 页面
3. 填写API配置：

```
API提供商: siliconflow（或其他）
API端点: https://api.siliconflow.cn/v1
API密钥: sk-your-api-key
模型名称: Qwen/Qwen2.5-7B-Instruct
Temperature: 0.7
最大Token: 2000
```

4. 点击 **"保存配置"**

### 步骤2: 使用智能工作台

1. 进入 **"🚀 智能工作台"**
2. 输入您的需求或问题
3. 系统将自动：
   - nio分析需求，决定调用哪些专家
   - 各专家基于专业提示词给出建议
   - nio综合所有意见，提供最终方案

### 步骤3: 查看专家建议

- **左侧对话区**: nio综合后的最终建议
- **右侧专家面板**: 查看各专家的详细分析
- **专家卡片**: 显示专家头像、角色、核心建议

---

## 专家提示词详解

### nio - 核心编排代理 🎯

**职责**:
1. 深入理解用户需求，识别核心目标
2. 智能分析需要调动哪些专家
3. 综合各专家意见，提供结构化方案
4. 确保方案可执行性和MVP原则
5. 引导用户完善需求，推进迭代

**特点**:
- 全局视角：多维度思考
- 实战导向：快速验证、迭代优化
- 风险意识：提前识别问题
- 结构化思维：清晰的优先级和时间线

**回复格式**:
1. 确认理解需求（1-2句）
2. 说明调动了哪些专家及原因
3. 提供3-5条核心建议（带优先级）
4. 给出下一步具体行动

### product-manager - 产品经理 📋

**专长**:
1. 需求挖掘：识别真实痛点，提炼价值主张
2. 功能规划：划分P0/P1/P2优先级，定义MVP
3. 用户体验：设计用户旅程，优化转化路径
4. 数据驱动：定义核心指标，设计A/B测试
5. 竞品分析：对标标杆，找差异化

**分析框架**:
- 用户价值 = 解决的痛点 × 解决的程度
- 功能优先级 = 用户价值 × 实现成本倒数
- PMF验证 = 留存率 + NPS + 增长曲线

### tech-architect - 技术架构师 🏗️

**专长**:
1. 技术选型：评估框架、数据库、云服务
2. 架构设计：可扩展、高可用、易维护
3. 性能优化：分析瓶颈，缓存、索引、异步
4. 技术债务：识别风险，制定重构计划
5. 团队赋能：代码规范、最佳实践

**架构原则**:
- 合适 > 先进
- 简单 > 复杂
- 模块化 > 单体
- 可观测性完善

**技术栈建议**:
- Web应用：React/Vue + Node.js/Go + PostgreSQL/MongoDB
- 移动应用：React Native/Flutter
- 微服务：Docker + Kubernetes + gRPC

### ux-designer - UX设计师 🎨

**专长**:
1. 交互设计：高效操作流程，减少认知负担
2. 视觉设计：视觉层级，信息传达清晰
3. 用户研究：用户访谈、可用性测试
4. 设计系统：组件库、设计规范
5. 响应式设计：多端适配

**设计原则**:
- Don't Make Me Think
- 即时反馈
- 容错性
- 渐进式呈现
- 一致性

### data-analyst - 数据分析师 📊

**专长**:
1. 指标体系：定义North Star Metric和KPI
2. 数据埋点：设计埋点方案
3. 漏斗分析：识别转化瓶颈
4. 用户分层：RFM模型、用户画像
5. A/B测试：实验设计、显著性检验
6. 增长模型：AARRR、增长黑客

**分析框架**:
- 核心指标：DAU/MAU、留存率、ARPU、LTV
- 转化漏斗：认知→兴趣→行动→留存→推荐
- 增长引擎：内容、社交、付费、病毒式

### qa-engineer - QA工程师 🔍

**专长**:
1. 测试策略：单元、集成、E2E、性能测试
2. 测试设计：用例设计、边界值、异常流程
3. 自动化：CI/CD集成、自动化框架
4. 质量标准：代码覆盖率、Bug密度
5. 风险管理：识别高风险功能

**测试金字塔**:
- 单元测试（70%）：函数级别
- 集成测试（20%）：模块协作
- E2E测试（10%）：用户场景

---

## 自定义专家教程

### 方法1: 通过API添加

```javascript
// 发送POST请求到 /api/ai/experts/custom
fetch('/api/ai/experts/custom', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    id: 'marketing-expert',
    name: 'marketing-expert',
    role: '市场营销专家',
    systemPrompt: `你是破界实验室的市场营销专家，擅长品牌定位、增长策略、营销渠道。

你的专长：
1. 品牌定位：目标用户、品牌形象、差异化
2. 增长策略：获客渠道、转化优化、留存提升
3. 内容营销：内容策略、SEO/SEM、社交媒体
4. 数据分析：营销ROI、漏斗分析、归因模型

回复要点：
- 基于数据的营销策略
- 具体的渠道和预算建议
- 可衡量的营销目标
- 案例和最佳实践`,
    expertiseAreas: ['品牌定位', '增长策略', '内容营销', '数据分析'],
    triggerKeywords: ['营销', '推广', '品牌', '获客', '增长']
  })
})
```

### 方法2: 直接编辑配置文件

编辑 `backend/config/expert-prompts.json`，添加新专家：

```json
{
  "marketing-expert": {
    "id": "marketing-expert",
    "name": "marketing-expert",
    "role": "市场营销专家",
    "systemPrompt": "...",
    "expertiseAreas": ["品牌定位", "增长策略"],
    "triggerKeywords": ["营销", "推广"],
    "custom": true
  }
}
```

**注意**: 方法2需要重启后端服务。

### 删除自定义专家

```javascript
// 发送DELETE请求到 /api/ai/experts/custom/:id
fetch('/api/ai/experts/custom/marketing-expert', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## 工作流程图

```
用户输入问题
     ↓
[前端] WorkbenchView
     ↓
POST /api/ai/chat
     ↓
[后端] ai.js → getUserApiConfig(userId)
     ↓
调用 intelligentConversation()
     ↓
┌─────────────────────────────────────────┐
│ Step 1: nio编排                         │
│ nioOrchestrate(userInput, apiConfig)    │
│ → AI分析或关键词匹配                    │
│ → 返回: {experts: [...], reasoning}     │
└─────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────┐
│ Step 2: 并行调用专家                    │
│ Promise.all([                           │
│   callExpert('product-manager', ...),   │
│   callExpert('tech-architect', ...),    │
│   ...                                   │
│ ])                                      │
│ → 每个专家基于systemPrompt分析         │
└─────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────┐
│ Step 3: nio综合                         │
│ nioSynthesize(userInput,                │
│               expertResponses,          │
│               apiConfig)                │
│ → nio综合所有专家意见                  │
│ → 提供结构化的最终建议                 │
└─────────────────────────────────────────┘
     ↓
返回给前端
     ↓
[前端] 展示专家回复和nio建议
```

---

## API调用示例

### 示例1: 产品需求咨询

**用户输入**:
```
我想做一个在线教育平台，帮助中小学生提升学习效率
```

**系统处理**:
1. nio分析：涉及产品设计、技术架构、用户体验
2. 调用专家：product-manager、tech-architect、ux-designer
3. 各专家分析：
   - 产品经理：目标用户、核心功能、商业模式
   - 技术架构师：技术选型、系统架构、扩展性
   - UX设计师：用户体验、交互设计、学习路径
4. nio综合：提供优先级清晰的MVP方案

**AI回复**（nio综合后）:
```
基于您的教育平台需求，我已调动产品经理、技术架构师和UX设计师进行分析。

【需求确认】
目标：中小学在线教育平台，核心价值是提升学习效率

【核心建议】（按优先级）

P0 - MVP核心功能：
1. 视频课程系统（录播+直播）
2. 作业提交与批改
3. 学习进度跟踪
4. 学生-教师互动（问答、讨论）

P1 - 增强功能：
1. 个性化学习路径推荐
2. 学习数据分析与报告
3. 游戏化激励机制

P2 - 优化功能：
1. AI智能答疑
2. 家长监控端
3. 多人协作学习

【技术方案】
- 前端：React（Web）+ React Native（移动端）
- 后端：Node.js + Express
- 数据库：PostgreSQL（用户数据）+ MongoDB（学习记录）
- 视频：七牛云/阿里云点播
- 直播：Agora/腾讯云

【下一步行动】
1. 细化目标用户画像（年龄、学科、痛点）
2. 设计核心用户旅程（从注册到完成第一节课）
3. 制作产品原型，收集5-10位种子用户反馈
4. 搭建技术框架，实现MVP核心功能
5. 设计数据埋点方案，追踪核心指标（完课率、留存率）

建议开发周期：MVP阶段2-3个月
```

### 示例2: 技术问题咨询

**用户输入**:
```
我的系统响应速度很慢，如何优化性能？
```

**系统处理**:
1. nio分析：主要是技术问题
2. 调用专家：tech-architect、data-analyst
3. nio综合：提供系统化的性能优化方案

---

## 配置文件说明

### 用户配置结构

存储在：`backend/api/data/configs.json`

```json
{
  "userId": "user_abc123",
  "apiConfigs": {
    "apiProvider": "siliconflow",
    "apiEndpoint": "https://api.siliconflow.cn/v1",
    "apiKey": "sk-...",
    "modelName": "Qwen/Qwen2.5-7B-Instruct",
    "temperature": 0.7,
    "maxTokens": 2000
  },
  "expertModels": {
    "nio": {
      "modelName": "Qwen/Qwen2.5-7B-Instruct",
      "temperature": 0.3
    },
    "product-manager": {
      "modelName": "Qwen/Qwen2.5-7B-Instruct",
      "temperature": 0.7
    }
  },
  "updatedAt": "2024-12-15T10:00:00.000Z"
}
```

**说明**:
- `apiConfigs`: 默认API配置，所有专家共用
- `expertModels`: 单个专家的特定配置（可选，会覆盖默认配置）
- 如果专家没有单独配置，使用 `apiConfigs`

---

## 常见问题FAQ

### Q1: 如何切换AI提供商？

A: 在"模型配置"页面修改：
- OpenAI: `https://api.openai.com/v1`
- 硅基流动: `https://api.siliconflow.cn/v1`
- 其他兼容OpenAI API格式的服务

### Q2: 为什么专家没有被调用？

A: 可能原因：
1. API配置未设置或不正确
2. API密钥无效或余额不足
3. 网络连接问题
4. 后端服务未启动

**解决方法**:
- 检查浏览器控制台的错误信息
- 查看后端日志：`docker compose logs backend`
- 验证API配置是否正确

### Q3: 如何调整专家的回复风格？

A: 编辑 `backend/config/expert-prompts.json`，修改专家的 `systemPrompt`。

例如，让产品经理更简洁：
```json
{
  "product-manager": {
    "systemPrompt": "你是产品经理。回复要求：简洁、直接、可执行。每条建议不超过50字。"
  }
}
```

### Q4: nio选择专家的逻辑是什么？

A: 两种方式：
1. **AI智能分析**（优先）: nio分析用户需求，自主决定
2. **关键词匹配**（降级）: 如果AI调用失败，使用关键词匹配

### Q5: 如何查看API调用日志？

A: 查看后端日志：
```bash
# 实时查看
docker compose logs -f backend

# 查看最近100行
docker compose logs backend --tail 100
```

日志会显示：
- `[AI调用] 提供商: siliconflow, 模型: Qwen/Qwen2.5-7B-Instruct`
- `[nio编排] 开始分析`
- `[专家调用] 产品经理 (product-manager) 开始分析`
- `[nio综合] 开始综合各专家意见`

### Q6: 自定义专家会被保存吗？

A:
- **方法1（API添加）**: 仅保存在内存中，重启后消失
- **方法2（编辑配置文件）**: 永久保存

如需持久化方法1的专家，需要实现数据库存储。

---

## 性能优化建议

### 1. 并行调用专家

已实现，使用 `Promise.all()` 并行调用所有专家，大幅缩短响应时间。

### 2. 缓存专家回复

对于相似问题，可以缓存专家回复：

```javascript
// 在ai-service.js中添加缓存
const responseCache = new Map()

function getCacheKey(expertId, userInput) {
  return `${expertId}:${userInput.substring(0, 50)}`
}

export async function callExpert(expertId, userInput, apiConfig) {
  const cacheKey = getCacheKey(expertId, userInput)

  if (responseCache.has(cacheKey)) {
    console.log(`[缓存命中] ${expertId}`)
    return responseCache.get(cacheKey)
  }

  const result = await // ... 实际调用

  responseCache.set(cacheKey, result)
  return result
}
```

### 3. 流式响应

实现SSE（Server-Sent Events）流式返回专家回复：

```javascript
// 前端
const eventSource = new EventSource('/api/ai/chat/stream')
eventSource.onmessage = (event) => {
  const chunk = JSON.parse(event.data)
  // 逐步展示回复
}
```

---

## 下一步规划

### 短期（1-2周）
- [ ] 实现自定义专家的持久化存储
- [ ] 添加专家回复的流式输出
- [ ] 优化专家选择算法（基于用户历史）

### 中期（1-2月）
- [ ] 多模型支持（不同专家使用不同模型）
- [ ] 专家协作模拟（专家之间的讨论）
- [ ] 用户反馈机制（对专家回复点赞/踩）

### 长期（3-6月）
- [ ] RAG知识库集成（专家基于项目文档回答）
- [ ] 多模态支持（图表、流程图生成）
- [ ] 专家学习机制（基于用户反馈优化提示词）

---

## 贡献指南

### 添加新的内置专家

1. 编辑 `backend/config/expert-prompts.json`
2. 按照现有格式添加新专家
3. 编写详细的systemPrompt
4. 定义expertiseAreas和triggerKeywords
5. 重启后端服务

### 改进专家提示词

1. 测试现有专家的回复质量
2. 识别问题（不够专业、冗余、偏题等）
3. 修改systemPrompt
4. A/B测试新旧版本
5. 提交Pull Request

---

## 技术栈

- **后端**: Node.js + Express
- **前端**: React 18 + Vite
- **AI调用**: OpenAI API格式（兼容多种提供商）
- **数据存储**: JSON文件（可扩展为数据库）

---

## 联系与反馈

- GitHub Issues: https://github.com/Handsome5201314/NioPD/issues
- 服务器日志: `docker compose logs backend`
- 浏览器控制台: F12查看前端日志

---

**文档版本**: 1.0.0
**最后更新**: 2024-12-15
**系统状态**: ✅ 已部署并运行

**核心特性**:
✅ 专家提示词系统
✅ nio智能编排
✅ 用户API配置
✅ 并行专家调用
✅ 自定义专家支持
✅ 错误降级处理
