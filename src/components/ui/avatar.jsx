import { forwardRef } from 'react'
import { Fallback, Image, Root } from '@radix-ui/react-avatar'
import { cn } from '../../lib/utils'

const Avatar = forwardRef(({ className, ...props }, ref) => <Root ref={ref} className={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', className)} {...props} />)
Avatar.displayName = 'Avatar'

const AvatarImage = forwardRef(({ className, ...props }, ref) => <Image ref={ref} className={cn('aspect-square size-full object-cover', className)} {...props} />)
AvatarImage.displayName = 'AvatarImage'

const AvatarFallback = forwardRef(({ className, ...props }, ref) => (
	<Fallback ref={ref} className={cn('flex size-full items-center justify-center rounded-full bg-muted text-sm font-medium', className)} {...props} />
))
AvatarFallback.displayName = 'AvatarFallback'

export { Avatar, AvatarFallback, AvatarImage }
