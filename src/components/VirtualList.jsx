import { useState, useMemo, forwardRef, useRef, useCallback, useEffect } from 'react'

export const VirtualList = forwardRef(
	(
		{
			data = [],
			estimatedHeight = 100,
			containerHeight = '70vh',
			gap = 0,
			buffer = 10,
			renderItem,
			prefix = null,
			suffix = null,
			empty = null,
			onReachBottom,
			reachBottomThreshold = 200,
			rowKey,
			onScroll
		},
		ref
	) => {
		const [scrollTop, setScrollTop] = useState(0)
		const positionsRef = useRef([]) // 每项的top值, 最后一项为总内容高度
		const heightsRef = useRef([]) // 每项的高度

		// 更新每项top和height
		const updatePos = useCallback(() => {
			let curTop = 0
			const pos = []
			for (let i = 0; i < data.length; i++) {
				pos.push(curTop)
				curTop += heightsRef.current[i] ?? estimatedHeight
			}
			pos.push(curTop) // 最后一项为总高度
			positionsRef.current = pos
		}, [data.length, estimatedHeight])

		// 计算当前视口起始索引
		const findStartIdx = useCallback(curScrollTop => {
			const pos = positionsRef.current
			let l = 0
			let r = pos.length - 2 // 最后一个为总高度
			while (l <= r) {
				const mid = Math.floor(l + (r - l) / 2)
				if (pos[mid] <= curScrollTop && pos[mid + 1] > curScrollTop) {
					return mid
				}
				if (pos[mid] < curScrollTop) l = mid + 1
				else r = mid - 1
			}
			return 0
		}, [])

		const itemRefCallback = index => node => {
			if (!node) return
			const height = node.getBoundingClientRect().height ?? estimatedHeight
			if (!heightsRef.current[index] || heightsRef.current[index] !== height) {
				heightsRef.current[index] = height
				updatePos()
			}
		}

		// 计算当前视口+缓冲区有几项
		const { start, end, offsetTop } = useMemo(() => {
			// 确保positionsRef已初始化
			if (positionsRef.current.length !== data.length + 1) {
				updatePos()
			}
			const startIdx = Math.max(0, findStartIdx(scrollTop) - buffer)
			const pos = positionsRef.current
			// 当前视口或总容器高度
			const curContainerHeight = typeof containerHeight === 'number' ? containerHeight : window.innerHeight
			let endIdx = startIdx
			// top小于视口高度+滚过的总高度则可见,找到第一个不可见的项作为结束索引
			while (endIdx < data.length && pos[endIdx] < curContainerHeight + scrollTop) {
				endIdx++
			}
			return { start: startIdx, end: endIdx, offsetTop: pos[startIdx] || 0 }
		}, [scrollTop, data.length, buffer, containerHeight, findStartIdx, updatePos])

		const handleScroll = e => {
			const { clientHeight, scrollTop: curScrollTop, scrollHeight } = e.currentTarget
			setScrollTop(curScrollTop)
			if (curScrollTop + clientHeight >= scrollHeight - reachBottomThreshold) {
				onReachBottom?.()
			}
			onScroll(e) // 回调
		}

		const totalHeight = positionsRef.current[positionsRef.current.length - 1] // 内容总高度
		const visibleList = data.slice(start, end) // 渲染内容列表

		return (
			<div ref={ref} style={{ width: '100%', height: containerHeight, overflowY: 'auto', position: 'relative' }} onScroll={handleScroll}>
				{/* 总高度占位符 */}
				<div style={{ height: totalHeight, width: '100%', pointerEvents: 'none' }} />

				{/* 渲染内容 */}
				<div style={{ width: '100%', position: 'absolute', top: 0, left: 0, transform: `translate3d(0, ${offsetTop}px, 0)` }}>
					{prefix}
					{visibleList.map((item, index) => {
						const realIndex = start + index
						return (
							<div ref={itemRefCallback(realIndex)} key={rowKey ? item[rowKey] : realIndex} style={{ width: '100%', paddingBottom: gap, boxSizing: 'border-box' }}>
								{renderItem(item, realIndex)}
							</div>
						)
					})}
					{suffix}
				</div>

				{/* 空提示 */}
				{!data.length && empty}
			</div>
		)
	}
)
