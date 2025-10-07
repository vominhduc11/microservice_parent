import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from '../context/CartContext'
import { ToastProvider } from '../components/ErrorHandling'

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    ...renderOptions
  } = options

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock data for tests
export const mockProduct = {
  id: 1,
  sku: 'TEST-001',
  name: 'Test Product',
  price: 1000000,
  image: 'https://example.com/image.jpg',
  description: 'Test product description',
  stock: 10,
  warranty: 12
}

export const mockProducts = [
  mockProduct,
  {
    id: 2,
    sku: 'TEST-002',
    name: 'Test Product 2',
    price: 2000000,
    image: 'https://example.com/image2.jpg',
    description: 'Test product 2 description',
    stock: 5,
    warranty: 24
  }
]

export const mockDealerInfo = {
  id: 1,
  username: 'testdealer',
  name: 'Test Dealer',
  email: 'test@example.com'
}

// Wait for async operations
export const waitFor = (callback, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const check = () => {
      try {
        const result = callback()
        if (result) {
          resolve(result)
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error('Timeout waiting for condition'))
        } else {
          setTimeout(check, 10)
        }
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          reject(error)
        } else {
          setTimeout(check, 10)
        }
      }
    }
    
    check()
  })
}
