import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import RegisterModal from '@/components/landing/RegisterModal'

// Mock useAuth hook
jest.mock('@/store/features/auth/useAuth', () => ({
  useAuth: () => ({
    register: jest.fn(),
    isLoading: false,
    error: null,
    clearError: jest.fn(),
  }),
}))

describe('RegisterModal', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render when closed', () => {
    render(
      <RegisterModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    expect(screen.queryByText('Регистрация')).not.toBeInTheDocument()
  })

  it('renders modal when open', () => {
    render(
      <RegisterModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    expect(screen.getByText('Регистрация')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Введите имя пользователя')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Введите ваш email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Введите ваш пароль')).toBeInTheDocument()
  })

  it('updates username field on input', () => {
    render(
      <RegisterModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const usernameInput = screen.getByPlaceholderText('Введите имя пользователя') as HTMLInputElement
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    
    expect(usernameInput.value).toBe('testuser')
  })

  it('updates email field on input', () => {
    render(
      <RegisterModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const emailInput = screen.getByPlaceholderText('Введите ваш email') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    expect(emailInput.value).toBe('test@example.com')
  })

  it('updates password field on input', () => {
    render(
      <RegisterModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const passwordInput = screen.getByPlaceholderText('Введите ваш пароль') as HTMLInputElement
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(passwordInput.value).toBe('password123')
  })

  it('disables submit button', async () => {
    render(
      <RegisterModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const submitButton = screen.getByText('Зарегистрироваться')
    expect(submitButton).not.toHaveClass('filled')
  })

  it('shows validation error for invalid email format', async () => {
    render(
      <RegisterModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const usernameInput = screen.getByPlaceholderText('Введите имя пользователя')
    const emailInput = screen.getByPlaceholderText('Введите ваш email')
    const passwordInput = screen.getByPlaceholderText('Введите ваш пароль')
    const form = emailInput.closest('form')
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    const submitButton = screen.getByText('Зарегистрироваться')
    expect(form).not.toBeNull()
    form!.noValidate = true
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument()
    })
  })

  it('disables submit button when password is not set', async () => {
    render(
      <RegisterModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const usernameInput = screen.getByPlaceholderText('Введите имя пользователя')
    const emailInput = screen.getByPlaceholderText('Введите ваш email')
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    const submitButton = screen.getByText('Зарегистрироваться')

    expect(submitButton).not.toHaveClass('filled')
  })

  it('shows validation error for short password', async () => {
    render(
      <RegisterModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const usernameInput = screen.getByPlaceholderText('Введите имя пользователя')
    const emailInput = screen.getByPlaceholderText('Введите ваш email')
    const passwordInput = screen.getByPlaceholderText('Введите ваш пароль')
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: '12345' } })
    
    const submitButton = screen.getByText('Зарегистрироваться')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('closes modal when close button is clicked', () => {
    render(
      <RegisterModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const closeButton = screen.getByText('✕')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('applies filled class to submit button when form has values', () => {
    render(
      <RegisterModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const usernameInput = screen.getByPlaceholderText('Введите имя пользователя')
    const emailInput = screen.getByPlaceholderText('Введите ваш email')
    const passwordInput = screen.getByPlaceholderText('Введите ваш пароль')
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    const submitButton = screen.getByText('Зарегистрироваться')
    expect(submitButton).toHaveClass('filled')
  })

  it('allows email to be optional', async () => {
    render(
      <RegisterModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    
    const usernameInput = screen.getByPlaceholderText('Введите имя пользователя')
    const passwordInput = screen.getByPlaceholderText('Введите ваш пароль')
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    const submitButton = screen.getByText('Зарегистрироваться')
    
    expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument()
  })
})
