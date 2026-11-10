import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, CalendarDays, Clock3, LogOut, QrCode, School, ShieldAlert, Users, X } from 'lucide-react'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'
import { getActivityList, getAdminSignInfo, getSignInButton, getSignInStatus, getUserInfo, getUserScores, signIn, signOut } from '../api'
import { createQRCode } from '../api/qr-code'
import { useAlert } from '../components/AlertProvider'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Separator } from '../components/ui/separator'
import { VirtualList } from '../components/VirtualList'
import { generateCodeStr } from '../utils/sign'
import { formatDate, logout, throttle } from '../utils/util'

const plateMap = {
	1: '完满',
	2: '就创',
	3: '名师课堂',
	5: '体育体测'
}

export default function Index() {
	const { showAlert, showConfirm } = useAlert()
	const [list, setList] = useState([])
	const [pageNum, setPageNum] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [userInfo, setUserInfo] = useState({})
	const [userScores, setUserScores] = useState({})
	const loadingRef = useRef(false)
	const [allLoaded, setAllLoaded] = useState(false) // 是否已加载到底
	const [showBackTop, setShowBackTop] = useState(false)
	const listRef = useRef(null)
	const [activityType, setActivityType] = useState('全部') // 全部,审核中,待进行,进行中,已完结
	const [codeUrls, setCodeUrls] = useState({}) // 二维码图片url

	const handleLogout = async () => {
		const confirmed = await showConfirm('退出后需要重新登录，确定要继续吗？', { title: '退出登录', confirmText: '退出', variant: 'destructive' })
		if (confirmed) logout()
	}

	// 初始获取活动
	const getActivities = useCallback(async (n = 1, s = 10, type = '全部') => {
		if (loadingRef.current) return
		loadingRef.current = true
		try {
			const res = await getActivityList(n, s, type)
			const { records = [] } = res.data || {}
			setList(records)
		} catch {
		} finally {
			loadingRef.current = false
		}
	}, [])

	// 加载更多活动
	const _loadMore = useCallback(async () => {
		if (allLoaded || loadingRef.current) return
		loadingRef.current = true
		try {
			const res = await getActivityList(pageNum + 1, pageSize, activityType)
			const { records = [] } = res.data || {}
			setList(prev => {
				const newList = [...prev, ...records]
				if (newList.length === prev.length) {
					setAllLoaded(true)
				}
				return newList
			})
			setPageNum(prev => prev + 1)
		} catch {
		} finally {
			loadingRef.current = false
		}
	}, [pageNum, pageSize, activityType, allLoaded])
	const throttledLoadMore = useMemo(() => throttle(_loadMore, 100, { immediate: true }), [_loadMore])

	const handleScroll = e => {
		const { scrollTop } = e.currentTarget
		setShowBackTop(scrollTop >= 800)
	}

	const handleBackTop = () => {
		listRef.current.scrollTo({
			top: 0,
			behavior: 'smooth'
		})
	}

	// 关闭二维码
	const closeQRCode = item => {
		setCodeUrls(prev => {
			const next = { ...prev }
			delete next[item.id]
			return next
		})
	}

	// 获取签到二维码
	const _getQRCode = useCallback(
		async item => {
			if (loadingRef.current) return
			loadingRef.current = true
			try {
				// 获取签到按钮状态
				const signBtnRes = await getSignInButton(item.id)
				if (!signBtnRes.data) throw new Error('未从响应中获取到数据')
				const signBtnData = signBtnRes.data
				// 获取管理端签到详情
				const signInfoRes = await getAdminSignInfo({ activityId: item.id, signId: signBtnData.id, isCheckOrg: true })
				if (!signInfoRes.data) throw new Error('未从响应中获取到数据')
				const signData = signInfoRes.data
				// 加密请求体
				const generateReqData = {
					activityId: item.id,
					currentTime: Date.now(),
					buttonType: signData.buttonType, // 1:签到,2:签退
					buttonName: signData.name,
					type: 1, // 签到类型,如扫码签到
					signId: signData.id,
					refreshTime: signData.refreshTime,
					isHide: signData.isHide,
					organizerId: signData.isHide
				}
				console.log(`生成二维码加密请求体:`, generateReqData)
				const encryptedStr = generateCodeStr(generateReqData)
				const qrCodeUrl = await createQRCode({ data: encryptedStr })
				setCodeUrls(prev => ({
					...prev,
					[item.id]: qrCodeUrl
				}))
			} catch (err) {
				if (err.message) await showAlert(err.message, { title: '获取二维码失败', variant: 'destructive' })
			} finally {
				loadingRef.current = false
			}
		},
		[showAlert]
	)
	const throttledGetQRCode = useMemo(() => throttle(_getQRCode, 3000, { immediate: true }), [_getQRCode])

	// 签到/签退
	const _handleSign = useCallback(
		async item => {
			if (loadingRef.current) return
			loadingRef.current = true
			try {
				// 获取签到按钮状态
				const signBtnRes = await getSignInButton(item.id)
				if (!signBtnRes.data) throw new Error('未从响应中获取到数据')
				const signBtnData = signBtnRes.data
				// 获取管理端签到详情
				const signInfoRes = await getAdminSignInfo({ activityId: item.id, signId: signBtnData.id, isCheckOrg: true })
				if (!signInfoRes.data) throw new Error('未从响应中获取到数据')
				const signData = signInfoRes.data
				// 确认签到/签退
				const confirmed = await showConfirm(`当前可执行状态为${signData.name}，确定要强制${signData.name}吗？`, {
					title: '确认强制操作',
					confirmText: `强制${signData.name}`,
					variant: 'destructive'
				})
				if (!confirmed) return
				if (signData.buttonType === 1) {
					const signInReqData = {
						activityId: item.id,
						currentTime: Date.now(),
						buttonType: signData.buttonType, // 1:签到,2:签退
						buttonName: signData.name,
						type: 1, // 签到类型,如扫码签到
						signId: signData.id,
						refreshTime: signData.refreshTime,
						isHide: signData.isHide,
						organizerId: signData.isHide,
						latitude: signData.latitude,
						longitude: signData.longitude
					}
					console.log(`请求签到:`, signInReqData)
					await signIn(signInReqData)
				} else if (signData.buttonType === 2) {
					const signOutReqData = {
						activityId: item.id,
						buttonType: signData.buttonType, // 1:签到,2:签退
						type: 1, // 签到类型,如扫码签到
						signId: signData.id,
						latitude: signData.latitude,
						longitude: signData.longitude
					}
					console.log(`请求签退:`, signOutReqData)
					await signOut(signOutReqData)
				} else {
					throw { message: `未知的 buttonType: ${signData.buttonType}, buttonName: ${signData.buttonName}` }
				}
				await getActivities(1, 10, activityType)
				setAllLoaded(false)
				setPageNum(1)
				setPageSize(10)
			} catch (err) {
				if (err.message) await showAlert(err.message, { title: '操作失败', variant: 'destructive' })
			} finally {
				loadingRef.current = false
			}
		},
		[getActivities, activityType, showAlert, showConfirm]
	)
	const throttledSign = useMemo(() => throttle(_handleSign, 2000, { immediate: true }), [_handleSign])

	// 获取签到开放时间
	const _getSignInStatus = useCallback(
		async item => {
			if (loadingRef.current) return
			loadingRef.current = true
			try {
				const res = await getSignInStatus({
					activityId: item.id,
					type: 1 // 签到类型,如扫码签到
				})
				let msgStr = ''
				res.data?.forEach(({ beginTime, endTime, name }) => {
					const formatBegin = formatDate(beginTime)
					const formatEnd = formatDate(endTime)
					msgStr += `${name}\n`
					if (beginTime) msgStr += `开始时间：${formatBegin}\n`
					if (endTime) msgStr += `结束时间：${formatEnd}\n\n`
				})
				await showAlert(msgStr.trim(), { title: '签到时间' })
			} catch (err) {
				if (err.message) await showAlert(err.message, { title: '获取签到时间失败', variant: 'destructive' })
			} finally {
				loadingRef.current = false
			}
		},
		[showAlert]
	)
	const throttledGetSignInStatus = useMemo(() => throttle(_getSignInStatus, 2000, { immediate: true }), [_getSignInStatus])

	// 选择活动分类
	const _selectActivityType = useCallback(
		async type => {
			if (activityType === type) return
			setActivityType(type)
			setAllLoaded(false)
			setPageNum(1)
			setPageSize(10)
			await getActivities(1, 10, type)
		},
		[getActivities, activityType]
	)
	const throttledSelectType = useMemo(() => throttle(_selectActivityType, 400, { immediate: true }), [_selectActivityType])

	useEffect(() => {
		// 获取用户活动列表
		getActivities()
		// 获取用户信息
		getUserInfo().then(res => {
			setUserInfo(res.data || {})
		})
		// 获取用户积分
		getUserScores().then(res => {
			setUserScores(res.data || {})
		})
	}, [])

	const ScoreList = () => (
		<div className="space-y-4">
			<div>
				<p className="text-sm text-muted-foreground">当前总积分</p>
				<p className="mt-1 text-3xl font-semibold tracking-tight">{userScores.total ?? 0}</p>
			</div>
			<Separator />
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
				{userScores.list?.map((item, index) => {
					const passed = item.value >= item.passScore
					return (
						<div key={index} className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2.5">
							<div className="min-w-0">
								<p className="truncate text-sm font-medium">{item.name}</p>
								<p className="text-xs text-muted-foreground">达标 {item.passScore} 分</p>
							</div>
							<Badge variant={passed ? 'default' : 'secondary'}>{item.value} 分</Badge>
						</div>
					)
				})}
			</div>
		</div>
	)

	const activityTypes = ['全部', '审核中', '待开始', '进行中', '已完结']

	return (
		<main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
			<header className="space-y-1 pr-12">
				<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">活动中心</h1>
				<p className="text-sm text-muted-foreground">查看个人信息、积分与活动记录</p>
			</header>

			<section className="grid gap-4 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader className="flex flex-row items-center justify-between gap-4">
						<div className="flex min-w-0 items-center gap-4">
							<Avatar className="size-14 border">
								<AvatarImage src={userInfo.avatar} alt={userInfo.name || '用户头像'} />
								<AvatarFallback>{userInfo.name?.slice(0, 2) || '用户'}</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<CardTitle className="truncate text-lg">{userInfo.name || userInfo.userName || '用户'}</CardTitle>
								<CardDescription className="mt-1 truncate">{userInfo.userName || `ID ${userInfo.userId || '-'}`}</CardDescription>
							</div>
						</div>
						<Button variant="outline" size="sm" onClick={handleLogout}>
							<LogOut />
							<span className="hidden sm:inline">退出登录</span>
						</Button>
					</CardHeader>
					<CardContent>
						<Separator className="mb-5" />
						<dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
							{[
								['学校', `${userInfo.schoolName || '-'}${userInfo.educationName ? `（${userInfo.educationName}）` : ''}`],
								['学院', userInfo.collegeName || '-'],
								['专业', userInfo.majorName || '-'],
								['班级', userInfo.className || '-'],
								['学号', userInfo.studyNumber || '-'],
								['手机号', userInfo.maskedPhoneNumber || '-']
							].map(([label, value]) => (
								<div key={label} className="min-w-0">
									<dt className="text-xs text-muted-foreground">{label}</dt>
									<dd className="mt-1 truncate font-medium">{value}</dd>
								</div>
							))}
						</dl>
						{userInfo.isGraduated !== undefined && (
							<Badge className="mt-5" variant="secondary">
								{userInfo.isGraduated === 0 ? '在读' : '已毕业'}
							</Badge>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>积分概览</CardTitle>
						<CardDescription>当前账户积分情况</CardDescription>
					</CardHeader>
					<CardContent>
						<ScoreList />
					</CardContent>
				</Card>
			</section>

			<Card className="gap-0 overflow-hidden py-0">
				<CardHeader className="gap-4 border-b py-5">
					<div>
						<CardTitle>活动列表</CardTitle>
						<CardDescription className="mt-1">浏览和管理你的活动</CardDescription>
					</div>
					<div className="flex gap-2 overflow-x-auto pb-1">
						{activityTypes.map(type => (
							<Button key={type} variant={activityType === type ? 'default' : 'outline'} size="sm" onClick={() => throttledSelectType(type)}>
								{type}
							</Button>
						))}
					</div>
				</CardHeader>
				<CardContent className="p-3 sm:p-4">
					{showBackTop && (
						<Button
							className="fixed right-4 bottom-4 z-40 rounded-full shadow-lg"
							size="icon"
							onClick={handleBackTop}
							aria-label="返回顶部"
							title="返回顶部"
						>
							<ArrowUp />
						</Button>
					)}
					<VirtualList
						ref={listRef}
						data={list}
						estimatedHeight={240}
						onReachBottom={throttledLoadMore}
						containerHeight="72vh"
						gap={12}
						rowKey="id"
						onScroll={handleScroll}
						suffix={allLoaded && list.length ? <div className="py-5 text-center text-xs text-muted-foreground">已加载全部</div> : null}
						empty={
							<div className="flex min-h-56 flex-col items-center justify-center gap-3 text-muted-foreground">
								<CalendarDays className="size-9 opacity-50" />
								<p className="text-sm">暂无活动</p>
							</div>
						}
						renderItem={item => (
							<Card className="gap-0 overflow-hidden py-0 shadow-none transition-colors hover:border-primary/40">
								<div className="flex flex-col sm:flex-row">
									<PhotoProvider>
										<div className="relative h-40 shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-52">
											<PhotoView src={item.pictureUrl}>
												<img
													className="size-full cursor-zoom-in object-cover transition-transform duration-300 hover:scale-[1.03]"
													loading="lazy"
													src={item.pictureUrl}
													alt="活动封面"
												/>
											</PhotoView>
											{plateMap[item.plate] && (
												<Badge className="absolute top-3 left-3 bg-black/70 text-white hover:bg-black/70">{plateMap[item.plate]}</Badge>
											)}
										</div>
									</PhotoProvider>

									<div className="min-w-0 flex-1 space-y-3 p-4">
										<div className="flex items-start justify-between gap-3">
											<h3 className="line-clamp-2 font-semibold leading-snug">{item.name}</h3>
											<Badge variant="outline" className="shrink-0">
												{item.statusName}
											</Badge>
										</div>
										<div className="space-y-2 text-xs text-muted-foreground">
											<div className="flex items-start gap-2">
												<Clock3 className="mt-0.5 size-3.5 shrink-0" />
												<span>
													{item.beginTime ? `${formatDate(item.beginTime)} - ` : ''}
													{formatDate(item.endTime) || '时间待定'}
												</span>
											</div>
											<div className="flex items-start gap-2">
												<School className="mt-0.5 size-3.5 shrink-0" />
												<span className="line-clamp-1">
													{(item.organizerList || [])
														.slice(0, 3)
														.map(o => o.name)
														.join('、') || '主办单位待定'}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<Users className="size-3.5 shrink-0" />
												<span>
													{item.applicantsNumber}/{item.totalNumber} 人
												</span>
											</div>
										</div>
										{item.labelList?.length > 0 && (
											<div className="flex flex-wrap gap-1.5">
												{item.labelList.slice(0, 3).map((label, index) => (
													<Badge key={index} variant="secondary">
														{label.name}
													</Badge>
												))}
											</div>
										)}
									</div>
								</div>

								{item.status === 5 && (
									<div className="flex flex-wrap justify-end gap-2 border-t bg-muted/20 p-3">
										<Button variant="outline" size="sm" onClick={() => throttledGetSignInStatus(item)}>
											<Clock3 />
											签到时间
										</Button>
										<Button variant="secondary" size="sm" onClick={() => throttledGetQRCode(item)}>
											<QrCode />
											签到二维码
										</Button>
										<Button variant="destructive" size="sm" onClick={() => throttledSign(item)}>
											<ShieldAlert />
											强制签到/签退
										</Button>
									</div>
								)}

								{codeUrls[item.id] && (
									<div className="relative flex justify-center border-t bg-muted/30 p-5">
										<PhotoProvider>
											<PhotoView src={codeUrls[item.id]}>
												<img className="size-36 cursor-zoom-in rounded-lg bg-white p-2" loading="lazy" src={codeUrls[item.id]} alt="签到二维码" />
											</PhotoView>
										</PhotoProvider>
										<Button
											variant="ghost"
											size="icon"
											className="absolute top-2 right-2 size-8"
											onClick={() => closeQRCode(item)}
											aria-label="关闭二维码"
										>
											<X />
										</Button>
									</div>
								)}
							</Card>
						)}
					/>
				</CardContent>
			</Card>
		</main>
	)
}
