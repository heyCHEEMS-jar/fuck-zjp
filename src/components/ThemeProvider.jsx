import { createContext, useContext, useLayoutEffect, useState } from 'react'

const ThemeContext = createContext(null)

const getSystemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system')
	const [resolvedTheme, setResolvedTheme] = useState(() => (theme === 'system' ? getSystemTheme() : theme))

	useLayoutEffect(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)')
		const applyTheme = () => {
			const nextTheme = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
			document.documentElement.classList.toggle('dark', nextTheme === 'dark')
			document.documentElement.style.colorScheme = nextTheme
			setResolvedTheme(nextTheme)
		}

		applyTheme()
		media.addEventListener('change', applyTheme)
		return () => media.removeEventListener('change', applyTheme)
	}, [theme])

	const changeTheme = value => {
		setTheme(value)
		if (value === 'system') localStorage.removeItem('theme')
		else localStorage.setItem('theme', value)
	}

	return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme: changeTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
	const context = useContext(ThemeContext)
	if (!context) throw new Error('useTheme 必须在 ThemeProvider 内使用')
	return context
}
