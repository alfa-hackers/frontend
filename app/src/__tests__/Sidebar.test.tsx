import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Sidebar from '@/components/landing/Sidebar'
import { Chat } from '@/store/features/chat/chatTypes'

describe('Sidebar', () => {
  const mockOnNewChat = jest.fn()
  const mockOnSelectChat = jest.fn()
  const mockOnDeleteChat = jest.fn()

  const defaultProps = {
    chats: [] as Chat[],
    activeChat: null,
    sidebarOpen: true,
    onNewChat: mockOnNewChat,
    onSelectChat: mockOnSelectChat,
    onDeleteChat: mockOnDeleteChat,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders new chat button', () => {
    render(<Sidebar {...defaultProps} />)
    
    expect(screen.getByText('Новый чат')).toBeInTheDocument()
  })

  it('calls onNewChat when new chat button is clicked', () => {
    render(<Sidebar {...defaultProps} />)
    
    const newChatButton = screen.getByText('Новый чат')
    fireEvent.click(newChatButton)
    
    expect(mockOnNewChat).toHaveBeenCalled()
  })

  it('renders list of chats', () => {
    const chats: Chat[] = [
      {
        id: '1',
        title: 'Chat 1',
        messages: [],
        roomId: '6b55b4ef-2e00-499e-bbc3-cf905ceae5b2',
        isWaitingForResponse: false,
      },
      {
        id: '2',
        title: 'Chat 2',
        messages: [],
        roomId: 'bef98a1e-20e6-4801-acae-b3f8a4d06ea9',
        isWaitingForResponse: false,
      },
    ]
    
    render(<Sidebar {...defaultProps} chats={chats} />)
    
    expect(screen.getByText('Chat 1')).toBeInTheDocument()
    expect(screen.getByText('Chat 2')).toBeInTheDocument()
  })

  it('highlights active chat', () => {
    const chats: Chat[] = [
      {
        id: '1',
        title: 'Active Chat',
        messages: [],
        roomId: '6b55b4ef-2e00-499e-bbc3-cf905ceae5b2',
        isWaitingForResponse: false,
      },
    ]
    
    render(<Sidebar {...defaultProps} chats={chats} activeChat="1" />)
    
    const chatItem = screen.getByText('Active Chat').closest('.chat-item')
    expect(chatItem).toHaveClass('active')
  })

  it('calls onSelectChat when chat is clicked', () => {
    const chats: Chat[] = [
      {
        id: '1',
        title: 'Test Chat',
        messages: [],
        roomId: '6b55b4ef-2e00-499e-bbc3-cf905ceae5b2',
        isWaitingForResponse: false,
      },
    ]
    
    render(<Sidebar {...defaultProps} chats={chats} />)
    
    const chatItem = screen.getByText('Test Chat')
    fireEvent.click(chatItem)
    
    expect(mockOnSelectChat).toHaveBeenCalledWith('1')
  })

  it('calls onDeleteChat when delete button is clicked', () => {
    const chats: Chat[] = [
      {
        id: '1',
        title: 'Test Chat',
        messages: [],
        roomId: '6b55b4ef-2e00-499e-bbc3-cf905ceae5b2',
        isWaitingForResponse: false,
      },
    ]
    
    render(<Sidebar {...defaultProps} chats={chats} />)
    
    const deleteButton = screen.getByTitle('Удалить чат')
    fireEvent.click(deleteButton)
    
    expect(mockOnDeleteChat).toHaveBeenCalled()
  })

  it('applies open class when sidebar is open', () => {
    const { container } = render(<Sidebar {...defaultProps} sidebarOpen={true} />)
    
    const sidebar = container.querySelector('.sidebar')
    expect(sidebar).toHaveClass('open')
  })

  it('does not apply open class when sidebar is closed', () => {
    const { container } = render(<Sidebar {...defaultProps} sidebarOpen={false} />)
    
    const sidebar = container.querySelector('.sidebar')
    expect(sidebar).not.toHaveClass('open')
  })
})
