import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ className, children, padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 shadow-sm', paddings[padding], className)}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  className?: string
  children: React.ReactNode
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  className?: string
  children: React.ReactNode
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={cn('text-base font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}
