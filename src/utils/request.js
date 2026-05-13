import axios from 'axios'
import { BASE_URL } from '../config'
import { generateUserSign } from './sign'

const req = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,
	headers: { 'Content-Type': 'application/json' }
})

req.interceptors.request.use(
	config => {
		const token = localStorage.getItem('token')
		if (token) config.headers.Authorization = `Bearer ${token}`
		// 请求头加密密钥
		config.headers['user-sign'] = generateUserSign(Date.now())
		// config.headers['xweb_xhr'] = '1'
		// config.headers['User-Agent'] =
		// 	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf2541923) XWEB/19823'
		// config.headers['Referer'] = 'https://servicewechat.com/wxbd5a45d082ccacaa/69/page-frame.html'
		console.log('request config:', config)
		return config
	},
	error => Promise.reject(error)
)

req.interceptors.response.use(
	response => {
		const { code, data, message } = response.data || {}
		if (code === 0 || code === 200) {
			return data
		}
		console.error(message || '请求失败')
		return Promise.reject(message)
	},
	error => {
		console.error(error)
		const response = error.response || {}
		const { status, data } = response
		if (status === 401) {
			localStorage.removeItem('token')
			window.location.href = '/login'
			return Promise.reject(data?.message || '未授权，请重新登录')
		}
		if (status === 403) {
			return Promise.reject(data?.message || '无权限访问')
		}
		if (status === 500) {
			return Promise.reject(data?.message || '服务器异常')
		}
		return Promise.reject(data?.message || '请求失败')
	}
)

export default req
