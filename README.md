# AI Todo List - Full Stack Application

一个智能待办事项管理应用，集成 AI 能力，支持任务管理、智能对话和自动总结。

## ✨ 功能特性

### 核心功能
- **📋 任务管理**：创建、更新、删除、标记完成待办事项
- **🤖 AI 智能对话**：基于 OpenAI 的智能助手，可进行自然语言交互
- **📝 自动总结**：每日任务自动总结与提醒
- **🔄 定时任务**：支持定时执行的自动化任务

### 技术亮点
- RESTful API 设计
- MongoDB 数据持久化（支持内存模式）
- CORS 跨域支持
- 环境变量配置
- 健康检查端点

## 🛠 技术栈

### 后端
- **运行时**：Node.js
- **框架**：Express.js
- **数据库**：MongoDB + Mongoose
- **AI 服务**：OpenAI API
- **任务调度**：node-cron

### 前端
- **框架**：React 19
- **构建工具**：Vite
- **样式**：TailwindCSS
- **代码规范**：ESLint

## 📁 项目结构

```
awesome-todo-chatbot/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── app.js          # Express 应用入口
│   │   ├── models/         # 数据模型
│   │   │   └── Task.js    # 任务模型
│   │   ├── routes/        # API 路由
│   │   │   ├── tasks.js   # 任务相关接口
│   │   │   ├── chat.js    # AI 对话接口
│   │   │   └── summary.js # 总结接口
│   │   └── services/      # 业务逻辑层
│   └── package.json
│
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面
│   │   ├── context/       # 状态管理
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── services/      # API 服务
│   │   └── utils/         # 工具函数
│   └── package.json
│
└── README.md
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/stephenkingsley/awesome-todo-chatbot.git
cd awesome-todo-chatbot
```

### 2. 后端配置

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入以下配置：
# - MONGODB_URI: MongoDB 连接字符串
# - OPENAI_API_KEY: OpenAI API 密钥
# - PORT: 服务端口（默认 3000）

# 启动服务
npm start  # 或 node src/app.js
```

### 3. 前端配置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📚 API 文档

### 基础信息
- **Base URL**: `http://localhost:3000/api`
- **健康检查**: `GET /api/health`

### 任务接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/tasks` | 获取所有任务 |
| POST | `/tasks` | 创建新任务 |
| PUT | `/tasks/:id` | 更新任务 |
| DELETE | `/tasks/:id` | 删除任务 |

### AI 对话接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/chat` | 发送消息给 AI 助手 |

### 总结接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/summary` | 生成任务总结 |

## ⚙️ 环境变量

### 后端 (.env)

```env
# MongoDB 连接字符串
MONGODB_URI=mongodb://localhost:27017/awesome-todo-chatbot

# OpenAI API 密钥
OPENAI_API_KEY=your_openai_api_key_here

# 服务器端口
PORT=3000
```

## 🔧 开发和部署

### 开发模式

```bash
# 后端（自动重启）
cd backend
npm install -g nodemon
nodemon src/app.js

# 前端（热重载）
cd frontend
npm run dev
```

### 生产部署

```bash
# 1. 构建前端
cd frontend
npm run build

# 2. 配置生产环境变量
cd ../backend
# 确保 .env 包含生产环境配置

# 3. 使用 PM2 启动后端
npm install -g pm2
pm2 start src/app.js --name awesome-todo-chatbot

# 4. 配置 Nginx 反向代理
```

## 📝 许可证

本项目采用 MIT 许可证。

## 🤝 贡献指南

欢迎贡献代码！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

## 📧 联系方式

如有问题或建议，请提交 Issue 或联系开发者。

---

**Made with ❤️ by stephenkingsley**
