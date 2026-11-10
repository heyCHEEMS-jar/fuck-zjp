import { useCallback, useMemo, useState } from 'react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/index.js'
import { useAlert } from '../components/AlertProvider'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { throttle } from '../utils/util.js'

export default function Login() {
	const navigate = useNavigate()
	const { showAlert } = useAlert()
	const [loading, setLoading] = useState(false)
	const _handleSubmit = useCallback(
		async e => {
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
				if (err.message) await showAlert(err.message, { title: '登录失败', variant: 'destructive' })
			} finally {
				setLoading(false)
			}
		},
		[loading, navigate, showAlert]
	)
	const debouncedSubmit = useMemo(() => throttle(_handleSubmit, 2000, { immediate: true }), [_handleSubmit])

	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-16">
			<Card className="w-full max-w-md gap-0 overflow-hidden shadow-lg shadow-black/5">
				<CardHeader className="items-center px-6 pt-2 pb-8 text-center">
					<div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
						<ShieldCheck className="size-5" />
					</div>
					<CardTitle className="text-xl">登录</CardTitle>
					<CardDescription>填写账户标识以继续访问</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={e => {
							e.preventDefault()
							debouncedSubmit(e)
						}}
						className="space-y-5"
					>
						<div className="space-y-2">
							<label className="text-sm font-medium" htmlFor="openId">
								Open ID
							</label>
							<Input id="openId" name="openId" placeholder="输入 openId" autoComplete="off" />
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium" htmlFor="officeOpenId">
								Office Open ID
							</label>
							<Input id="officeOpenId" name="officeOpenId" placeholder="输入 officeOpenId" autoComplete="off" />
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium" htmlFor="littleOpenId">
								Little Open ID
							</label>
							<Input id="littleOpenId" name="littleOpenId" placeholder="输入 littleOpenId" autoComplete="off" />
						</div>

						<Button className="mt-2 w-full" type="submit" disabled={loading}>
							{loading ? '登录中…' : '登录'}
							{!loading && <ArrowRight />}
						</Button>
					</form>
				</CardContent>
			</Card>
		</main>
	)
}
