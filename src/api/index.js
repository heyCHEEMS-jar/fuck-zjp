import request from '../utils/request'

const types = {
	全部: { status: '', type: '' },
	审核中: { status: 9, type: '' },
	待开始: { status: 4, type: '' },
	进行中: { status: 5, type: '' },
	已完结: { status: 8, type: '' }
}

// 登录
export const login = (data = { openId, officeOpenId, littleOpenId }) => request.post('/zjp/act-user/login', data)

// 获取活动列表
export const getActivityList = (current, size, type = '全部') => request.post('/zjp/act-activity/listMyActivities', { current, size, way: 1, ...types[type] })

// 签到
export const signIn = (data = { signId, activityId, buttonType, isHide, type, buttonName, organizerId, currentTime, refreshTime, latitude, longitude }) =>
	request.post('/zjp/act-activity-sign/saveActActivitySignIn', data)

// 获取个人信息
export const getUserInfo = () => request.get('/zjp/act-user/getUserInfo')

// 获取积分信息
export const getUserScores = () => request.get('/zjp/act-perfection-integral/getAppPerfectionIntegral')
