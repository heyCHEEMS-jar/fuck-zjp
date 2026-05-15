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

// 获取个人信息
export const getUserInfo = () => request.get('/zjp/act-user/getUserInfo')

// 获取积分信息
export const getUserScores = () => request.get('/zjp/act-perfection-integral/getAppPerfectionIntegral')

// 签到/签退
export const signIn = (data = { currentTime, signId, activityId, buttonType, type, buttonName, refreshTime, latitude, longitude, organizerId, isHide }) =>
	request.post('/zjp/act-activity-sign/saveActActivitySignIn', data)

// 获取管理端签到/签退详情
export const getAdminSignInfo = (params = { activityId, signId, isCheckOrg }) => request.get('/zjp/act-activity-sign-button/getSignButtonDetails', { params })

// 获取签到按钮状态
export const getSignInButton = activityId => request.get('/zjp/act-activity-sign-button/getSignButtonByActivityId', { params: { activityId } })

// 获取签到开放时间
export const getSignInStatus = (data = { type, activityId }) => request.post('/zjp/act-activity-sign/listSignButtons', data)
