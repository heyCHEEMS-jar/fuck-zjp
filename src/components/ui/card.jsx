import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Card = forwardRef(({ className, ...props }, ref) => (
	<div ref={ref} className={cn('flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm', className)} {...props} />
))
Card.displayName = 'Card'

const CardHeader = forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn('grid gap-1.5 px-6', className)} {...props} />)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef(({ className, ...props }, ref) => <h2 ref={ref} className={cn('font-semibold leading-none tracking-tight', className)} {...props} />)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef(({ className, ...props }, ref) => <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn('px-6', className)} {...props} />)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn('flex items-center px-6', className)} {...props} />)
CardFooter.displayName = 'CardFooter'

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
