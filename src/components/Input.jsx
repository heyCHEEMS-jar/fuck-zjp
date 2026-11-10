import React from 'react'
import styles from '../styles/components/input.module.css'

export const Input = React.forwardRef(({ className = '', ...props }, ref) => {
	return <input ref={ref} className={`${styles.input} ${className}`} {...props} />
})

Input.displayName = 'Input'
