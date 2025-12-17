---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 304502205a4744ced536d0047296040510761358fd82cfb219332674d1e553e1ac1ce82f022100c848c2b19bbceacb03388eb218893e79ced1e1de068eed05eadf5df25f4a4afe
    ReservedCode2: 30440220347451b79a8516d7b27572d740d009457bcef65b3796c94b3004b673af52f24d0220397be979cb52d99842033ab67b9ec37d45b5dd4e51914103b17c2a0d55e829a2
---

# 服务器部署故障排查指南

## 问题 1：容器没有启动

### 症状
```bash
docker compose ps
# 显示空列表，没有容器
```

### 解决方案

**步骤 1：构建并启动容器**
```bash
# 在项目根目录执行
docker compose up -d --build
```

**步骤 2：查看构建日志**
```bash
# 如果构建失败，查看详细日志
docker compose build --no-cache
```

**步骤 3：验证容器状态**
```bash
# 查看运行中的容器
docker compose ps

# 应该看到：
# NAME              IMAGE                     STATUS
# niopd-backend     niopd-backend             Up
# niopd-frontend    niopd-frontend            Up
```

**步骤 4：查看日志**
```bash
# 查看所有服务日志
docker compose logs -f

# 或者分别查看
docker compose logs -f backend
docker compose logs -f frontend
```

---

## 问题 2：Docker Compose 版本警告

### 症状
```
WARN[0000] /root/NioPD/docker-compose.yml: the attribute `version` is obsolete
```

### 原因
Docker Compose v2.x 已废弃 `version` 字段

### 解决方案
已修复：删除 docker-compose.yml 第一行的 `version: '3.8'`

---

## 问题 3：端口被占用

### 症状
```
Error: bind: address already in use
```

### 解决方案
```bash
# 检查 80 端口占用
sudo netstat -tulpn | grep :80

# 检查 3001 端口占用
sudo netstat -tulpn | grep :3001

# 停止占用端口的服务
sudo systemctl stop apache2  # 如果是 Apache
sudo systemctl stop nginx    # 如果是 Nginx

# 或者修改 docker-compose.yml 中的端口映射
# 例如：将 "80:80" 改为 "8080:80"
```

---

## 问题 4：构建失败 - vite: not found

### 症状
```
ERROR [frontend builder 6/6] RUN npm run build
sh: vite: not found
exit code: 127
```

### 原因
Dockerfile 中使用了 `npm ci --only=production`，跳过了 devDependencies 中的构建工具（vite）

### 解决方案
已修复：前端 Dockerfile 现在会安装所有依赖（包括 devDependencies）

**拉取最新代码并重新构建：**
```bash
cd ~/NioPD
git pull
docker compose up -d --build
```

---

## 问题 5：其他构建失败

### 症状
```
ERROR [backend] failed to solve
```

### 常见原因和解决方案

**原因 1：网络问题**
```bash
# 使用国内镜像加速
# 编辑 /etc/docker/daemon.json
sudo nano /etc/docker/daemon.json

# 添加以下内容
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://registry.docker-cn.com"
  ]
}

# 重启 Docker
sudo systemctl restart docker
```

**原因 2：磁盘空间不足**
```bash
# 检查磁盘空间
df -h

# 清理 Docker 缓存
docker system prune -a
```

**原因 3：内存不足**
```bash
# 检查内存
free -h

# 如果内存不足，增加 swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 问题 5：前端无法访问后端

### 症状
浏览器访问正常，但 API 调用失败

### 解决方案

**检查 1：后端服务是否运行**
```bash
docker compose ps backend
docker compose logs backend

# 测试后端健康状态
curl http://localhost:3001/api/health
```

**检查 2：网络连接**
```bash
# 进入前端容器
docker exec -it niopd-frontend sh

# 测试连接后端
wget -O- http://backend:3001/api/health
```

**检查 3：Nginx 配置**
```bash
# 查看 Nginx 配置
docker exec niopd-frontend cat /etc/nginx/conf.d/default.conf

# 重启前端服务
docker compose restart frontend
```

---

## 问题 6：数据丢失

### 症状
用户数据在重启后消失

### 解决方案

**检查数据卷**
```bash
# 列出数据卷
docker volume ls | grep backend-data

# 检查数据卷内容
docker run --rm -v niopd_backend-data:/data alpine ls -la /data
```

**备份数据**
```bash
# 创建备份
docker run --rm -v niopd_backend-data:/data -v $(pwd):/backup alpine tar czf /backup/backup-$(date +%Y%m%d).tar.gz -C /data .

# 恢复数据
docker run --rm -v niopd_backend-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup-YYYYMMDD.tar.gz -C /data
```

---

## 完整部署流程

### 方法 1：从零开始

```bash
# 1. 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin -y

# 2. 克隆项目
git clone https://github.com/your-username/niopd-visualization.git
cd niopd-visualization

# 3. 构建并启动
docker compose up -d --build

# 4. 查看状态
docker compose ps

# 5. 查看日志
docker compose logs -f

# 6. 测试访问
curl http://localhost:80
curl http://localhost:3001/api/health
```

### 方法 2：更新现有部署

```bash
# 1. 停止服务
docker compose down

# 2. 拉取最新代码
git pull

# 3. 重新构建并启动
docker compose up -d --build

# 4. 验证
docker compose ps
docker compose logs -f
```

---

## 常用调试命令

```bash
# 查看容器状态
docker compose ps

# 查看所有日志
docker compose logs

# 查看特定服务日志
docker compose logs backend
docker compose logs frontend

# 实时跟踪日志
docker compose logs -f

# 进入容器调试
docker exec -it niopd-backend sh
docker exec -it niopd-frontend sh

# 重启服务
docker compose restart

# 停止服务
docker compose stop

# 启动服务
docker compose start

# 完全删除（包括数据卷）
docker compose down -v

# 查看资源使用
docker stats

# 查看网络
docker network ls
docker network inspect niopd_niopd-network

# 查看数据卷
docker volume ls
docker volume inspect niopd_backend-data
```

---

## 性能优化

### 1. 限制资源使用

编辑 docker-compose.yml：
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 2. 启用日志轮转

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 安全检查清单

- [ ] 端口 80 和 3001 已通过防火墙开放
- [ ] 配置了 HTTPS（生产环境必需）
- [ ] 定期备份数据卷
- [ ] 更新了默认密码和密钥
- [ ] 启用了日志监控
- [ ] 定期更新镜像和依赖

---

## 获取帮助

如果以上方法都无法解决问题：

1. 收集完整日志：
   ```bash
   docker compose logs > debug.log 2>&1
   ```

2. 检查系统信息：
   ```bash
   docker version
   docker compose version
   uname -a
   free -h
   df -h
   ```

3. 在 GitHub Issues 中提交问题，附带上述日志和系统信息
