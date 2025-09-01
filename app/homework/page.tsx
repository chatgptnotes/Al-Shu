'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Upload, 
  Camera, 
  FileText, 
  ArrowLeft,
  X,
  Send,
  Loader,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface UploadedFile {
  file: File
  preview: string
  type: 'image' | 'pdf' | 'other'
}

export default function HomeworkPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [question, setQuestion] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [showResponse, setShowResponse] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    files.forEach(file => {
      const fileType = file.type.startsWith('image/') ? 'image' 
                    : file.type === 'application/pdf' ? 'pdf' 
                    : 'other'
      
      if (fileType === 'image') {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedFiles(prev => [...prev, {
            file,
            preview: e.target?.result as string,
            type: fileType
          }])
        }
        reader.readAsDataURL(file)
      } else {
        setUploadedFiles(prev => [...prev, {
          file,
          preview: '',
          type: fileType
        }])
      }
    })
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0 && !question.trim()) {
      return
    }

    setLoading(true)
    setResponse('')
    setShowResponse(false)

    try {
      // For now, we'll simulate homework help without actual OCR
      // In a real implementation, you'd use OCR services like Mathpix or Google Vision API
      
      const mockAnalysis = generateMockResponse(question, subject, uploadedFiles.length)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setResponse(mockAnalysis)
      setShowResponse(true)
      
    } catch (error) {
      console.error('Error processing homework:', error)
      setResponse('I apologize, but I encountered an error while processing your homework. Please try again.')
      setShowResponse(true)
    } finally {
      setLoading(false)
    }
  }

  const generateMockResponse = (question: string, subject: string, fileCount: number): string => {
    const hasFiles = fileCount > 0
    const hasQuestion = question.trim().length > 0
    
    if (hasFiles && hasQuestion) {
      return `I can see you've uploaded ${fileCount} file${fileCount > 1 ? 's' : ''} and asked: "${question}"

${subject ? `For ${subject}, here's my analysis:` : 'Here\'s my analysis:'}

📝 **Problem Analysis:**
Based on your uploaded materials, I can identify the key concepts involved. Let me break this down step-by-step:

🔍 **Step 1: Understanding the Problem**
First, let's identify what we know and what we need to find. This is crucial for any problem-solving approach.

💡 **Step 2: Method Selection**
There are typically multiple ways to approach this type of problem. Let me show you the most effective method.

⚡ **Step 3: Solution Process**
[I would work through the solution step-by-step here, showing you each calculation or reasoning step]

✅ **Step 4: Verification**
It's important to check our answer to make sure it makes sense.

🎯 **Key Learning Points:**
- [Important concept 1]
- [Important concept 2]
- [Common mistake to avoid]

📚 **Practice Suggestion:**
Try solving a similar problem: [I'd give you a related practice problem]

Would you like me to explain any of these steps in more detail?`
    } else if (hasQuestion) {
      return `You asked: "${question}"

${subject ? `For ${subject}:` : ''}

Let me help you understand this step-by-step:

🎯 **Concept Overview:**
[I'd explain the main concept here]

📖 **Step-by-Step Approach:**
1. [First step with explanation]
2. [Second step with reasoning]
3. [Final step and conclusion]

💡 **Key Insight:**
[Important point to remember]

🔄 **Try This:**
Can you now explain back to me what the main idea is? This will help reinforce your understanding.`
    } else {
      return `I can see you've uploaded ${fileCount} file${fileCount > 1 ? 's' : ''}. 

To give you the best help, could you tell me:
1. What specific question or concept are you struggling with?
2. What subject is this for?
3. What have you tried so far?

This will help me provide more targeted, step-by-step guidance! 📚`
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Homework Helper</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResponse ? (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">How it works</h2>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Upload photos of your homework problems or type your question</li>
                <li>Add context about the subject and what you&apos;re struggling with</li>
                <li>Get step-by-step explanations that help you learn</li>
              </ol>
            </div>

            {/* Subject Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject (Optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics, Physics, Chemistry"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Support for images (PNG, JPG) and PDF files
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Choose Files
                  </button>
                </div>
              </div>

              {/* Preview Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <div className="border rounded-lg p-2 bg-gray-50">
                          {file.type === 'image' ? (
                            <Image
                              src={file.preview}
                              alt={file.file.name}
                              className="w-full h-24 object-cover rounded"
                              width={100}
                              height={96}
                            />
                          ) : (
                            <div className="h-24 flex items-center justify-center bg-gray-200 rounded">
                              <FileText className="h-8 w-8 text-gray-500" />
                            </div>
                          )}
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {file.file.name}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Question Input */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Question (Optional)
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What specifically are you having trouble with? The more context you provide, the better I can help!"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={loading || (uploadedFiles.length === 0 && !question.trim())}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                {loading ? 'Analyzing...' : 'Get Help'}
              </button>
            </div>
          </div>
        ) : (
          /* Response Display */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Analysis Complete</h2>
              </div>
              <button
                onClick={() => {
                  setShowResponse(false)
                  setResponse('')
                  setUploadedFiles([])
                  setQuestion('')
                  setSubject('')
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Start New Problem
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800">
                  {response}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Remember:</strong> I&apos;m here to help you learn, not to do your homework for you! 
                Make sure you understand each step and try similar problems on your own.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}