# 🤖 AI Todo List

> An intelligent personal task assistant powered by LLM, enabling natural language task management through conversational interaction.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)

## 📖 Overview

AI Todo List is a modern, AI-powered task management application designed for individuals who prefer natural language interaction over traditional form-based task entry. Simply chat with the assistant to create, modify, and manage your tasks.

### 🎯 Product Positioning

**For busy professionals and individuals who:**
- Think in natural language and want to capture tasks quickly
- Need an intelligent assistant to understand context and intent
- Want smart task summarization and insights
- Prefer conversation over clicking through forms

**Value Proposition:**
- **Speed**: Capture tasks in seconds with natural language
- **Intelligence**: AI understands your intent and extracts task details automatically
- **Insight**: Get AI-generated summaries and productivity insights
- **Flexibility**: Supports multiple LLM providers (OpenAI, MiniMax)

## ✨ Features

| Feature | Description |
|---------|-------------|
| **💬 Natural Language Entry** | Create tasks by simply typing: "Meeting with John tomorrow at 3pm" |
| **🤖 Smart Intent Recognition** | AI automatically detects whether you want to create, modify, or delete tasks |
| **📝 Auto Task Parsing** | Automatically extracts title, priority, due date, and tags from your messages |
| **📊 AI Summaries** | Get intelligent summaries of your task completion rates and productivity trends |
| **🔄 Multi-Provider Support** | Choose between OpenAI, MiniMax, or local fallback |
| **🌙 Dark Mode Ready** | Modern UI built with TailwindCSS |

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB + Mongoose** | Data persistence |
| **OpenAI / MiniMax SDK** | LLM integration |
| **node-cron** | Scheduled tasks |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Vite** | Build tool |
| **TailwindCSS** | Styling |
| **ESLint** | Code quality |

## 📁 Project Structure

```
awesome-todo-chatbot/
├── backend/                      # Backend service
│   ├── src/
│   │   ├── app.js               # Express application entry
│   │   ├── models/              # Mongoose schemas
│   │   │   └── Task.js         # Task model
│   │   ├── routes/             # API endpoints
│   │   │   ├── tasks.js        # CRUD operations
│   │   │   ├── chat.js         # AI chat & intent recognition
│   │   │   └── summary.js      # AI-powered summaries
│   │   └── services/           # Business logic
│   │       └── aiManager.js    # Multi-provider AI manager
│   │       └── providers/      # LLM provider implementations
│   │           ├── openai.js   # OpenAI GPT
│   │           ├── minimax.js  # MiniMax abab series
│   │           └── simple.js   # Rule-based fallback
│   └── package.json
│
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── context/           # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API client services
│   │   └── utils/             # Utility functions
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API Key or MiniMax API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/stephenkingsley/awesome-todo-chatbot.git
cd awesome-todo-chatbot

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration (see Environment Variables below)
npm start

# In a new terminal, setup frontend
cd ../frontend
npm install
npm run dev
```

### Environment Variables

```env
# ========================================
# AI Provider Configuration
# ========================================
# Choose: auto (recommended), openai, minimax, or simple
AI_PROVIDER=auto

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key
OPENAI_BASE_URL=  # Optional: custom endpoint for proxies

# MiniMax Configuration (Chinese-friendly)
# Get API key from: https://api.minimax.chat/
MINIMAX_API_KEY=your-minimax-key
MINIMAX_API_GROUP=default

# Database
MONGODB_URI=mongodb://localhost:27017/ai-todo-list

# Server
PORT=3000
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Task Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Retrieve all tasks |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

#### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Natural language task management |
| POST | `/chat/create-task` | Direct task creation from text |
| POST | `/chat/modify-task` | Task modification via chat |

#### AI Summary
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/summary` | Generate task summary with AI |

#### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health status |

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Code Style
```bash
# Lint backend
cd backend && npm run lint

# Lint frontend  
cd frontend && npm run lint
```

## 🚢 Deployment

### Docker (Recommended)
```bash
docker-compose up -d
```

### Manual Production Deployment
```bash
# Build frontend
cd frontend && npm run build

# Start with PM2
cd ../backend
pm2 start src/app.js --name ai-todo-list

# Configure Nginx for reverse proxy
```

## 🔌 Supported LLM Providers

| Provider | Models | Language | Notes |
|----------|--------|----------|-------|
| **OpenAI** | GPT-3.5-turbo, GPT-4, GPT-4o | English, Multilingual | Industry standard |
| **MiniMax** | abab6.5-chat, abab6.5s-chat | Chinese, English | Great for Chinese users |
| **Simple** | rule-based | All | No API key required |

### Selecting Provider
```bash
# Auto-select best available (recommended)
AI_PROVIDER=auto

# Force specific provider
AI_PROVIDER=openai
AI_PROVIDER=minimax
AI_PROVIDER=simple
```

## 📈 Roadmap

- [ ] Task categories and folders
- [ ] Calendar view integration
- [ ] Voice input support
- [ ] Mobile app (React Native)
- [ ] Team collaboration features
- [ ] More LLM providers (Claude, Gemini)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for GPT models
- [MiniMax](https://www.minimaxi.com/) for Chinese LLM support
- [Vite](https://vitejs.dev/) for fast frontend tooling

---

**Crafted with ❤️ by [stephenkingsley](https://github.com/stephenkingsley)**
