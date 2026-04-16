import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export function FormField({ label, hint, required, className, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white',
        'placeholder:text-gray-400 text-gray-900',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
        'transition-colors duration-150',
        'disabled:bg-gray-50 disabled:text-gray-400',
        className
      )}
      {...props}
    />
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white resize-none',
        'placeholder:text-gray-400 text-gray-900',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
        'transition-colors duration-150',
        'disabled:bg-gray-50 disabled:text-gray-400',
        className
      )}
      {...props}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string
  children: React.ReactNode
}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white',
        'text-gray-900 appearance-none',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
        'transition-colors duration-150',
        'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")] bg-[position:right_0.5rem_center] bg-no-repeat bg-[length:1.25em_1.25em] pr-8',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

interface RadioGroupProps {
  label?: string
  options: { value: string; label: string; description?: string }[]
  value: string
  onChange: (value: string) => void
  name: string
}

export function RadioGroup({ label, options, value, onChange, name }: RadioGroupProps) {
  return (
    <div>
      {label && <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-all duration-150 select-none',
              value === option.value
                ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  )
}

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', className)}>
      {children}
    </span>
  )
}
