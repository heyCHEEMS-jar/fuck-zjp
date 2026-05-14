import { useState, useMemo } from 'react'

export const VirtualList = ({
	data = [],
	estimatedHeight = 100,
	containerHeight = '70vh',
	buffer = 10,
	renderItem,
	prefix = null,
	suffix = null,
	onReachBottom,
	reachBottomThreshold = 200,
	rowKey
}) => {
	const [scrollTop, setScrollTop] = useState(0)

	const { start, end, offsetTop } = useMemo(() => {
		// 视口中的数量
		const visibleCount = Math.ceil((typeof containerHeight === 'number' ? containerHeight : window.innerHeight) / estimatedHeight)
		// 起始索引
		const startIdx = Math.max(0, Math.floor(scrollTop / estimatedHeight) - buffer)
		// 结束索引
		const endIdx = Math.min(data.length, startIdx + visibleCount + buffer)

		return { start: startIdx, end: endIdx, offsetTop: startIdx * estimatedHeight }
	}, [scrollTop, data.length, estimatedHeight, buffer, containerHeight])

	const handleScroll = e => {
		const { clientHeight, scrollTop: curScrollTop, scrollHeight } = e.currentTarget
		setScrollTop(curScrollTop)
		if (curScrollTop + clientHeight >= scrollHeight - reachBottomThreshold) {
			onReachBottom?.()
		}
	}

	const totalHeight = data.length * estimatedHeight
	const visibleList = data.slice(start, end)

	return (
		<div style={{ width: '100%', height: containerHeight, overflowY: 'auto', position: 'relative' }} onScroll={handleScroll}>
			{/* 总高度占位符 */}
			<div
				style={{
					height: totalHeight,
					width: '100%',
					position: 'absolute',
					top: 0,
					left: 0,
					pointerEvents: 'none',
					zIndex: -1
				}}
			/>

			{/* 渲染内容 */}
			<div style={{ width: '100%', position: 'absolute', top: 0, left: 0, transform: `translate3d(0, ${offsetTop}px, 0)` }}>
				{prefix}
				{visibleList.map((item, index) => (
					<div key={rowKey ? item[rowKey] : start + index}>{renderItem(item, start + index)}</div>
				))}
				{suffix}
			</div>
		</div>
	)
}
