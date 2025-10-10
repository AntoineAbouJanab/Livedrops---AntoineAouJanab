import React from 'react'

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md bg-cyan-600 text-white px-3 py-2 text-sm hover:bg-cyan-500 disabled:opacity-50 shadow-[0_0_20px] shadow-cyan-500/20 transition ${className}`}
    {...props}
  >{children}</button>
)
