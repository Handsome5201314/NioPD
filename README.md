---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3045022073ebee30bbde73d6a0b1adb390cea8a993930f2cdeedb6359d8a261863414cf1022100f6a1a6712cd94660cb715b6f79a0c0129ce28e9681c991364b5dff220a21cf9c
    ReservedCode2: 3046022100e26d7f72a5fdd02eb68c0fc367227dedfbcb2e0b7b8a001cb43dc462d88b407e022100a4c2985cc46148a80cab3826b703a6916c0816edc545fc5aa0fee1d06367141e
---

# 破界实验室一人公司

基于 Docker 的可视化交互平台，集成AI专家系统，支持前后端分离部署。

## ✨ 核心功能

### 🤖 AI专家系统 (v2.2.0)
- **6位AI专家**：nio核心编排、产品经理、技术架构师、UX设计师、数据分析师、QA工程师
- **智能编排**：nio自动分析需求，决定调用哪些专家参与讨论
- **专家独立显示**：每个专家带有专属头像、颜色和角色标识
- **对话历史管理**：左侧面板显示所有对话，支持加载和删除
- **自动保存**：每次对话自动保存到服务端，永不丢失
- **三栏响应式布局**：历史面板 + 对话区域 + 活跃专家面板

### 📊 系统功能
- **前后端分离架构**：React + Express，独立部署，易于扩展
- **Docker 容器化**：一键部署，开箱即用
- **数据持久化**：用户数据通过 Docker Volume 持久化存储
- **API 驱动**：RESTful API 设计，支持多种数据操作
- **用户认证系统**：注册、登录、个人配置管理
- **响应式设计**：支持桌面和移动设备访问

## 技术栈

### 前端
- React 18
- Vite
- React Router
- 响应式CSS设计

### 后端
- Node.js + Express
- RESTful API
- JSON 文件存储（可扩展为数据库）

### AI集成
- 支持OpenAI格式API（硅基流动/OpenAI/其他兼容服务）
- 并行专家调用（Promise.all优化性能）
- 多轮对话上下文管理（最近6条消息）
- 自定义专家支持

### 部署
- Docker + Docker Compose
- Nginx（反向代理）

## 快速开始

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- Git

### 一键部署

```bash
# 克隆项目
git clone https://github.com/your-username/breakthrough-lab-solo-company.git
cd breakthrough-lab-solo-company

# 启动服务
docker compose up -d

# 查看运行状态
docker compose ps
```

访问 `http://your-server-ip` 即可使用。

### 本地开发

```bash
# 安装依赖
npm install
cd backend && npm install && cd ..

# 启动后端（终端1）
cd backend && npm start

# 启动前端（终端2）
npm run dev
```

访问 `http://localhost:5173`

### AI专家系统配置

1. 登录系统后，进入 **"⚙️ 模型配置"** 页面
2. 填写API配置：
   - API提供商：siliconflow / openai / 其他
   - API端点：https://api.siliconflow.cn/v1
   - API密钥：您的密钥
   - 模型名称：Qwen/Qwen2.5-7B-Instruct
3. 保存配置后，进入 **"🚀 智能工作台"** 开始使用

详细使用指南：[AI_QUICK_START.md](./AI_QUICK_START.md)

## 项目结构

```
.
├── backend/                 # 后端服务
│   ├── api/                # API 路由
│   │   ├── ai.js          # AI专家系统API
│   │   ├── auth.js        # 认证API
│   │   └── ...
│   ├── config/             # 配置文件
│   │   └── expert-prompts.json  # 专家提示词
│   ├── services/           # 业务逻辑
│   │   └── ai-service.js  # AI服务核心
│   ├── server.js           # 服务器入口
│   ├── Dockerfile          # 后端 Docker 配置
│   └── package.json
├── src/                     # 前端源码
│   ├── views/              # 页面组件
│   │   ├── WorkbenchViewV2.jsx    # 智能工作台V2
│   │   ├── WorkbenchViewV2.css    # 工作台样式
│   │   ├── ModelConfigView.jsx    # 模型配置
│   │   └── ...
│   ├── services/           # API 服务
│   └── App.jsx             # 应用入口
├── public/                  # 静态资源
├── Dockerfile              # 前端 Docker 配置
├── docker-compose.yml      # Docker Compose 配置
├── nginx.conf              # Nginx 配置
└── package.json            # 前端依赖
```

## API 接口

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息

### AI专家系统
- `POST /api/ai/chat` - 智能对话（主要接口）
- `GET /api/ai/experts` - 获取专家列表
- `GET /api/ai/experts/:id` - 获取专家详情
- `POST /api/ai/experts/custom` - 添加自定义专家
- `DELETE /api/ai/experts/custom/:id` - 删除自定义专家

