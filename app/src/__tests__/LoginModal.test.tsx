import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginModal from '@/components/landing/LoginModal'

// Mock useAuth hook
jest.mock('@/store/features/auth/useAuth', () => ({
  useAuth: () => ({
    login: jest.fn(),
    isLoading: false,
    error: null,
    clearError: jest.fn(),
  }),
}))

describe('LoginModal', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnOpenRegister = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render when closed', () => {
    render(
      <LoginModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    expect(screen.queryByText('Вход')).not.toBeInTheDocument()
  })

  it('renders modal when open', () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    expect(screen.getByText('Вход')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument()
  })

  it('updates email field on input', () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    expect(emailInput.value).toBe('test@example.com')
  })

  it('updates password field on input', () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const passwordInput = screen.getByPlaceholderText('Пароль') as HTMLInputElement
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(passwordInput.value).toBe('password123')
  })

  it('shows validation error for empty email', async () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const submitButton = screen.getByText('Войти')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Введите email')).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email format', async () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const emailInput = screen.getByPlaceholderText('Email')
    const form = emailInput.closest('form')
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    
    const submitButton = screen.getByText('Войти')
    expect(form).not.toBeNull()
    form!.noValidate = true
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Неверный формат email')).toBeInTheDocument()
    })
  })

  it('shows validation error for empty password', async () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const emailInput = screen.getByPlaceholderText('Email')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    const submitButton = screen.getByText('Войти')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Пароль не может быть пустым')).toBeInTheDocument()
    })
  })

  it('shows validation error for short password', async () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: '12345' } })
    
    const submitButton = screen.getByText('Войти')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Пароль должен быть не меньше 6 символов')).toBeInTheDocument()
    })
  })

  it('closes modal when close button is clicked', () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const closeButton = screen.getAllByText('✕')[0]
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes modal when overlay is clicked', () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const overlay = document.querySelector('.modal-overlay')
    fireEvent.click(overlay!)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('does not close modal when modal content is clicked', () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const modalContent = document.querySelector('.modal-content-wrapper')
    fireEvent.click(modalContent!)
    
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('opens register modal when register link is clicked', () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onOpenRegister={mockOnOpenRegister}
      />
    )
    
    const registerLink = screen.getByText('Зарегистрироваться')
    fireEvent.click(registerLink)
    
    expect(mockOnClose).toHaveBeenCalled()
    expect(mockOnOpenRegister).toHaveBeenCalled()
  })

  it('applies filled class to submit button when form has values', () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    const submitButton = screen.getByText('Войти')
    expect(submitButton).toHaveClass('filled')
  })

  it('clears validation errors when user types', async () => {
    render(
      <LoginModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const submitButton = screen.getByText('Войти')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Введите email')).toBeInTheDocument()
    })
    
    const emailInput = screen.getByPlaceholderText('Email')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    expect(screen.queryByText('Введите email')).not.toBeInTheDocument()
  })
})
