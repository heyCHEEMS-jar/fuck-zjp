import { Routes } from 'react-router-dom'
import { createRoutes } from './routes/createRoutes'
import routes from './routes/routes'
import styles from './styles/app.module.css'

export default function App() {
	return (
		<div className={styles.App} onContextMenu={e => e.preventDefault()}>
			<Routes>{createRoutes(routes)}</Routes>
		</div>
	)
}
