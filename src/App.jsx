import { Routes } from 'react-router-dom'
import { AlertProvider } from './components/AlertProvider'
import { ThemeProvider } from './components/ThemeProvider'
import { ThemeToggle } from './components/ThemeToggle'
import { createRoutes } from './routes/createRoutes'
import routes from './routes/routes'

export default function App() {
	return (
		<ThemeProvider>
			<AlertProvider>
				<div className="min-h-screen w-full bg-background text-foreground" onContextMenu={e => e.preventDefault()}>
					<ThemeToggle />
					<Routes>{createRoutes(routes)}</Routes>
				</div>
			</AlertProvider>
		</ThemeProvider>
	)
}
