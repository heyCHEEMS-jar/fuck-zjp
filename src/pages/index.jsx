import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getActivityList, getUserInfo, getUserScores } from '../api'
import styles from '../styles/pages/index.module.css'
import { Avatar, AvatarFallback, AvatarImage } from '../components/Avatar'
import { Card, CardContent, CardDescription, CardTitle } from '../components/Card'
import { formatDate, throttle } from '../utils/util'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'
import { Button } from '../components/Button'
import { VirtualList } from '../components/VirtualList'

export default function Index() {
	const [list, setList] = useState([])
	const [pageNum, setPageNum] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [total, setTotal] = useState(0)
	const [userInfo, setUserInfo] = useState({})
	const [userScores, setUserScores] = useState({})
	const loadingRef = useRef(false)
	const [allLoaded, setAllLoaded] = useState(false) // 是否已加载到底

	// 初始获取活动
	const getActivities = async () => {
		if (loadingRef.current) return
		loadingRef.current = true
		try {
			const res = await getActivityList(1, pageSize)
			const { records = [], total = 0 } = res.data || {}
			setList(records)
			setTotal(total)
			console.log(res.data)
		} finally {
			loadingRef.current = false
		}
	}

	// 加载更多活动
	const _loadMore = useCallback(async () => {
		if (allLoaded || loadingRef.current) return
		loadingRef.current = true
		try {
			const res = await getActivityList(pageNum + 1, pageSize)
			const { records = [], total = 0 } = res.data || {}
			setList(prev => {
				const newList = [...prev, ...records]
				if (newList.length === prev.length) {
					setAllLoaded(true)
				}
				return newList
			})
			setTotal(total)
			setPageNum(prev => prev + 1)
		} finally {
			loadingRef.current = false
		}
	}, [pageNum, pageSize, allLoaded])
	const throttledLoadMore = useMemo(() => throttle(_loadMore, 100, { immediate: true }), [_loadMore])

	// const handleScroll = useCallback(() => {
	// 	const { scrollTop, scrollHeight } = document.documentElement || {}
	// 	if (scrollTop === undefined || scrollHeight === undefined) return
	// 	if (!allLoaded && scrollTop + window.innerHeight >= scrollHeight - REACH_BOTTOM_THRESHOLD) {
	// 		throttledLoadMore()
	// 	}
	// }, [throttledLoadMore, allLoaded])

	// useEffect(() => {
	// 	document.addEventListener('scroll', handleScroll)
	// 	return () => {
	// 		document.removeEventListener('scroll', handleScroll)
	// 	}
	// }, [handleScroll])

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

	const ScoreList = useCallback(
		() => (
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
		),
		[userScores]
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
								<Avatar style={{ width: 80, height: 80 }}>
									<AvatarImage src={userInfo.avatar} alt="User Avatar" />
									<AvatarFallback>USER</AvatarFallback>
								</Avatar>
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
						<div className={styles.title}>活动列表</div>
					</CardTitle>
					<CardDescription className={styles['card-content']}>
						<VirtualList
							data={list}
							estimatedHeight={150}
							onReachBottom={throttledLoadMore}
							containerHeight="80vh"
							rowKey="id"
							suffix={allLoaded && <div style={{ paddingBottom: 16, width: '100%', textAlign: 'center' }}>已加载全部</div>}
							renderItem={(item, index) => (
								<div className={styles['activity-content-box']}>
									<div className={styles['activity-content']} onMouseEnter={createRipple} onTouchStart={createRipple}>
										<PhotoProvider>
											<PhotoView src={item.pictureUrl}>
												<img className={styles['activity-img']} loading="lazy" src={item.pictureUrl} alt="活动封面" />
											</PhotoView>
										</PhotoProvider>
										<div className={styles.activity}>
											<div className={styles['activity-name']}>{item.name}</div>
											<div className={styles['activity-time']}>
												{item.beginTime ? `${formatDate(item.beginTime)}-` : ''}
												{formatDate(item.endTime) ?? ''}
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
									<Button className={styles['sign-in-button']}>强制签到</Button>
								</div>
							)}
						/>
					</CardDescription>
				</CardContent>
			</Card>
		</>
	)
}
