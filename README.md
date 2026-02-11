# AI Todo List - Full Stack Application

An intelligent todo list application with AI integration, supporting task management, smart chat, and auto summarization.

## ✨ Features

### Core Features
- **📋 Task Management**: Create, update, delete, and complete todos
- **🤖 AI Smart Chat**: AI assistant based on OpenAI for natural language interaction
- **📝 Auto Summary**: Daily task summarization and reminders
- **🔄 Scheduled Tasks**: Automated task execution support

### Technical Highlights
- RESTful API design
- MongoDB persistence (in-memory mode available)
- CORS support
- Environment variable configuration
- Health check endpoint

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **AI Service**: OpenAI API
- **Task Scheduling**: node-cron

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Linting**: ESLint

## 📁 Project Structure

```
awesome-todo-chatbot/
├── backend/                 # Backend service
│   ├── src/
│   │   ├── app.js          # Express entry point
│   │   ├── models/         # Data models
│   │   │   └── Task.js    # Task model
│   │   ├── routes/         # API routes
│   │   │   ├── tasks.js   # Task endpoints
│   │   │   ├── chat.js    # AI chat endpoints
│   │   │   └── summary.js # Summary endpoints
│   │   └── services/       # Business logic layer
│   └── package.json
│
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Pages
│   │   ├── context/        # State management
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/stephenkingsley/awesome-todo-chatbot.git
cd awesome-todo-chatbot
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add:
# - MONGODB_URI: MongoDB connection string
# - OPENAI_API_KEY: OpenAI API key
# - PORT: Server port (default 3000)

# Start the server
npm start  # or node src/app.js
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📚 API Documentation

### Base Info
- **Base URL**: `http://localhost:3000/api`
- **Health Check**: `GET /api/health`

### Task Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks` | Get all tasks |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

### AI Chat Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/chat` | Send message to AI assistant |

### Summary Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/summary` | Generate task summary |

## ⚙️ Environment Variables

### Backend (.env)

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/awesome-todo-chatbot

# OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here

# Server port
PORT=3000
```

## 🔧 Development & Deployment

### Development Mode

```bash
# Backend (auto-restart)
cd backend
npm install -g nodemon
nodemon src/app.js

# Frontend (hot reload)
cd frontend
npm run dev
```

### Production Deployment

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Configure production environment
cd ../backend
# Ensure .env has production settings

# 3. Start backend with PM2
npm install -g pm2
pm2 start src/app.js --name awesome-todo-chatbot

# 4. Configure Nginx reverse proxy
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📧 Contact

For questions or suggestions, please open an issue or contact the developer.

---

**Made with ❤️ by stephenkingsley**
