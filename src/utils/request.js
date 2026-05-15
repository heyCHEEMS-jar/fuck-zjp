import axios from 'axios'
import { BASE_URL } from '../config'
import { generateUserSign } from './sign'
import { logout } from './util'

const req = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,
	headers: { 'Content-Type': 'application/json' }
})

req.interceptors.request.use(
	config => {
		const token = localStorage.getItem('token')
		if (token) config.headers.Authorization = `Bearer ${token}`
		config.headers['user-sign'] = generateUserSign(Date.now()) // 请求头加密密钥
		return config
	},
	error => Promise.reject(error)
)

req.interceptors.response.use(
	response => {
		const { code } = response.data || {}
		if (code === 0 || code === 200) {
			return response.data
		}
		if (code === 4001) {
			logout()
		}
		console.error(response.data)
		return Promise.reject(response.data)
	},
	error => {
		console.error(error)
		const response = error.response || {}
		if (response.status === 401) {
			logout()
		}
		return Promise.reject(response.data)
	}
)

export default req
