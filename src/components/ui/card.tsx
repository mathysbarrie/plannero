import { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-white border border-neutral-200 hover:border-neutral-300 transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`px-6 py-4 border-b border-neutral-100 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-sm font-medium text-neutral-900 tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  )
}
