import request from '../utils/request'

const allStatus = {
	审核中: 9,
	待开始: 4,
	进行中: 5,
	已完结: 8,
	全部: ''
}

const allTypes = {
	未签到: 1,
	已签到: 2,
	未签退: 3,
	已签退: 4,
	全部: ''
}

// 登录
export const login = (data = { openId, officeOpenId, littleOpenId }) => request.post('/zjp/act-user/login', data)

// 获取活动列表
export const getActivityList = (current = 1, size = 10, status = '全部', type = '全部') =>
	request.get('/zjp/act-activity/listMyActivities', {
		params: { current, size, status: allStatus[status], type: allTypes[type], way: '1' }
	})

// 签到
export const signIn = (data = { signId, activityId, buttonType, isHide, type, buttonName, organizerId, currentTime, refreshTime, latitude, longitude }) =>
	request.post('/zjp/act-activity-sign/saveActActivitySignIn', data)

export const getUserInfo = () => request.get('/zjp/act-user/getUserInfo')
