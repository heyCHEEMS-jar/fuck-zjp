import React from 'react'
import styles from '../styles/components/button.module.css'

export const Button = React.forwardRef(({ className = '', destructive = false, variant = 'default', ...props }, ref) => {
	const classes = [
		styles.button,
		variant === 'outline' && styles.variantOutline,
		variant === 'minimal' && styles.variantMinimal,
		destructive && styles.destructive,
		destructive && variant === 'outline' && styles.destructiveOutline,
		destructive && variant === 'minimal' && styles.destructiveMinimal,
		className
	]
		.filter(Boolean)
		.join(' ')

	return <button ref={ref} className={classes} {...props} />
})

Button.displayName = 'Button'
