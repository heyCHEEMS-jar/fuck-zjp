import { Input } from '../components/Input'
import { Button } from '../components/Button'
import styles from '../styles/pages/login.module.css'
import { login } from '../api/index.js'
import { useCallback, useMemo, useState } from 'react'
import { throttle } from '../utils/util.js'
import { useNavigate } from 'react-router-dom'

export default function Login() {
	const navigate = useNavigate()
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')
	const _handleSubmit = useCallback(async e => {
		if (loading) return
		setLoading(true)
		const fd = new FormData(e.target)
		const openId = fd.get('openId') || ''
		const officeOpenId = fd.get('officeOpenId') || ''
		const littleOpenId = fd.get('littleOpenId') || ''
		try {
			const res = await login({ openId, officeOpenId, littleOpenId })
			res.data && localStorage.setItem('token', res.data)
			navigate('/index', { replace: true })
		} catch (err) {
			setMessage(err.message || '')
		} finally {
			setLoading(false)
		}
	}, [])
	const debouncedSubmit = useMemo(() => throttle(_handleSubmit, 2000, { immediate: true }), [_handleSubmit])

	return (
		<form
			onSubmit={e => {
				e.preventDefault()
				debouncedSubmit(e)
			}}
			className={styles.container}
		>
			<div className={styles.message}>{message}</div>
			<div className={styles['input-container']}>
				<label htmlFor="openId">Open ID</label>
				<Input id="openId" name="openId" placeholder="输入 openId" />
			</div>

			<div className={styles['input-container']}>
				<label htmlFor="officeOpenId">Office Open ID</label>
				<Input id="officeOpenId" name="officeOpenId" placeholder="输入 officeOpenId" />
			</div>

			<div className={styles['input-container']}>
				<label htmlFor="littleOpenId">Little Open ID</label>
				<Input id="littleOpenId" name="littleOpenId" placeholder="输入 littleOpenId" />
			</div>

			<div className={styles['submit-button']}>
				<Button type="submit">登录</Button>
			</div>
		</form>
	)
}
