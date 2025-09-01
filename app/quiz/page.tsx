'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Play,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Target,
  Brain,
  Award
} from 'lucide-react'
import Link from 'next/link'

interface Question {
  id: string
  stem: string
  type: 'mcq' | 'short_answer' | 'long_answer'
  options?: string[]
  answer: any
  explanation: any
  difficulty: 'easy' | 'medium' | 'hard'
  subject: string
  topic: string
}

interface QuizResult {
  questionId: string
  correct: boolean
  timeSpent: number
  score: number
}

export default function QuizPage() {
  const [loading, setLoading] = useState(true)
  const [quizMode, setQuizMode] = useState<'select' | 'active' | 'results'>('select')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed')
  const [questionCount, setQuestionCount] = useState(10)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (quizMode === 'active' && startTime) {
      const timer = setInterval(() => {
        setTimeElapsed(Math.floor((new Date().getTime() - startTime.getTime()) / 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [quizMode, startTime])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }
    
    setLoading(false)
  }

  const startQuiz = async () => {
    setLoading(true)
    try {
      // For demo purposes, generate mock questions
      // In a real app, you'd fetch from your question bank
      const mockQuestions = generateMockQuestions(questionCount, selectedSubject, selectedDifficulty)
      setQuestions(mockQuestions)
      setCurrentQuestionIndex(0)
      setQuizResults([])
      setStartTime(new Date())
      setTimeElapsed(0)
      setQuizMode('active')
    } catch (error) {
      console.error('Error starting quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockQuestions = (count: number, subject: string, difficulty: string): Question[] => {
    const subjects = subject || 'Mathematics'
    const mockQuestions: Question[] = []
    
    const questionTemplates = {
      Mathematics: [
        {
          stem: "What is the derivative of x² + 3x + 2?",
          type: 'mcq' as const,
          options: ["2x + 3", "x² + 3", "2x + 2", "x + 3"],
          answer: 0,
          explanation: "Using the power rule: d/dx(x²) = 2x, d/dx(3x) = 3, d/dx(2) = 0. Therefore: 2x + 3",
          topic: "Calculus"
        },
        {
          stem: "Solve for x: 2x + 5 = 13",
          type: 'short_answer' as const,
          answer: "4",
          explanation: "Subtract 5 from both sides: 2x = 8. Divide by 2: x = 4",
          topic: "Algebra"
        },
        {
          stem: "Find the area of a circle with radius 5 units.",
          type: 'mcq' as const,
          options: ["25π", "10π", "5π", "50π"],
          answer: 0,
          explanation: "Area = πr² = π(5)² = 25π square units",
          topic: "Geometry"
        }
      ],
      Physics: [
        {
          stem: "What is Newton's second law of motion?",
          type: 'mcq' as const,
          options: ["F = ma", "E = mc²", "v = u + at", "F = kx"],
          answer: 0,
          explanation: "Newton's second law states that Force equals mass times acceleration (F = ma)",
          topic: "Mechanics"
        },
        {
          stem: "Calculate the kinetic energy of a 2kg object moving at 10 m/s.",
          type: 'short_answer' as const,
          answer: "100",
          explanation: "KE = ½mv² = ½(2)(10)² = ½(2)(100) = 100 J",
          topic: "Energy"
        }
      ],
      Chemistry: [
        {
          stem: "What is the chemical formula for water?",
          type: 'mcq' as const,
          options: ["H₂O", "CO₂", "NaCl", "CH₄"],
          answer: 0,
          explanation: "Water consists of 2 hydrogen atoms and 1 oxygen atom: H₂O",
          topic: "Basic Chemistry"
        }
      ]
    }

    const subjectQuestions = questionTemplates[subjects as keyof typeof questionTemplates] || questionTemplates.Mathematics
    
    for (let i = 0; i < count; i++) {
      const template = subjectQuestions[i % subjectQuestions.length]
      const diffLevel = difficulty === 'mixed' ? ['easy', 'medium', 'hard'][i % 3] : difficulty
      
      mockQuestions.push({
        id: `q_${i}`,
        stem: template.stem,
        type: template.type,
        options: template.options,
        answer: template.answer,
        explanation: template.explanation,
        difficulty: diffLevel as 'easy' | 'medium' | 'hard',
        subject: subjects,
        topic: template.topic
      })
    }
    
    return mockQuestions
  }

  const submitAnswer = () => {
    if (!startTime) return
    
    const question = questions[currentQuestionIndex]
    const answerStartTime = startTime.getTime() + (currentQuestionIndex * 30000) // Rough estimate
    const timeSpent = Math.floor((new Date().getTime() - answerStartTime) / 1000)
    
    let isCorrect = false
    if (question.type === 'mcq') {
      isCorrect = selectedOption === question.answer
    } else {
      isCorrect = userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim()
    }
    
    const score = isCorrect ? (question.difficulty === 'hard' ? 3 : question.difficulty === 'medium' ? 2 : 1) : 0
    
    setQuizResults(prev => [...prev, {
      questionId: question.id,
      correct: isCorrect,
      timeSpent,
      score
    }])
    
    setShowExplanation(true)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setUserAnswer('')
      setSelectedOption(null)
      setShowExplanation(false)
    } else {
      // Quiz complete
      setQuizMode('results')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const restartQuiz = () => {
    setQuizMode('select')
    setCurrentQuestionIndex(0)
    setQuestions([])
    setQuizResults([])
    setUserAnswer('')
    setSelectedOption(null)
    setShowExplanation(false)
    setStartTime(null)
    setTimeElapsed(0)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const totalScore = quizResults.reduce((sum, result) => sum + result.score, 0)
  const correctAnswers = quizResults.filter(result => result.correct).length
  const accuracy = quizResults.length > 0 ? Math.round((correctAnswers / quizResults.length) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Quiz & Practice</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {quizMode === 'select' && (
          <div className="space-y-6">
            {/* Quiz Setup */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <Brain className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Start a Quiz</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                    <option value="Economics">Economics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mixed">Mixed Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={startQuiz}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Quiz
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-2xl font-semibold text-gray-900">85%</p>
                    <p className="text-gray-600">Average Accuracy</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-2xl font-semibold text-gray-900">45</p>
                    <p className="text-gray-600">Quizzes Completed</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-2xl font-semibold text-gray-900">1,240</p>
                    <p className="text-gray-600">Total Points</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {quizMode === 'active' && currentQuestion && (
          <div className="space-y-6">
            {/* Quiz Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTime(timeElapsed)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Difficulty:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    currentQuestion.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {currentQuestion.difficulty.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <div className="flex items-start space-x-3 mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {currentQuestion.stem}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <span>{currentQuestion.subject}</span>
                      <span className="mx-2">•</span>
                      <span>{currentQuestion.topic}</span>
                    </div>
                  </div>
                </div>

                {/* Answer Options */}
                {currentQuestion.type === 'mcq' && currentQuestion.options && (
                  <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => !showExplanation && setSelectedOption(index)}
                        disabled={showExplanation}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedOption === index
                            ? showExplanation
                              ? index === currentQuestion.answer
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                              : 'border-blue-500 bg-blue-50'
                            : showExplanation && index === currentQuestion.answer
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${showExplanation ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 mr-3">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span className="text-gray-900">{option}</span>
                          {showExplanation && index === currentQuestion.answer && (
                            <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
                          )}
                          {showExplanation && selectedOption === index && index !== currentQuestion.answer && (
                            <XCircle className="h-5 w-5 text-red-500 ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'short_answer' && (
                  <div className="mb-6">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => !showExplanation && setUserAnswer(e.target.value)}
                      disabled={showExplanation}
                      placeholder="Enter your answer..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                )}

                {/* Explanation */}
                {showExplanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                    <p className="text-blue-800">{currentQuestion.explanation}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <div></div>
                  {!showExplanation ? (
                    <button
                      onClick={submitAnswer}
                      disabled={
                        (currentQuestion.type === 'mcq' && selectedOption === null) ||
                        (currentQuestion.type === 'short_answer' && !userAnswer.trim())
                      }
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {quizMode === 'results' && (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-6">
                <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
                <p className="text-gray-600">Here&apos;s how you performed</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{correctAnswers}</p>
                  <p className="text-gray-600">Correct</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{questions.length - correctAnswers}</p>
                  <p className="text-gray-600">Incorrect</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
                  <p className="text-gray-600">Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{totalScore}</p>
                  <p className="text-gray-600">Points</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={restartQuiz}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Take Another Quiz
                </button>
                <Link
                  href="/dashboard"
                  className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>

            {/* Performance Feedback */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h3>
              
              {accuracy >= 80 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    <strong>Excellent work!</strong> You scored {accuracy}% which shows strong understanding. 
                    Keep practicing to maintain this level of performance.
                  </p>
                </div>
              )}
              
              {accuracy >= 60 && accuracy < 80 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>Good progress!</strong> You scored {accuracy}%. Review the explanations for 
                    questions you missed and try some practice problems to strengthen weak areas.
                  </p>
                </div>
              )}
              
              {accuracy < 60 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">
                    <strong>Keep practicing!</strong> You scored {accuracy}%. Consider reviewing the 
                    fundamentals for this topic and use the AI tutor for additional help.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}