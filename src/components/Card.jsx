import React from 'react'
import styles from '../styles/components/card.module.css'

export const Card = React.forwardRef(({ className, ...props }, ref) => {
	return <section ref={ref} className={`${styles.card} ${className || ''}`.trim()} {...props} />
})
Card.displayName = 'Card'

export const CardImage = React.forwardRef(({ className, ...props }, ref) => {
	return <img ref={ref} className={`${styles.cardImage} ${className || ''}`.trim()} {...props} />
})
CardImage.displayName = 'CardImage'

export const CardContent = React.forwardRef(({ className, ...props }, ref) => {
	return <div ref={ref} className={`${styles.cardContent} ${className || ''}`.trim()} {...props} />
})
CardContent.displayName = 'CardContent'

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => {
	return <h2 ref={ref} className={`${styles.cardTitle} ${className || ''}`.trim()} {...props} />
})
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef(({ className, ...props }, ref) => {
	return <div ref={ref} className={`${styles.cardDescription} ${className || ''}`.trim()} {...props} />
})
CardDescription.displayName = 'CardDescription'
