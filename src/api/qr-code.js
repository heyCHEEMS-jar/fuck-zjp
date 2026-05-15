/**
 *
 * @param {string} data
 * @param {string} size 128x128
 * @param {'png'|'svg'} format
 * @param {'L'|'M'|'Q'|'H'} error_correction 生成质量
 * @param {number} border 边框宽度
 */
export const createQRCode = async (params = { data, size, format, error_correction, border }) => {
	const { data, size = '128x128', format = 'png', error_correction = 'H', border = 2 } = params
	const urlParams = new URLSearchParams({ data, size, format, error_correction, border })
	try {
		const res = await fetch(`https://api.2dcode.biz/v1/create-qr-code?${urlParams}`, {
			headers: { 'Content-Type': 'application/json' }
		})
		// png返回二进制,svg返回html
		if (res.ok) {
			if (format === 'svg') {
				const resSvg = await res.text()
				return resSvg
			}
			if (format === 'png') {
				const resBlob = await res.blob()
				const imgUrl = URL.createObjectURL(resBlob)
				return imgUrl
			}
			return Promise.reject(await res.text())
		} else {
			const resText = await res.text()
			console.error(resText)
			return Promise.reject(`Code${res.status}: ${resText}`)
		}
	} catch (err) {
		console.error(err)
		return Promise.reject('连接失败')
	}
}
