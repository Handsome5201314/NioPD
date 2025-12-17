---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 30460221009579cada9d9a0623d96a4525c69f29f685202e48107a70c467ef70957f28e4a702210086e835ab883275e092f7f1211574b60f90cdb6faf401a38e9d46a1e635794781
    ReservedCode2: 3045022100c26981dcfc2814a7394f591cc335da3591e0ca84607115f63e850453446f1a06022073844f8d548b3d84a300a3a36f6fa45cdb0acf5d47ced7f0b009e21d5afee211
---

# Docker 快速部署

## 一键部署命令

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/niopd-visualization.git
cd niopd-visualization

# 2. 启动服务
docker compose up -d

# 3. 查看状态
docker compose ps
```

## 访问地址

- 前端: http://your-server-ip
- 后端 API: http://your-server-ip:3001/api/health

## 常用命令

```bash
# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 更新部署
git pull && docker compose up -d --build

# 数据备份
docker run --rm -v 破解实验室一人项目系统_backend-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .
```

## 详细文档

请查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取完整部署指南。
