import CryptoJS from 'crypto-js'

const KEYS = {
	key1: '674e75526967644b5a34724d774b6e704c325458483476353168333372527174', // 二维码接口
	key2: '57554764556f6d4939397a53765a4b6e413849576836536174524452736a746b' // 普通接口
}

// AES解密函数
export const aesDecrypt = (encryptedText, key) => {
	const keyHex = CryptoJS.enc.Hex.parse(key)
	const decrypted = CryptoJS.AES.decrypt(encryptedText, keyHex, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	})
	return decrypted.toString(CryptoJS.enc.Utf8)
}

// 解密二维码加密字符串
export const decryptedCodeStr = encryptedText => {
	return aesDecrypt(encryptedText, KEYS.key1)
}

// AES加密函数
export const aesEncrypt = (text, key) => {
	const keyHex = CryptoJS.enc.Hex.parse(key)
	const encrypted = CryptoJS.AES.encrypt(text, keyHex, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	})
	return encrypted.toString()
}

// 生成user-sign
export const generateUserSign = timestamp => {
	return aesEncrypt(String(timestamp), KEYS.key2)
}

// 生成待转二维码图片的字符串
export const generateCodeStr = (data = { activityId, currentTime, buttonType, buttonName, type, signId, refreshTime, isHide, organizerId }) => {
	return aesEncrypt(JSON.stringify(data), KEYS.key1)
}
