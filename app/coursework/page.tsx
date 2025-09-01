'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Plus,
  BookOpen,
  FileText,
  Lightbulb,
  CheckSquare,
  AlertTriangle,
  Clock,
  Target,
  Link as LinkIcon,
  Save,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface Coursework {
  id: string
  title: string
  type: 'ia' | 'ee' | 'assignment' | 'project'
  status: 'planning' | 'research' | 'drafting' | 'review' | 'completed'
  researchQuestion?: string
  outline?: any
  sources?: any[]
  wordCount: number
  targetWordCount?: number
  dueDate?: string
  subject?: string
}

const courseworkTypes = {
  ia: { label: 'Internal Assessment (IA)', color: 'bg-blue-100 text-blue-800' },
  ee: { label: 'Extended Essay (EE)', color: 'bg-purple-100 text-purple-800' },
  assignment: { label: 'Assignment', color: 'bg-green-100 text-green-800' },
  project: { label: 'Project', color: 'bg-orange-100 text-orange-800' }
}

const statusColors = {
  planning: 'bg-gray-100 text-gray-800',
  research: 'bg-blue-100 text-blue-800',
  drafting: 'bg-yellow-100 text-yellow-800',
  review: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800'
}

export default function CourseworkPage() {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'list' | 'create' | 'details' | 'planner'>('list')
  const [courseworks, setCourseworks] = useState<Coursework[]>([])
  const [selectedCoursework, setSelectedCoursework] = useState<Coursework | null>(null)
  const [newCoursework, setNewCoursework] = useState({
    title: '',
    type: 'ia' as const,
    subject: '',
    dueDate: '',
    targetWordCount: ''
  })
  const [researchQuestion, setResearchQuestion] = useState('')
  const [researchSuggestions, setResearchSuggestions] = useState<string[]>([])
  const [outlineSteps, setOutlineSteps] = useState<string[]>([])
  const [sources, setSources] = useState<string[]>([''])
  
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

  const checkUserAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }
    
    await loadCourseworks()
    setLoading(false)
  }

  const loadCourseworks = async () => {
    // For demo purposes, create mock courseworks
    const mockCourseworks: Coursework[] = [
      {
        id: '1',
        title: 'IB Economics IA - Market Failure Analysis',
        type: 'ia',
        status: 'research',
        subject: 'Economics',
        researchQuestion: 'To what extent does government intervention address market failure in the UK housing market?',
        wordCount: 450,
        targetWordCount: 750,
        dueDate: '2024-03-15'
      },
      {
        id: '2',
        title: 'Extended Essay - Climate Change Impact on Biodiversity',
        type: 'ee',
        status: 'planning',
        subject: 'Environmental Science',
        wordCount: 0,
        targetWordCount: 4000,
        dueDate: '2024-05-20'
      },
      {
        id: '3',
        title: 'Physics IA - Pendulum Motion Investigation',
        type: 'ia',
        status: 'completed',
        subject: 'Physics',
        wordCount: 2100,
        targetWordCount: 2200,
        dueDate: '2024-02-10'
      }
    ]
    
    setCourseworks(mockCourseworks)
  }

  const createCoursework = async () => {
    if (!newCoursework.title.trim()) return

    const coursework: Coursework = {
      id: Date.now().toString(),
      title: newCoursework.title,
      type: newCoursework.type,
      status: 'planning',
      subject: newCoursework.subject,
      wordCount: 0,
      targetWordCount: newCoursework.targetWordCount ? parseInt(newCoursework.targetWordCount) : undefined,
      dueDate: newCoursework.dueDate || undefined
    }

    setCourseworks(prev => [coursework, ...prev])
    setSelectedCoursework(coursework)
    setMode('details')
    setNewCoursework({ title: '', type: 'ia', subject: '', dueDate: '', targetWordCount: '' })
  }

  const generateResearchSuggestions = async (subject: string, type: string) => {
    // Mock research question suggestions based on subject and type
    const suggestions = {
      Economics: [
        "To what extent does government intervention address market failure in the housing market?",
        "How effective are carbon taxes in reducing greenhouse gas emissions?",
        "To what extent does income inequality affect economic growth in developing countries?",
        "How do minimum wage policies impact employment rates in the service sector?"
      ],
      Physics: [
        "How does the length of a pendulum affect its period of oscillation?",
        "What factors influence the efficiency of solar panels?",
        "How does temperature affect the resistance of different materials?",
        "To what extent does air resistance affect projectile motion?"
      ],
      Biology: [
        "How does pH level affect enzyme activity in catalase?",
        "What is the effect of light intensity on photosynthesis rates?",
        "How do different antibiotics affect bacterial growth?",
        "To what extent does exercise affect heart rate recovery time?"
      ],
      Chemistry: [
        "How does temperature affect the rate of reaction between zinc and hydrochloric acid?",
        "What factors influence the pH of buffer solutions?",
        "How does concentration affect the voltage of electrochemical cells?",
        "To what extent do catalysts affect activation energy?"
      ]
    }

    setResearchSuggestions(suggestions[subject as keyof typeof suggestions] || suggestions.Economics)
  }

  const generateOutlineSteps = (type: string) => {
    const outlines = {
      ia: [
        "1. Introduction and Research Question",
        "2. Background Theory and Context",
        "3. Methodology and Data Collection",
        "4. Analysis and Results",
        "5. Evaluation and Limitations",
        "6. Conclusion"
      ],
      ee: [
        "1. Introduction and Research Question",
        "2. Literature Review",
        "3. Theoretical Framework",
        "4. Investigation/Analysis",
        "5. Results and Discussion",
        "6. Evaluation of Sources and Methods",
        "7. Conclusion",
        "8. Bibliography and Appendices"
      ],
      assignment: [
        "1. Introduction",
        "2. Main Body (2-3 sections)",
        "3. Analysis/Discussion",
        "4. Conclusion",
        "5. References"
      ],
      project: [
        "1. Project Overview and Objectives",
        "2. Background Research",
        "3. Methodology/Approach",
        "4. Implementation/Results",
        "5. Evaluation and Reflection",
        "6. Conclusion and Recommendations"
      ]
    }

    setOutlineSteps(outlines[type as keyof typeof outlines] || outlines.assignment)
  }

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Coursework Coach</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'list' && (
          <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Coursework</h2>
                <p className="text-gray-600">Manage your IAs, EEs, and assignments with integrity-focused guidance</p>
              </div>
              <button
                onClick={() => setMode('create')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Coursework
              </button>
            </div>

            {/* Academic Integrity Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 mb-1">Academic Integrity Reminder</h3>
                  <p className="text-sm text-yellow-700">
                    AI-Shu provides structure, guidance, and feedback to help you learn. We will never write your 
                    coursework for you. All ideas, analysis, and writing must be your own original work.
                  </p>
                </div>
              </div>
            </div>

            {/* Coursework Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {courseworks.map((coursework) => (
                <div key={coursework.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${courseworkTypes[coursework.type].color}`}>
                            {courseworkTypes[coursework.type].label}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[coursework.status]}`}>
                            {coursework.status.charAt(0).toUpperCase() + coursework.status.slice(1)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {coursework.title}
                        </h3>
                        {coursework.subject && (
                          <p className="text-sm text-gray-600 mb-2">{coursework.subject}</p>
                        )}
                        {coursework.researchQuestion && (
                          <p className="text-sm text-gray-700 mb-3 italic">
                            &ldquo;{coursework.researchQuestion}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Progress Bar */}
                      {coursework.targetWordCount && (
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Word Count</span>
                            <span>{coursework.wordCount} / {coursework.targetWordCount}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${Math.min((coursework.wordCount / coursework.targetWordCount) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Due Date */}
                      {coursework.dueDate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          Due: {new Date(coursework.dueDate).toLocaleDateString()}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => {
                            setSelectedCoursework(coursework)
                            setMode('details')
                          }}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Continue Work
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {courseworks.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No coursework yet</h3>
                <p className="text-gray-600 mb-6">
                  Start your first IA, EE, or assignment with guided support
                </p>
                <button
                  onClick={() => setMode('create')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Your First Coursework
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Start New Coursework</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coursework Title
                  </label>
                  <input
                    type="text"
                    value={newCoursework.title}
                    onChange={(e) => setNewCoursework(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., IB Economics IA - Market Analysis"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={newCoursework.type}
                      onChange={(e) => setNewCoursework(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ia">Internal Assessment (IA)</option>
                      <option value="ee">Extended Essay (EE)</option>
                      <option value="assignment">Assignment</option>
                      <option value="project">Project</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={newCoursework.subject}
                      onChange={(e) => setNewCoursework(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="e.g., Economics, Physics"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Word Count
                    </label>
                    <input
                      type="number"
                      value={newCoursework.targetWordCount}
                      onChange={(e) => setNewCoursework(prev => ({ ...prev, targetWordCount: e.target.value }))}
                      placeholder="e.g., 750 for IA, 4000 for EE"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={newCoursework.dueDate}
                      onChange={(e) => setNewCoursework(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setMode('list')}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createCoursework}
                  disabled={!newCoursework.title.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Coursework
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'details' && selectedCoursework && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">{selectedCoursework.title}</h2>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${courseworkTypes[selectedCoursework.type].color}`}>
                      {courseworkTypes[selectedCoursework.type].label}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedCoursework.status]}`}>
                      {selectedCoursework.status.charAt(0).toUpperCase() + selectedCoursework.status.slice(1)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMode('list')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>
              
              {selectedCoursework.targetWordCount && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{selectedCoursework.wordCount} / {selectedCoursework.targetWordCount} words</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((selectedCoursework.wordCount / selectedCoursework.targetWordCount) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Research Question Helper */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <Lightbulb className="h-6 w-6 text-yellow-500 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Research Question</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <textarea
                      value={researchQuestion}
                      onChange={(e) => setResearchQuestion(e.target.value)}
                      placeholder="Enter your research question here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={() => generateResearchSuggestions(selectedCoursework.subject || 'Economics', selectedCoursework.type)}
                    className="w-full bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg hover:bg-yellow-200 text-sm"
                  >
                    Get Research Question Ideas
                  </button>

                  {researchSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Suggested Research Questions:</p>
                      {researchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setResearchQuestion(suggestion)}
                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Outline Planner */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <Target className="h-6 w-6 text-blue-500 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Structure Planner</h3>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => generateOutlineSteps(selectedCoursework.type)}
                    className="w-full bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 text-sm"
                  >
                    Generate {courseworkTypes[selectedCoursework.type].label} Structure
                  </button>

                  {outlineSteps.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Recommended Structure:</p>
                      <div className="space-y-2">
                        {outlineSteps.map((step, index) => (
                          <div key={index} className="flex items-center p-2 border border-gray-200 rounded-lg">
                            <CheckSquare className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sources Manager */}
              <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                <div className="flex items-center mb-4">
                  <LinkIcon className="h-6 w-6 text-green-500 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Sources & Bibliography</h3>
                </div>

                <div className="space-y-3">
                  {sources.map((source, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => {
                          const newSources = [...sources]
                          newSources[index] = e.target.value
                          setSources(newSources)
                        }}
                        placeholder="Enter source URL or citation..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {sources.length > 1 && (
                        <button
                          onClick={() => setSources(sources.filter((_, i) => i !== index))}
                          className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={() => setSources([...sources, ''])}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-600 hover:border-gray-400 hover:text-gray-700"
                  >
                    + Add Another Source
                  </button>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>Citation Tip:</strong> Remember to use proper citation format (APA, MLA, or Chicago) 
                      and ensure all sources are credible and relevant to your research question.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-center space-x-4">
                <button className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Save className="h-5 w-5 mr-2" />
                  Save Progress
                </button>
                <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <FileText className="h-5 w-5 mr-2" />
                  Export Outline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}