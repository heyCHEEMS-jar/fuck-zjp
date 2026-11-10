import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme()
	const isDark = resolvedTheme === 'dark'

	return (
		<Button
			variant="outline"
			size="icon"
			className="fixed top-4 right-4 z-50 rounded-full bg-background/80 shadow-sm backdrop-blur"
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			aria-label={isDark ? '切换为浅色主题' : '切换为深色主题'}
			title={isDark ? '切换为浅色主题' : '切换为深色主题'}
		>
			{isDark ? <Sun /> : <Moon />}
		</Button>
	)
}
