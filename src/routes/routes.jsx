import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'

const Login = lazy(() => import('../pages/login'))
const Index = lazy(() => import('../pages/index'))

const lazyLoad = Component => {
	return (
		<Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">加载中…</div>}>
			<Component></Component>
		</Suspense>
	)
}

const routes = [
	{
		path: '/',
		element: <Navigate to="/index" replace />
	},
	{
		path: '/login',
		element: lazyLoad(Login)
	},
	{
		path: '/index',
		element: lazyLoad(Index),
		needAuth: true
	},
	{
		path: '*',
		element: <div>404 页面不存在</div>
	}
]

export default routes
