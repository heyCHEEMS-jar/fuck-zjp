import React from 'react'
import { Root, Image, Fallback } from '@radix-ui/react-avatar'
import styles from '../styles/components/avatar.module.css'

export const Avatar = React.forwardRef(({ className, style, ...props }, ref) => {
	return <Root ref={ref} className={`${styles.root} ${className || ''}`} style={style} {...props} />
})
Avatar.displayName = 'Avatar'

export const AvatarImage = React.forwardRef(({ className, style, ...props }, ref) => {
	return <Image ref={ref} className={`${styles.image} ${className || ''}`} style={style} {...props} />
})
AvatarImage.displayName = 'AvatarImage'

export const AvatarFallback = React.forwardRef(({ className, style, ...props }, ref) => {
	return <Fallback ref={ref} className={`${styles.fallback} ${className || ''}`} style={style} {...props} />
})
AvatarFallback.displayName = 'AvatarFallback'
