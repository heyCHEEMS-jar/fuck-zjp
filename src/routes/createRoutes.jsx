import { Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'

export const createRoutes = routes => {
	return routes?.map(item => {
		const element = item.needAuth ? <PrivateRoute element={item.element} /> : item.element
		if (item.children && item.children.length) return <Route key={item.path}>{createRoutes(item.children)}</Route>
		return <Route key={item.path} path={item.path} element={element}></Route>
	})
}
