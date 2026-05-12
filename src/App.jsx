import { Routes } from 'react-router-dom'
import { createRoutes } from './routes/createRoutes'
import routes from './routes/routes'

export default function App() {
	return (
		<div className="App">
			<Routes>{createRoutes(routes)}</Routes>
		</div>
	)
}
