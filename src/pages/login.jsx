import { Input } from '../components/Input.jsx'
import { Button } from '../components/Button.jsx'
import styles from '../styles/login.module.css'
import { login } from '../api/index.js'
import { useCallback, useMemo, useState } from 'react'
import { throttle } from '../utils/util.js'

export default function Login() {
	const [loading, setLoading] = useState(false)
	const handleSubmit = useCallback(async e => {
		e.preventDefault()
		if (loading) return
		setLoading(true)
		const fd = new FormData(e.target)
		const openId = fd.get('openId') || ''
		const officeOpenId = fd.get('officeOpenId') || ''
		const littleOpenId = fd.get('littleOpenId') || ''
		try {
			const data = await login({ openId, officeOpenId, littleOpenId })
			data && localStorage.setItem('token', data)
			console.log(data)
		} finally {
			setLoading(false)
		}
	}, [])
	const debouncedSubmit = useMemo(() => throttle(handleSubmit, 2000, { immediate: true }), [handleSubmit])

	return (
		<form onSubmit={debouncedSubmit} className={styles.container}>
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
