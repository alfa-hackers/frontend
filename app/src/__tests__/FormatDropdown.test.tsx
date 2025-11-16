import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import FormatDropdown from '@/components/landing/FormatDropdown'
import { FORMAT_FLAGS } from '@/components/landing/consts'

describe('FormatDropdown', () => {
  const mockSetSelectedFlag = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dropdown toggle button', () => {
    render(
      <FormatDropdown
        selectedFlag="text"
        setSelectedFlag={mockSetSelectedFlag}
      />
    )
    
    const toggleButton = screen.getByTitle('Select format')
    expect(toggleButton).toBeInTheDocument()
  })

  it('opens dropdown menu when toggle is clicked', () => {
    render(
      <FormatDropdown
        selectedFlag="text"
        setSelectedFlag={mockSetSelectedFlag}
      />
    )
    
    const toggleButton = screen.getByTitle('Select format')
    fireEvent.click(toggleButton)
    
    const menu = screen.getByRole('listbox')
    expect(menu).toBeInTheDocument()
  })

  it('displays all format options when opened', () => {
    render(
      <FormatDropdown
        selectedFlag="text"
        setSelectedFlag={mockSetSelectedFlag}
      />
    )
    
    const toggleButton = screen.getByTitle('Select format')
    fireEvent.click(toggleButton)
    
    FORMAT_FLAGS.forEach((flag) => {
      expect(screen.getByText(flag.label)).toBeInTheDocument()
    })
  })

  it('calls setSelectedFlag when option is selected', () => {
    render(
      <FormatDropdown
        selectedFlag="text"
        setSelectedFlag={mockSetSelectedFlag}
      />
    )
    
    const toggleButton = screen.getByTitle('Select format')
    fireEvent.click(toggleButton)
    
    const pdfOption = screen.getByText('PDF')
    fireEvent.click(pdfOption)
    
    expect(mockSetSelectedFlag).toHaveBeenCalledWith('pdf')
  })

  it('closes dropdown after selecting an option', () => {
    render(
      <FormatDropdown
        selectedFlag="text"
        setSelectedFlag={mockSetSelectedFlag}
      />
    )
    
    const toggleButton = screen.getByTitle('Select format')
    fireEvent.click(toggleButton)
    
    const pdfOption = screen.getByText('PDF')
    fireEvent.click(pdfOption)
    
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does not open dropdown when disabled', () => {
    render(
      <FormatDropdown
        selectedFlag="text"
        setSelectedFlag={mockSetSelectedFlag}
        isInputDisabled={true}
      />
    )
    
    const toggleButton = screen.getByTitle('Select format')
    fireEvent.click(toggleButton)
    
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <FormatDropdown
          selectedFlag="text"
          setSelectedFlag={mockSetSelectedFlag}
        />
        <div data-testid="outside">Outside element</div>
      </div>
    )
    
    const toggleButton = screen.getByTitle('Select format')
    fireEvent.click(toggleButton)
    
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    
    const outsideElement = screen.getByTestId('outside')
    fireEvent.mouseDown(outsideElement)
    
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  it('marks selected option as active', () => {
    render(
      <FormatDropdown
        selectedFlag="pdf"
        setSelectedFlag={mockSetSelectedFlag}
      />
    )
    
    const toggleButton = screen.getByTitle('Select format')
    fireEvent.click(toggleButton)
    
    const pdfOption = screen.getByText('PDF').closest('button')
    expect(pdfOption).toHaveClass('active')
  })
})
