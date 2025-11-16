import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import WelcomeScreen from '@/components/landing/WelcomeScreen'

describe('WelcomeScreen', () => {
  it('renders welcome message', () => {
    render(<WelcomeScreen isConnected={true} />)
    
    expect(screen.getByText('Добро пожаловать')).toBeInTheDocument()
    expect(screen.getByText('Чем я могу вам помочь?')).toBeInTheDocument()
  })

  it('renders when connected', () => {
    render(<WelcomeScreen isConnected={true} />)
    
    const welcomeDiv = document.querySelector('.welcome')
    expect(welcomeDiv).toBeInTheDocument()
  })

  it('renders when disconnected', () => {
    render(<WelcomeScreen isConnected={false} />)
    
    const welcomeDiv = document.querySelector('.welcome')
    expect(welcomeDiv).toBeInTheDocument()
  })
})
