import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import InputArea from '@/components/landing/InputArea'
import { FileAttachment } from '@/store/features/chat/chatTypes'

describe('InputArea', () => {
  const mockSetInputValue = jest.fn()
  const mockOnSendMessage = jest.fn()
  const mockOnAttachmentsChange = jest.fn()

  const defaultProps = {
    inputValue: '',
    setInputValue: mockSetInputValue,
    onSendMessage: mockOnSendMessage,
    isConnected: true,
    isWaitingForResponse: false,
    hasMessages: false,
    attachments: [] as FileAttachment[],
    onAttachmentsChange: mockOnAttachmentsChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders textarea and buttons', () => {
    render(<InputArea {...defaultProps} />)
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByText('📎')).toBeInTheDocument()
  })

  it('updates input value when typing', () => {
    render(<InputArea {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    
    expect(mockSetInputValue).toHaveBeenCalledWith('Hello')
  })

  it('sends message on Enter key press', () => {
    render(<InputArea {...defaultProps} inputValue="Test message" />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.keyUp(textarea, { key: 'Enter' })
    
    expect(mockOnSendMessage).toHaveBeenCalled()
  })

  it('does not send message on Shift+Enter', () => {
    render(<InputArea {...defaultProps} inputValue="Test message" />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.keyUp(textarea, { key: 'Enter', shiftKey: true })
    
    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })

  it('disables input when not connected', () => {
    render(<InputArea {...defaultProps} isConnected={false} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('disables input when waiting for response', () => {
    render(<InputArea {...defaultProps} isWaitingForResponse={true} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('shows correct placeholder when connected', () => {
    render(<InputArea {...defaultProps} isConnected={true} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('placeholder', 'Задайте вопрос...')
  })

  it('shows correct placeholder when disconnected', () => {
    render(<InputArea {...defaultProps} isConnected={false} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('placeholder', 'Ожидание подключения...')
  })

  it('displays attachments when present', () => {
    const attachments: FileAttachment[] = [
      {
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        data: 'base64data',
        size: 1024,
      },
    ]
    
    render(<InputArea {...defaultProps} attachments={attachments} />)
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument()
  })

  it('removes attachment when remove button is clicked', () => {
    const attachments: FileAttachment[] = [
      {
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        data: 'base64data',
        size: 1024,
      },
    ]
    
    render(<InputArea {...defaultProps} attachments={attachments} />)
    
    const removeButton = screen.getByText('✕')
    fireEvent.click(removeButton)
    
    expect(mockOnAttachmentsChange).toHaveBeenCalledWith([])
  })

  it('applies centered class when no messages', () => {
    const { container } = render(<InputArea {...defaultProps} hasMessages={false} />)
    
    const inputArea = container.querySelector('.input-area')
    expect(inputArea).toHaveClass('centered')
  })

  it('does not apply centered class when messages exist', () => {
    const { container } = render(<InputArea {...defaultProps} hasMessages={true} />)
    
    const inputArea = container.querySelector('.input-area')
    expect(inputArea).not.toHaveClass('centered')
  })
})
