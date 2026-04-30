import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { User } from '../types'
import {
  minervaModel,
  saveMinervaExchange,
  type MinervaChatMessage,
} from '../agent/initialize'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatWidgetProps {
  user: User | null
  initialMessage?: string
  variant?: 'embedded' | 'floating'
}

const welcomeMessageId = 'minerva-welcome'
const defaultInitialMessage =
  "Hi, I'm Minerva. I can help answer general legal questions and point you toward useful next steps. What's going on?"

export function ChatWidget(props: ChatWidgetProps) {
  const { user, initialMessage, variant = 'embedded' } = props
  const [messages, setMessages] = useState<Message[]>([
    {
      id: welcomeMessageId,
      role: 'assistant',
      content: initialMessage || defaultInitialMessage,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)

    try {
      const history = nextMessages
        .filter((message) => message.id !== welcomeMessageId)
        .slice(0, -1)
        .map((message) => ({
          role: message.role === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: message.content }],
        }))

      const chat = minervaModel.startChat({ history })
      const result = await chat.sendMessage(userMessage.content)
      const aiMessage =
        result.response.text() ||
        "I'm sorry, I couldn't process that. Could you rephrase?"

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiMessage,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      saveMinervaExchange({
        sessionId,
        userId: user?.id,
        userMessage: toMinervaMessage(userMessage),
        assistantMessage: toMinervaMessage(assistantMessage),
      })
        .then(setSessionId)
        .catch((error) => {
          console.warn('Unable to save Minerva chat exchange:', error)
        })
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen && variant === 'floating') {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          zIndex: 50,
          padding: '14px 18px',
          borderRadius: '999px',
          border: 'none',
          backgroundColor: '#1a73e8',
          color: 'white',
          fontSize: '14px',
          fontWeight: 700,
          boxShadow: '0 12px 30px rgba(26,115,232,0.3)',
          cursor: 'pointer',
        }}
      >
        Ask Minerva
      </button>
    )
  }

  const containerStyle =
    variant === 'floating'
      ? {
          position: 'fixed' as const,
          right: '24px',
          bottom: '24px',
          zIndex: 50,
          width: 'min(420px, calc(100vw - 32px))',
          height: 'min(620px, calc(100vh - 48px))',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(15,23,42,0.22)',
          display: 'flex',
          flexDirection: 'column' as const,
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }
      : {
          width: '100%',
          maxWidth: '1000px',
          height: 'calc(100vh - 180px)',
          minHeight: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column' as const,
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }

  return (
    <>
      {isOpen && (
        <div
          className="chat-widget"
          style={containerStyle}
        >
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#1a73e8',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Minerva</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
                Legal assistant
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              x
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              backgroundColor: '#f9fafb',
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: message.role === 'user' ? '#1a73e8' : 'white',
                    color: message.role === 'user' ? 'white' : '#1f2937',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{message.content}</p>
                  <p
                    style={{
                      margin: '8px 0 0 0',
                      fontSize: '11px',
                      opacity: 0.7,
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'white',
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', gap: '12px' }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Minerva..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'none',
                  minHeight: '44px',
                  maxHeight: '120px',
                  fontFamily: 'inherit',
                }}
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: input.trim() && !isLoading ? '#1a73e8' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s',
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function toMinervaMessage(message: Message): MinervaChatMessage {
  return {
    role: message.role,
    content: message.content,
  }
}
