'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Send, 
  BookOpen, 
  ArrowLeft,
  Settings,
  MessageCircle,
  Brain,
  Loader
} from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatSession {
  id: string
  title: string
  created_at: string
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [subject, setSubject] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [userId, setUserId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkUserAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }

    setUserId(user.id)
    await loadChatSessions(user.id)
  }

  const loadChatSessions = async (userId: string) => {
    // Get student ID first
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!student) return

    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })

    if (data) {
      setSessions(data)
    }
  }

  const startNewSession = async () => {
    if (!userId) return

    try {
      // Get student ID
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', userId)
        .single()

      let studentId: string
      
      if (!student) {
        // Create student profile if it doesn't exist
        const { data: newStudent } = await supabase
          .from('students')
          .insert({
            user_id: userId,
            board: 'igcse', // Default, should be updated in onboarding
            grade_level: 10,
          })
          .select('id')
          .single()
        
        if (!newStudent) return
        studentId = newStudent.id
      } else {
        studentId = student.id
      }

      const { data: session } = await supabase
        .from('chat_sessions')
        .insert({
          student_id: studentId,
          title: `${subject || 'General'} Session`,
          subject_id: null, // We'll add subject linking later
        })
        .select('*')
        .single()

      if (session) {
        setCurrentSession(session.id)
        setMessages([])
        await loadChatSessions(userId)
      }
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  const loadSession = async (sessionId: string) => {
    setCurrentSession(sessionId)
    setLoading(true)

    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at,
        })))
      }
    } catch (error) {
      console.error('Error loading session:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return
    
    if (!currentSession) {
      await startNewSession()
      if (!currentSession) return
    }

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setLoading(true)

    // Add user message to UI immediately
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, newUserMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`, // Simple auth for now
        },
        body: JSON.stringify({
          sessionId: currentSession,
          message: userMessage,
          userId,
          subject,
          difficulty,
        }),
      })

      const data = await response.json()

      if (data.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
          </div>
          
          <div className="flex items-center mb-4">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="ml-2 text-lg font-semibold">AI Tutor</span>
          </div>

          <button
            onClick={startNewSession}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            New Session
          </button>
        </div>

        {/* Settings Panel */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
          
          {showSettings && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics, Physics"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="easy">Easy Mode</option>
                  <option value="medium">Standard</option>
                  <option value="hard">Advanced</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Session History */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Sessions</h3>
          <div className="space-y-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={`w-full text-left p-2 rounded-md text-sm hover:bg-gray-100 ${
                  currentSession === session.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                {session.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Hi! I&apos;m your AI tutor 👋
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Ask me anything about your subjects. I&apos;ll help you understand concepts step-by-step and guide you through problems.
              </p>
              {subject && (
                <p className="text-sm text-blue-600 mt-2">
                  Ready to help with {subject}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-3xl rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 shadow border'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about your studies..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
            >
              {loading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}