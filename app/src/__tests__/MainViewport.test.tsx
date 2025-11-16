// MainViewport.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MainViewport from '@/components/landing/MainViewport'
import { Chat, FileAttachment } from '@/store/features/chat/chatTypes'

describe('MainViewport', () => {
  const mockSetInputValue = jest.fn()
  const mockOnSendMessage = jest.fn()
  const mockOnAttachmentsChange = jest.fn()
  const mockMessagesEndRef = { current: null }

  const defaultProps = {
    isConnected: true,
    inputValue: '',
    setInputValue: mockSetInputValue,
    onSendMessage: mockOnSendMessage,
    messagesEndRef: mockMessagesEndRef,
    attachments: [] as FileAttachment[],
    onAttachmentsChange: mockOnAttachmentsChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders WelcomeScreen when no messages', () => {
    render(<MainViewport {...defaultProps} />)
    
    expect(screen.getByText('Добро пожаловать')).toBeInTheDocument()
    expect(screen.getByText('Чем я могу вам помочь?')).toBeInTheDocument()
  })

  it('does not render WelcomeScreen when messages exist', () => {
    const currentChat: Chat = {
      id: '1',
      title: 'Test Chat',
      roomId: '6b55b4ef-2e00-499e-bbc3-cf905ceae5b2',
      messages: [
        {
          id: 'm1',
          content: 'Hello',
          sender: 'user',
        },
      ],
      isWaitingForResponse: false,
    }
    
    render(<MainViewport {...defaultProps} currentChat={currentChat} />)
    
    expect(screen.queryByText('Добро пожаловать')).not.toBeInTheDocument()
  })

  it('renders MessagesList when messages exist', () => {
    const currentChat: Chat = {
      id: '1',
      title: 'Test Chat',
      roomId: '6b55b4ef-2e00-499e-bbc3-cf905ceae5b2',
      messages: [
        {
          id: 'm1',
          content: 'Test message',
          sender: 'user',
        },
      ],
      isWaitingForResponse: false,
    }
    
    render(<MainViewport {...defaultProps} currentChat={currentChat} />)
    
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('renders InputArea component', () => {
    render(<MainViewport {...defaultProps} />)
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('applies has-messages class when messages exist', () => {
    const currentChat: Chat = {
      id: '1',
      title: 'Test Chat',
      roomId: '6b55b4ef-2e00-499e-bbc3-cf905ceae5b2',
      messages: [
        {
          id: 'm1',
          content: 'Test message',
          sender: 'user',
        },
      ],
      isWaitingForResponse: false,
    }
    
    const { container } = render(<MainViewport {...defaultProps} currentChat={currentChat} />)
    
    const viewport = container.querySelector('.viewport')
    expect(viewport).toHaveClass('has-messages')
  })

  it('does not apply has-messages class when no messages', () => {
    const { container } = render(<MainViewport {...defaultProps} />)
    
    const viewport = container.querySelector('.viewport')
    expect(viewport).not.toHaveClass('has-messages')
  })

  it('passes isWaitingForResponse to InputArea', () => {
    const currentChat: Chat = {
      id: '1',
      title: 'Test Chat',
      messages: [],
      roomId: '6b55b4ef-2e00-499e-bbc3-cf905ceae5b2',
      isWaitingForResponse: true,
    }
    
    render(<MainViewport {...defaultProps} currentChat={currentChat} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('handles undefined currentChat gracefully', () => {
    render(<MainViewport {...defaultProps} currentChat={undefined} />)
    
    expect(screen.getByText('Добро пожаловать')).toBeInTheDocument()
  })

  it('renders multiple messages in MessagesList', () => {
    const currentChat: Chat = {
      id: '1',
      title: 'Test Chat',
      messages: [
        {
          id: 'm1',
          content: 'First message',
          sender: 'user',
        },
        {
          id: 'm2',
          content: 'Second message',
          sender: 'assistant',
        },
      ],
      roomId: '6b55b4ef-2e00-499e-bbc3-cf905ceae5b2',
      isWaitingForResponse: false,
    }
    
    render(<MainViewport {...defaultProps} currentChat={currentChat} />)
    
    expect(screen.getByText('First message')).toBeInTheDocument()
    expect(screen.getByText('Second message')).toBeInTheDocument()
  })
})