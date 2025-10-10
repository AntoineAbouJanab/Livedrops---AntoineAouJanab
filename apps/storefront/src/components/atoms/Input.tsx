import React from 'react'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className = '', ...props }, ref) => (
  <input ref={ref} className={`border border-slate-700 bg-slate-900/60 text-slate-100 placeholder:text-slate-400 rounded-md px-3 py-2 text-sm w-full focus:outline-cyan-500 ${className}`} {...props} />
))
Input.displayName = 'Input'
