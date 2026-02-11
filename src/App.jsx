import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = '/api'

function App() {
  const [todos, setTodos] = useState([])
  const [view, setView] = useState('list') // 'list', 'chat', 'summary'
  const [loading, setLoading] = useState(false)

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 AI Todo List</h1>
        <nav className="nav">
          <button 
            className={view === 'list' ? 'active' : ''} 
            onClick={() => setView('list')}
          >
            📋 Tasks
          </button>
          <button 
            className={view === 'chat' ? 'active' : ''} 
            onClick={() => setView('chat')}
          >
            💬 AI Chat
          </button>
          <button 
            className={view === 'summary' ? 'active' : ''} 
            onClick={() => setView('summary')}
          >
            📊 Summary
          </button>
        </nav>
      </header>

      <main className="main">
        {view === 'list' && <TodoList todos={todos} setTodos={setTodos} loading={loading} setLoading={setLoading} />}
        {view === 'chat' && <ChatWidget />}
        {view === 'summary' && <SummaryWidget todos={todos} />}
      </main>
    </div>
  )
}

function TodoList({ todos, setTodos, loading, setLoading }) {
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all') // all, pending, completed

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/tasks`)
      const data = await res.json()
      setTodos(data)
    } catch (error) {
      console.error('Failed to fetch todos:', error)
    }
    setLoading(false)
  }

  const addTodo = async (text) => {
    try {
      const res = await fetch(`${API_BASE}/chat/create-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })
      const data = await res.json()
      if (data.success) {
        setTodos([...todos, data.task])
      }
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      addTodo(input)
      setInput('')
    }
  }

  const toggleTodo = async (id) => {
    try {
      const todo = todos.find(t => t._id === id)
      const newStatus = todo.status === 'completed' ? 'pending' : 'completed'
      await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      setTodos(todos.map(t => t._id === id ? { ...t, status: newStatus } : t))
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' })
      setTodos(todos.filter(t => t._id !== id))
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'pending') return todo.status !== 'completed'
    if (filter === 'completed') return todo.status === 'completed'
    return true
  })

  return (
    <div className="todo-list">
      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task... (e.g., Meeting tomorrow at 3pm)"
        />
        <button type="submit">Add Task</button>
      </form>

      <div className="filter-tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending</button>
        <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Completed</button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <ul className="todos">
          {filteredTodos.map(todo => (
            <li key={todo._id} className={todo.status}>
              <div className="todo-content" onClick={() => toggleTodo(todo._id)}>
                <span className="checkbox">{todo.status === 'completed' ? '✓' : '○'}</span>
                <span className="title">{todo.title}</span>
                {todo.dueDate && <span className="due-date">📅 {new Date(todo.dueDate).toLocaleString()}</span>}
              </div>
              <button className="delete-btn" onClick={() => deleteTodo(todo._id)}>🗑️</button>
            </li>
          ))}
          {filteredTodos.length === 0 && (
            <li className="empty">No tasks yet. Add one above! 🎉</li>
          )}
        </ul>
      )}
    </div>
  )
}

function ChatWidget() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI assistant. You can: \n• Say "Create a meeting tomorrow at 3pm"\n• Say "Show my tasks"\n• Say "Summarize my tasks"\n\nHow can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <div className="chat-widget">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {loading && <div className="message assistant"><div className="message-content">Thinking...</div></div>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message... (e.g., Create a meeting at 3pm)"
        />
        <button type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  )
}

function SummaryWidget({ todos }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSummary()
  }, [todos])

  const fetchSummary = async () => {
    if (todos.length === 0) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/summary?period=all`)
      const data = await res.json()
      setSummary(data)
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    }
    setLoading(false)
  }

  const completed = todos.filter(t => t.status === 'completed').length
  const pending = todos.filter(t => t.status === 'pending').length
  const total = todos.length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="summary-widget">
      <h2>📊 Task Summary</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{total}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-card completed">
          <span className="stat-number">{completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-number">{pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card rate">
          <span className="stat-number">{completionRate}%</span>
          <span className="stat-label">Completion Rate</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading AI summary...</div>
      ) : summary?.summary ? (
        <div className="ai-summary">
          <h3>🤖 AI Insight</h3>
          <p>{summary.summary.summaryText || summary.summary.summary}</p>
        </div>
      ) : (
        <div className="ai-summary">
          <p>Add some tasks to get AI-powered insights! ✨</p>
        </div>
      )}
    </div>
  )
}

export default App
