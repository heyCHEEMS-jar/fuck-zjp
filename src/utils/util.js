// 防抖
export const debounce = (func, delay, options = { immediate: false }) => {
	const { immediate } = options
	let timer = null
	const debounced = function (...args) {
		if (timer !== null) clearTimeout(timer)
		if (immediate) {
			if (timer === null) func.apply(this, args)
			timer = setTimeout(() => {
				timer = null
			}, delay)
		} else {
			timer = setTimeout(() => {
				func.apply(this, args)
				timer = null
			}, delay)
		}
	}
	debounced.cancel = () => {
		if (timer !== null) {
			clearTimeout(timer)
			timer = null
		}
	}
	return debounced
}

// 节流
export const throttle = (func, delay, options = { immediate: false }) => {
	const { immediate } = options
	let timer = null
	const throttled = function (...args) {
		if (timer !== null) return
		if (immediate) {
			func.apply(this, args)
			timer = setTimeout(() => {
				timer = null
			}, delay)
		} else {
			timer = setTimeout(() => {
				func.apply(this, args)
				timer = null
			}, delay)
		}
	}
	throttled.cancel = () => {
		if (timer !== null) {
			clearTimeout(timer)
			timer = null
		}
	}
	return throttled
}
