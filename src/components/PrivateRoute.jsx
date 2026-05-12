import { Navigate } from 'react-router-dom'

export default function PrivateRoute(element) {
	const token = localStorage.getItem('token')
	if (!token) return <Navigate to="/login" replace />
	return element
}
