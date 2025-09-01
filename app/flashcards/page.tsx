'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Plus,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Trash2,
  Edit3,
  Brain
} from 'lucide-react'
import Link from 'next/link'

interface Flashcard {
  id: string
  front: string
  back: string
  interval: number
  repetition: number
  easeFactor: number
  nextReviewAt: string
  deckId: string
}

interface FlashcardDeck {
  id: string
  title: string
  description: string
  flashcards?: Flashcard[]
  dueCount?: number
}

export default function FlashcardsPage() {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'decks' | 'study' | 'create' | 'edit'>('decks')
  const [decks, setDecks] = useState<FlashcardDeck[]>([])
  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck | null>(null)
  const [studyCards, setStudyCards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [newDeck, setNewDeck] = useState({ title: '', description: '' })
  const [newCard, setNewCard] = useState({ front: '', back: '' })
  const [userId, setUserId] = useState<string | null>(null)
  
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

    setUserId(user.id)
    await loadDecks(user.id)
    setLoading(false)
  }

  const loadDecks = async (userId: string) => {
    try {
      // Get student ID first
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (!student) return

      // For demo purposes, create mock decks
      // In a real app, you'd load from Supabase
      const mockDecks = [
        {
          id: '1',
          title: 'Mathematics - Calculus',
          description: 'Derivatives, integrals, and limits',
          dueCount: 5
        },
        {
          id: '2',
          title: 'Physics - Mechanics',
          description: 'Forces, motion, and energy',
          dueCount: 3
        },
        {
          id: '3',
          title: 'Chemistry - Organic',
          description: 'Organic compounds and reactions',
          dueCount: 8
        }
      ]
      
      setDecks(mockDecks)
    } catch (error) {
      console.error('Error loading decks:', error)
    }
  }

  const generateMockFlashcards = (deckId: string): Flashcard[] => {
    const cardTemplates = {
      '1': [ // Mathematics
        { front: "What is the derivative of sin(x)?", back: "cos(x)" },
        { front: "∫ x² dx = ?", back: "(x³/3) + C" },
        { front: "What is the limit of (sin x)/x as x approaches 0?", back: "1" },
        { front: "What is the chain rule?", back: "d/dx[f(g(x))] = f'(g(x)) × g'(x)" },
        { front: "What is the fundamental theorem of calculus?", back: "∫[a to b] f'(x)dx = f(b) - f(a)" }
      ],
      '2': [ // Physics
        { front: "What is Newton's first law?", back: "An object at rest stays at rest, an object in motion stays in motion unless acted upon by a force" },
        { front: "Formula for kinetic energy?", back: "KE = ½mv²" },
        { front: "What is the unit of force?", back: "Newton (N)" },
        { front: "What is gravitational acceleration on Earth?", back: "9.8 m/s² or 9.81 m/s²" }
      ],
      '3': [ // Chemistry
        { front: "What is the molecular formula for benzene?", back: "C₆H₆" },
        { front: "What type of hybridization does carbon have in methane?", back: "sp³" },
        { front: "What is a nucleophile?", back: "An electron-rich species that donates electrons to form bonds" },
        { front: "What is the difference between SN1 and SN2 reactions?", back: "SN1: two-step, carbocation intermediate, racemization; SN2: one-step, backside attack, inversion" }
      ]
    }

    const templates = cardTemplates[deckId as keyof typeof cardTemplates] || cardTemplates['1']
    
    return templates.map((template, index) => ({
      id: `card_${deckId}_${index}`,
      front: template.front,
      back: template.back,
      interval: Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 7) + 1, // Some cards due today
      repetition: Math.floor(Math.random() * 5),
      easeFactor: 2.5 + (Math.random() - 0.5) * 0.5,
      nextReviewAt: Math.random() < 0.3 ? new Date().toISOString() : 
                   new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      deckId
    }))
  }

  const startStudySession = (deck: FlashcardDeck) => {
    const cards = generateMockFlashcards(deck.id)
    const dueCards = cards.filter(card => new Date(card.nextReviewAt) <= new Date())
    
    setCurrentDeck(deck)
    setStudyCards(dueCards)
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setMode('study')
  }

  const rateCard = (rating: 1 | 2 | 3 | 4 | 5) => {
    const card = studyCards[currentCardIndex]
    if (!card) return

    // SM2 Algorithm implementation
    let newInterval = card.interval
    let newRepetition = card.repetition
    let newEaseFactor = card.easeFactor

    if (rating >= 3) {
      // Correct response
      if (newRepetition === 0) {
        newInterval = 1
      } else if (newRepetition === 1) {
        newInterval = 6
      } else {
        newInterval = Math.round(card.interval * card.easeFactor)
      }
      newRepetition += 1
    } else {
      // Incorrect response - reset
      newRepetition = 0
      newInterval = 1
    }

    // Adjust ease factor
    newEaseFactor = card.easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3
    }

    // In a real app, you'd update the database here
    console.log('Card rated:', { rating, newInterval, newRepetition, newEaseFactor })

    // Move to next card
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
      setShowAnswer(false)
    } else {
      // Study session complete
      setMode('decks')
    }
  }

  const createDeck = async () => {
    if (!newDeck.title.trim()) return

    // In a real app, you'd save to database
    const mockDeck: FlashcardDeck = {
      id: Date.now().toString(),
      title: newDeck.title,
      description: newDeck.description,
      dueCount: 0
    }

    setDecks(prev => [...prev, mockDeck])
    setNewDeck({ title: '', description: '' })
    setMode('decks')
  }

  const addCardToDeck = () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return

    // In a real app, you'd save to database
    console.log('Adding card to deck:', currentDeck?.id, newCard)
    setNewCard({ front: '', back: '' })
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'decks' && (
          <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Your Flashcard Decks</h2>
              <button
                onClick={() => setMode('create')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Deck
              </button>
            </div>

            {/* Decks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <div key={deck.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                      {deck.dueCount && deck.dueCount > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          {deck.dueCount} due
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {deck.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {deck.description}
                    </p>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startStudySession(deck)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Study
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {decks.length === 0 && (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No flashcard decks yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first deck to start studying with spaced repetition
                </p>
                <button
                  onClick={() => setMode('create')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Your First Deck
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Deck</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deck Title
                  </label>
                  <input
                    type="text"
                    value={newDeck.title}
                    onChange={(e) => setNewDeck(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Biology - Cell Structure"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newDeck.description}
                    onChange={(e) => setNewDeck(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of what this deck covers..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setMode('decks')}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createDeck}
                  disabled={!newDeck.title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Deck
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'study' && studyCards.length > 0 && (
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Card {currentCardIndex + 1} of {studyCards.length}
                </span>
                <span className="text-sm text-gray-600">{currentDeck?.title}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentCardIndex + 1) / studyCards.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Flashcard */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="h-48 flex items-center justify-center">
                    <div className="text-lg text-gray-900">
                      {showAnswer ? studyCards[currentCardIndex]?.back : studyCards[currentCardIndex]?.front}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mb-6">
                  <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    {showAnswer ? <EyeOff className="h-5 w-5 mr-2" /> : <Eye className="h-5 w-5 mr-2" />}
                    {showAnswer ? 'Hide Answer' : 'Show Answer'}
                  </button>
                </div>

                {showAnswer && (
                  <div className="space-y-3">
                    <p className="text-center text-gray-600 mb-4">How well did you know this?</p>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { rating: 1, label: 'Again', color: 'bg-red-600 hover:bg-red-700' },
                        { rating: 2, label: 'Hard', color: 'bg-orange-600 hover:bg-orange-700' },
                        { rating: 3, label: 'Good', color: 'bg-blue-600 hover:bg-blue-700' },
                        { rating: 4, label: 'Easy', color: 'bg-green-600 hover:bg-green-700' },
                        { rating: 5, label: 'Perfect', color: 'bg-emerald-600 hover:bg-emerald-700' }
                      ].map(({ rating, label, color }) => (
                        <button
                          key={rating}
                          onClick={() => rateCard(rating as 1 | 2 | 3 | 4 | 5)}
                          className={`${color} text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {mode === 'study' && studyCards.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600 mb-6">
              No cards are due for review in this deck right now.
            </p>
            <button
              onClick={() => setMode('decks')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Decks
            </button>
          </div>
        )}
      </div>
    </div>
  )
}