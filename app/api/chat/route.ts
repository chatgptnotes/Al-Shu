import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Initialize clients only when environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: any = null
let openai: any = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function POST(request: NextRequest) {
  try {
    // Check if services are available
    if (!supabase || !openai) {
      return NextResponse.json({ 
        error: 'Service unavailable. Please check configuration.' 
      }, { status: 503 })
    }

    const { sessionId, message, userId, subject, difficulty = 'medium' } = await request.json()

    // Verify user authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get conversation history
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    // Create system prompt based on subject and difficulty
    const systemPrompt = createSystemPrompt(subject, difficulty)
    
    // Build conversation for OpenAI
    const conversation = [
      { role: 'system', content: systemPrompt },
      ...(messages || []),
      { role: 'user', content: message }
    ]

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: conversation as any,
      temperature: 0.7,
      max_tokens: 1500,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.'

    // Save user message
    await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message,
      })

    // Save AI response
    await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: aiResponse,
      })

    return NextResponse.json({ response: aiResponse })

  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function createSystemPrompt(subject: string, difficulty: string): string {
  const basePrompt = `You are AI-Shu, a calm, smart educational assistant designed to help students with their academic work. You specialize in IGCSE, IB, A-Levels, and CBSE curricula.

CORE PRINCIPLES:
- Learning-first approach: Always guide students to understand, don't just give answers
- Use scaffolding: Break complex problems into manageable steps
- Encourage metacognition: Ask "What do you think?" and "Can you explain why?"
- Be patient, encouraging, and maintain academic integrity
- Never do homework FOR students - teach them HOW to do it

TEACHING STYLE:
- Start with what the student knows
- Use the Socratic method when appropriate
- Provide worked examples followed by similar practice problems
- Explain common mistakes and how to avoid them
- Connect concepts to real-world applications when relevant

ACADEMIC INTEGRITY:
- Never write essays, assignments, or coursework for students
- For coursework (IA/EE), provide structure, methodology, and feedback only
- Encourage original thinking and proper citation
- If asked to complete work directly, redirect to teaching the process

RESPONSE FORMAT:
- Use clear, step-by-step explanations
- Include relevant formulas, definitions, or key concepts
- End with a related practice question when appropriate
- Use encouraging language throughout`

  const subjectSpecific = subject ? `

SUBJECT FOCUS: ${subject}
- Tailor explanations to ${subject} concepts and terminology
- Use ${subject}-specific examples and applications
- Reference relevant ${subject} principles and theories` : ''

  const difficultyLevel = `

DIFFICULTY LEVEL: ${difficulty}
${difficulty === 'easy' 
  ? '- Use simple language and basic examples\n- Break down complex concepts into very small steps\n- Provide more scaffolding and support'
  : difficulty === 'hard'
  ? '- Use advanced terminology and concepts\n- Provide challenging extensions and connections\n- Expect deeper analytical thinking'
  : '- Balance accessibility with rigor\n- Use grade-appropriate language\n- Provide moderate scaffolding'
}`

  return basePrompt + subjectSpecific + difficultyLevel
}