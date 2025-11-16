import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MessageItem from '@/components/landing/MessageItem'
import { Message } from '@/store/features/chat/chatTypes'

describe('MessageItem', () => {
  it('renders user message with avatar', () => {
    const message: Message = {
      id: '1',
      content: 'Hello',
      sender: 'user',
    }
    
    render(<MessageItem message={message} />)
    
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('👤')).toBeInTheDocument()
  })

  it('renders assistant message without avatar', () => {
    const message: Message = {
      id: '2',
      content: 'Hi there',
      sender: 'assistant',
    }
    
    render(<MessageItem message={message} />)
    
    expect(screen.getByText('Hi there')).toBeInTheDocument()
    expect(screen.queryByText('👤')).not.toBeInTheDocument()
  })

  it('displays attachments when present', () => {
    const message: Message = {
      id: '3',
      content: 'Check this file',
      sender: 'user',
      attachments: [
        {
          filename: 'document.pdf',
          mimeType: 'application/pdf',
          data: btoa('test data'),
          size: 1024,
        },
      ],
    }
    
    render(<MessageItem message={message} />)
    
    expect(screen.getByText('📄 document.pdf')).toBeInTheDocument()
  })

  it('shows sending status for user messages', () => {
    const message: Message = {
      id: '4',
      content: 'Sending...',
      sender: 'user',
      status: 'sending',
    }
    
    render(<MessageItem message={message} />)
    
    expect(screen.getByText('⏳ Отправка...')).toBeInTheDocument()
  })

  it('shows sent status for user messages', () => {
    const message: Message = {
      id: '5',
      content: 'Sent message',
      sender: 'user',
      status: 'sent',
    }
    
    render(<MessageItem message={message} />)
    
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('shows error status for user messages', () => {
    const message: Message = {
      id: '6',
      content: 'Failed message',
      sender: 'user',
      status: 'error',
    }
    
    render(<MessageItem message={message} />)
    
    expect(screen.getByText('❌ Ошибка')).toBeInTheDocument()
  })

  it('does not show status for assistant messages', () => {
    const message: Message = {
      id: '7',
      content: 'Assistant response',
      sender: 'assistant',
      status: 'sent',
    }
    
    render(<MessageItem message={message} />)
    
    expect(screen.queryByText('✓')).not.toBeInTheDocument()
  })
})