### 数据管理
- `GET /api/user/conversations` - 获取对话历史
- `POST /api/user/conversations` - 保存对话
- `DELETE /api/user/conversations/:id` - 删除对话
- `GET /api/user/config` - 获取用户配置
- `POST /api/user/config` - 保存用户配置

### 健康检查
- `GET /api/health` - 服务健康状态

## 常用命令

```bash
# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 更新部署
git pull && docker compose up -d --build

# 数据备份
docker run --rm -v niopd_backend-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .
```

## 环境配置

项目使用环境变量进行配置，可以复制示例文件并修改：

```bash
# 前端配置
cp .env.example .env

# 后端配置
cp backend/.env.example backend/.env
```

## AI专家介绍

| 专家 | 角色 | 专长领域 |
|------|------|----------|
| nio 🎯 | 核心编排代理 | 需求分析、专家调度、综合建议、风险控制 |
| product-manager 📋 | 产品经理 | 需求挖掘、功能规划、用户体验、数据驱动 |
| tech-architect 🏗️ | 技术架构师 | 技术选型、架构设计、性能优化、技术债务 |
| ux-designer 🎨 | UX设计师 | 交互设计、视觉设计、用户研究、设计系统 |
| data-analyst 📊 | 数据分析师 | 指标体系、数据埋点、漏斗分析、增长模型 |
| qa-engineer 🔍 | QA工程师 | 测试策略、自动化测试、质量标准、风险管理 |

## 文档导航

### 核心文档
- [README.md](./README.md) - 本文档
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 完整部署文档
- [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md) - 快速部署指南
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 故障排查指南

### AI专家系统文档
- [AI_QUICK_START.md](./AI_QUICK_START.md) - 快速开始（3步上手）
- [AI_EXPERT_SYSTEM_GUIDE.md](./AI_EXPERT_SYSTEM_GUIDE.md) - 详细指南（架构、API、自定义）
- [WORKBENCH_V2_UPGRADE.md](./WORKBENCH_V2_UPGRADE.md) - V2升级报告

## 使用示例

### 产品咨询
```
用户：我想做一个在线教育平台，帮助中小学生提升学习效率

nio编排 → 调用产品经理、技术架构师、UX设计师

产品经理：分析目标用户、核心功能、MVP边界
技术架构师：设计系统架构、技术选型、扩展性
UX设计师：用户体验设计、交互流程、学习路径

nio综合 → 提供优先级清晰的实施方案
```

### 技术问题
```
用户：我的API响应速度很慢，平均需要2秒

nio编排 → 调用技术架构师、数据分析师

技术架构师：性能瓶颈诊断、优化方案（缓存、索引、异步）
数据分析师：性能监控指标、慢查询分析

nio综合 → 系统化的性能优化roadmap
```

## 性能指标

| 指标 | 数值 | 说明 |
|------|------|------|
| nio编排耗时 | 1-3秒 | AI分析决策时间 |
| 3专家并行分析 | 5-15秒 | 最慢专家的时间 |
| nio综合耗时 | 2-5秒 | 综合所有专家意见 |
| **完整对话流程** | **10-25秒** | 编排+专家+综合 |
| 前端渲染 | <100ms | UI响应速度 |
| 自动保存 | <500ms | 对话持久化 |

## 安全注意事项

- 用户数据存储在 `backend/api/data/` 目录，已通过 `.gitignore` 排除
- **API密钥安全**：用户配置的API密钥存储在服务端，不暴露到前端
- 生产环境建议使用 HTTPS
- 建议使用 bcrypt 替换当前的 SHA256 密码哈希
- 建议使用数据库（MongoDB/PostgreSQL）替代 JSON 文件存储
- 定期备份用户数据

## 版本历史

- **v2.2.0** (2025-12-15) - 工作台V2：专家独立显示、对话历史、自动保存
- **v2.1.0** (2025-12-15) - AI专家系统完整实现
- **v2.0.0** (2025-12-11) - 前后端分离架构
- **v1.0.0** (2025-12-11) - 初始版本

## 许可证

请参考项目根目录的 LICENSE 文件。

## 贡献

欢迎提交 Issue 和 Pull Request。

### 贡献指南
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 技术支持

如遇到问题：
1. 查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 故障排查部分
2. 查看 [AI_QUICK_START.md](./AI_QUICK_START.md) 常见问题
3. 检查 GitHub Issues
4. 提交新的 Issue 并附带错误日志

## 致谢

感谢所有为本项目做出贡献的开发者。

---

**当前版本**: v2.2.0
**最后更新**: 2025-12-15
**开发状态**: 🟢 Active Development

🤖 Built with [Claude Code](https://claude.com/claude-code)
