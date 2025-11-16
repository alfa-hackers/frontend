import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MessagesList from '@/components/landing/MessagesList'
import { Message } from '@/store/features/chat/chatTypes'

describe('MessagesList', () => {
  const mockMessagesEndRef = { current: null }

  it('renders list of messages', () => {
    const messages: Message[] = [
      {
        id: '1',
        content: 'First message',
        sender: 'user',
      },
      {
        id: '2',
        content: 'Second message',
        sender: 'assistant',
      },
    ]
    
    render(
      <MessagesList
        messages={messages}
        isWaitingForResponse={false}
        messagesEndRef={mockMessagesEndRef}
      />
    )
    
    expect(screen.getByText('First message')).toBeInTheDocument()
    expect(screen.getByText('Second message')).toBeInTheDocument()
  })

  it('shows typing indicator when waiting for response', () => {
    const messages: Message[] = []
    
    render(
      <MessagesList
        messages={messages}
        isWaitingForResponse={true}
        messagesEndRef={mockMessagesEndRef}
      />
    )
    
    const typingIndicator = document.querySelector('.typing-indicator')
    expect(typingIndicator).toBeInTheDocument()
  })

  it('does not show typing indicator when not waiting', () => {
    const messages: Message[] = []
    
    render(
      <MessagesList
        messages={messages}
        isWaitingForResponse={false}
        messagesEndRef={mockMessagesEndRef}
      />
    )
    
    const typingIndicator = document.querySelector('.typing-indicator')
    expect(typingIndicator).not.toBeInTheDocument()
  })

  it('renders empty list when no messages', () => {
    const { container } = render(
      <MessagesList
        messages={[]}
        isWaitingForResponse={false}
        messagesEndRef={mockMessagesEndRef}
      />
    )
    
    const messagesDiv = container.querySelector('.messages')
    expect(messagesDiv?.children.length).toBe(1) // Only ref div
  })
})
