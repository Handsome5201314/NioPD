---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3044022007f6d21cffcc56f7b8a6d78f3128fe204b7e9eb1ae6c117795da3fdb371a1a470220552f0fff219fad71d5be451f7b28a76ebc79d5f099f655ae2d785939b90bf164
    ReservedCode2: 3044022013c675addaa1aa3f327a92bd60f4946296a5c96be164b8d8c28715fd1163f2a202203880f95ea53539b6a06d9619d4352ff0273ac3f83df0545d80875195e5a5daca
---

# 破界实验室一人公司 - Docker 部署指南

## 目录
- [系统要求](#系统要求)
- [快速部署](#快速部署)
- [详细部署步骤](#详细部署步骤)
- [配置说明](#配置说明)
- [维护管理](#维护管理)
- [故障排查](#故障排查)
- [安全建议](#安全建议)

## 系统要求

### 服务器配置
- 操作系统: Ubuntu Server 24.04 LTS 64bit
- CPU: 2核及以上
- 内存: 2GB 及以上
- 磁盘: 10GB 及以上可用空间

### 软件依赖
- Docker: 20.10 或更高版本
- Docker Compose: 2.0 或更高版本
- Git: 2.25 或更高版本

## 快速部署

### 1. 安装 Docker 和 Docker Compose

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo apt install docker-compose-plugin -y

# 验证安装
docker --version
docker compose version
```

### 2. 克隆项目

```bash
# 克隆 GitHub 仓库
git clone https://github.com/your-username/niopd-visualization.git

# 进入项目目录
cd niopd-visualization
```

### 3. 一键启动

```bash
# 构建并启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

### 4. 访问应用

浏览器打开: `http://your-server-ip`

## 详细部署步骤

### 步骤 1: 准备服务器

1. **登录服务器**
```bash
ssh username@your-server-ip
```

2. **配置防火墙**
```bash
# 允许 HTTP 和 HTTPS 流量
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 步骤 2: 安装依赖

按照"快速部署"中的步骤安装 Docker 和 Docker Compose。

### 步骤 3: 获取代码

```bash
# 从 GitHub 克隆项目
git clone https://github.com/your-username/niopd-visualization.git
cd niopd-visualization
```

### 步骤 4: 配置环境变量（可选）

```bash
# 复制环境变量模板
cp .env.example .env
cp backend/.env.example backend/.env

# 编辑配置文件（如需自定义）
nano .env
nano backend/.env
```

### 步骤 5: 构建和启动

```bash
# 构建 Docker 镜像
docker compose build

# 启动服务
docker compose up -d

# 验证服务运行状态
docker compose ps
```

### 步骤 6: 验证部署

```bash
# 检查后端健康状态
curl http://localhost:3001/api/health

# 检查前端
curl http://localhost:80
```

## 配置说明

### 架构说明

```
┌─────────────────────┐
│   Nginx (前端)      │  Port 80
│   - 静态文件服务    │
│   - API 反向代理    │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Express (后端)     │  Port 3001
│  - RESTful API      │
│  - 用户认证         │
│  - 数据存储         │
└─────────────────────┘
```

### 端口配置

- **前端服务**: 80 (HTTP)
- **后端服务**: 3001 (API)

### 数据持久化

用户数据存储在 Docker Volume 中:
```bash
# 查看数据卷
docker volume ls | grep niopd

# 备份数据卷
docker run --rm -v 破解实验室一人项目系统_backend-data:/data -v $(pwd):/backup alpine tar czf /backup/backup-$(date +%Y%m%d).tar.gz -C /data .

# 恢复数据卷
docker run --rm -v 破解实验室一人项目系统_backend-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup-YYYYMMDD.tar.gz -C /data
```

## 维护管理

### 日常操作

```bash
# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f frontend
docker compose logs -f backend

# 重启服务
docker compose restart

# 停止服务
docker compose stop

# 启动服务
docker compose start

# 完全停止并删除容器
docker compose down
```

### 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker compose up -d --build

# 清理旧镜像
docker image prune -f
```

### 扩展配置

#### 使用 HTTPS (推荐)

1. 安装 Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

2. 获取 SSL 证书:
```bash
sudo certbot --nginx -d your-domain.com
```

3. 修改 docker-compose.yml 添加 443 端口映射。

#### 修改端口

编辑 `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "8080:80"  # 修改为其他端口
```

## 故障排查

### 常见问题

#### 1. 容器无法启动

```bash
# 查看详细错误日志
docker compose logs

# 检查端口占用
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3001
```

#### 2. 前端无法连接后端

- 检查 nginx.conf 中的 backend 地址配置
- 确认后端服务正在运行: `docker compose ps`
- 检查网络连接: `docker network inspect 破解实验室一人项目系统_niopd-network`

#### 3. 数据丢失

- 确认数据卷存在: `docker volume ls`
- 定期备份数据（见"数据持久化"章节）

#### 4. 性能问题

```bash
# 查看资源使用情况
docker stats

# 限制资源使用（编辑 docker-compose.yml）
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### 日志分析

```bash
# 查看最近 100 行日志
docker compose logs --tail=100

# 持续监控日志
docker compose logs -f --tail=50

# 导出日志
docker compose logs > logs.txt
```

## 安全建议

### 1. 隐私保护

- ✅ `.gitignore` 已配置，防止敏感文件上传
- ✅ 用户数据存储在 Docker Volume 中，不会被提交到 Git
- ✅ 环境变量使用 `.env` 文件，模板文件为 `.env.example`

### 2. 生产环境建议

#### 修改密码哈希算法

当前使用的是 SHA256，建议在生产环境中升级为 bcrypt:

```bash
# 在 backend 目录安装 bcrypt
cd backend
npm install bcrypt
```

然后修改 `backend/api/auth.js` 中的 `hashPassword` 函数。

#### 添加 JWT 认证

当前使用简单的 token 机制，生产环境建议使用 JWT:

```bash
cd backend
npm install jsonwebtoken
```

#### 使用数据库

当前使用 JSON 文件存储，建议使用数据库（如 MongoDB、PostgreSQL）:

```yaml
# 在 docker-compose.yml 添加数据库服务
services:
  mongodb:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your-password
```

### 3. 网络安全

```bash
# 配置防火墙只允许必要端口
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 定期更新系统
sudo apt update && sudo apt upgrade -y
```

### 4. 访问控制

- 使用强密码
- 启用 HTTPS
- 配置 Nginx 访问限制
- 定期更新依赖包

### 5. 监控和备份

```bash
# 设置自动备份 (crontab)
crontab -e

# 添加每天凌晨 2 点备份
0 2 * * * cd /path/to/niopd-visualization && docker run --rm -v 破解实验室一人项目系统_backend-data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/backup-$(date +\%Y\%m\%d).tar.gz -C /data .
```

## 技术支持

如遇到问题，请:

1. 查看日志: `docker compose logs`
2. 检查 GitHub Issues
3. 提交 Issue 并附带错误日志

## 许可证

请参考项目根目录的 LICENSE 文件。
