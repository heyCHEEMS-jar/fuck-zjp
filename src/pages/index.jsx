import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getActivityList, getAdminSignInfo, getSignInButton, getSignInStatus, getUserInfo, getUserScores, signIn } from '../api'
import styles from '../styles/pages/index.module.css'
import { Avatar, AvatarFallback, AvatarImage } from '../components/Avatar'
import { Card, CardContent, CardDescription, CardTitle } from '../components/Card'
import { formatDate, logout, throttle } from '../utils/util'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'
import { Button } from '../components/Button'
import { VirtualList } from '../components/VirtualList'

const plateMap = {
	1: '完满',
	2: '就创',
	3: '名师课堂',
	5: '体育体测'
}

export default function Index() {
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

	const handleLogout = () => {
		if (!window.confirm('确定要退出登录？')) return
		logout()
	}

	// 初始获取活动
	const getActivities = async (n = 1, s = 10, type = '全部') => {
		if (loadingRef.current) return
		loadingRef.current = true
		try {
			const res = await getActivityList(n, s, type)
			const { records = [] } = res.data || {}
			setList(records)
			console.log(res)
		} catch {
		} finally {
			loadingRef.current = false
		}
	}

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

	// 签到
	const _handleSignIn = useCallback(
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
				// 确认签到
				if (!window.confirm('确定强制签到吗？')) throw '取消'
				const signReqData = {
					activityId: item.id,
					currentTime: Date.now(),
					buttonType: signData.buttonType,
					buttonName: signData.name,
					type: 1, // 签到类型,如扫码签到
					signId: signData.id,
					refreshTime: signData.refreshTime,
					isHide: signData.isHide,
					organizerId: signData.isHide,
					latitude: signData.latitude,
					longitude: signData.longitude
				}
				console.log('请求签到:', signReqData)
				const signRes = await signIn(signReqData)
				await getActivities(1, 10, activityType)
				setAllLoaded(false)
				setPageNum(1)
				setPageSize(10)
			} catch (err) {
				err.message && alert(err.message)
			} finally {
				loadingRef.current = false
			}
		},
		[getActivities, activityType]
	)
	const throttledSignIn = useMemo(() => throttle(_handleSignIn, 2000, { immediate: true }), [_handleSignIn])

	// 获取签到开放时间
	const _getSignInStatus = useCallback(async item => {
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
			alert(msgStr.trim())
		} catch (err) {
			err.message && alert(err.message)
		} finally {
			loadingRef.current = false
		}
	}, [])
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
		<div>
			当前总共<span>{userScores.total}</span>分
			<div className={styles['score-list']}>
				{userScores.list?.map((item, index) => {
					return (
						<div key={index}>
							<br />
							<span>
								{item.name}({'>='}
								{item.passScore}分)
							</span>
							<br />
							已有<span className={item.value >= item.passScore ? styles['passed-score'] : styles['unpass-score']}>{item.value}</span>分
						</div>
					)
				})}
			</div>
		</div>
	)

	// 鼠标悬浮水波纹动画
	const createRipple = e => {
		const { clientX, clientY } = e
		if (clientX === undefined || clientY === undefined) return
		const el = e.currentTarget
		const rect = el?.getBoundingClientRect()
		if (!rect || !el) return
		// 相对于元素的点击位置
		const x = clientX - rect.left
		const y = clientY - rect.top
		// 创建水波纹div
		const ripple = document.createElement('div')
		ripple.className = styles.ripple
		ripple.style.left = `${x}px`
		ripple.style.top = `${y}px`
		el.appendChild(ripple)
		ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
		ripple.addEventListener('animationcancel', () => ripple.remove(), { once: true })
	}

	return (
		<>
			<Card className={styles.card}>
				<CardContent>
					<CardDescription>
						{
							<div className={styles['card-content']}>
								<div className={styles['avatar-container']}>
									<Avatar style={{ width: 80, height: 80 }}>
										<AvatarImage src={userInfo.avatar} alt="User Avatar" />
										<AvatarFallback>USER</AvatarFallback>
									</Avatar>
									<Button variant="outline" onClick={() => handleLogout()}>
										退出登录
									</Button>
								</div>
								<div>
									<span>用户ID：{userInfo.userId}</span>
									<br />
									<span>用户名：{userInfo.userName}</span>
									<br />
									<span>姓名：{userInfo.name}</span>
									<br />
									<span>
										学校：{userInfo.schoolName}
										{userInfo.educationName && `(${userInfo.educationName})`}
									</span>
									<br />
									<span>学院：{userInfo.collegeName}</span>
									<br />
									<span>专业：{userInfo.majorName}</span>
									<br />
									<span>班级：{userInfo.className}</span>
									<br />
									<span>学号：{userInfo.studyNumber}</span>
									<br />
									<span>手机号：{userInfo.maskedPhoneNumber}</span>
									<br />
									{userInfo.isGraduated !== undefined && <span>状态：{userInfo.isGraduated === 0 ? '未毕业' : '已毕业'}</span>}
								</div>
							</div>
						}
					</CardDescription>
				</CardContent>
			</Card>
			<Card className={styles.card}>
				<CardContent>
					<CardDescription className={styles['card-content']}>
						<ScoreList />
					</CardDescription>
				</CardContent>
			</Card>
			<Card className={styles.card}>
				<CardContent>
					<CardTitle>
						<div className={styles['title-container']}>
							<span>活动列表</span>
							<div className={styles['type-options']}>
								<span className={activityType === '全部' ? styles['active-option'] : null} onClick={() => throttledSelectType('全部')}>
									全部
								</span>
								<span className={activityType === '审核中' ? styles['active-option'] : null} onClick={() => throttledSelectType('审核中')}>
									审核中
								</span>
								<span className={activityType === '待开始' ? styles['active-option'] : null} onClick={() => throttledSelectType('待开始')}>
									待开始
								</span>
								<span className={activityType === '进行中' ? styles['active-option'] : null} onClick={() => throttledSelectType('进行中')}>
									进行中
								</span>
								<span className={activityType === '已完结' ? styles['active-option'] : null} onClick={() => throttledSelectType('已完结')}>
									已完结
								</span>
							</div>
						</div>
					</CardTitle>
					<CardDescription className={styles['card-content']}>
						{showBackTop && (
							<div className={styles['back-top']} onClick={handleBackTop}>
								⬆
							</div>
						)}
						<VirtualList
							ref={listRef}
							data={list}
							estimatedHeight={180}
							onReachBottom={throttledLoadMore}
							containerHeight="80vh"
							gap={16}
							rowKey="id"
							onScroll={handleScroll}
							suffix={allLoaded && <div style={{ paddingBottom: 16, width: '100%', textAlign: 'center' }}>{list.length ? '已加载全部' : ''}</div>}
							empty={<div style={{ paddingTop: 60, width: '100%', textAlign: 'center' }}>空空如也~</div>}
							renderItem={(item, index) => (
								<div className={styles['activity-content-box']}>
									<div className={styles['activity-content']} onMouseEnter={createRipple} onTouchStart={createRipple}>
										<PhotoProvider>
											<PhotoView src={item.pictureUrl}>
												<img className={styles['activity-img']} loading="lazy" src={item.pictureUrl} alt="活动封面" />
											</PhotoView>
											<span className={styles.plate}>{plateMap[item.plate]}</span>
										</PhotoProvider>
										<div className={styles.activity}>
											<div className={styles['activity-name']}>{item.name}</div>
											<div className={styles['activity-time']}>
												{item.beginTime ? `${formatDate(item.beginTime)}-` : ''}
												{formatDate(item.endTime) || ''}
											</div>
											<div className={styles['activity-unit']}>
												主办单位：
												{(item.organizerList || [])
													.slice(0, 3)
													.map(o => o.name)
													.join('、')}
											</div>
											<div className={styles['activity-status']}>
												<span>
													<span className={styles['activity-status-join-number']}>{item.applicantsNumber}</span>/{item.totalNumber}人
												</span>
												<span className={styles['activity-status-name']}>{item.statusName}</span>
											</div>
											<div className={styles['activity-label-container']}>
												{(item.labelList || []).slice(0, 3).map((l, index) => (
													<span key={index} className={styles['activity-label']}>
														{l.name}
													</span>
												))}
											</div>
										</div>
									</div>
									{item.status === 5 && (
										<div className={styles['sign-in-button-box']}>
											<Button onClick={() => throttledGetSignInStatus(item)}>签到开放时间</Button>
											<Button destructive onClick={() => throttledSignIn(item)}>
												强制签到
											</Button>
										</div>
									)}
								</div>
							)}
						/>
					</CardDescription>
				</CardContent>
			</Card>
		</>
	)
}
