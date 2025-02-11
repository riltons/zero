import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
}

export function Button({ 
  children, 
  className = '', 
  variant = 'primary',
  disabled,
  style,
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-[#46685b] text-white hover:bg-[#213435] focus:ring-[#46685b] disabled:bg-gray-400',
    secondary: 'bg-[#a6b985] text-[#213435] hover:bg-[#e1e3ac] focus:ring-[#a6b985] disabled:bg-gray-400',
    outline: 'border-2 border-[#46685b] text-[#46685b] hover:bg-[#46685b] hover:text-white focus:ring-[#46685b] disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-400'
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className} ${
        disabled ? 'cursor-not-allowed' : ''
      }`}
      disabled={disabled}
      style={style}
      {...props}
    >
      {children}
    </button>
  )
}
