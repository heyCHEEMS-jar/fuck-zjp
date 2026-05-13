import { useEffect, useState } from 'react'
import { getActivityList } from '../api'

export default function Index() {
	const [list, setList] = useState([])
	const [pageNum, setPageNum] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [total, setTotal] = useState(0)
	useEffect(() => {
		getActivityList().then(data => {
			const { records = [], total = 0, size = 10, current = 1 } = data || {}
			setList(records)
			setPageNum(current)
			setPageSize(size)
			setTotal(total)
		})
	}, [])
	return (
		<>
			<span className="title">已报名活动</span>
		</>
	)
}
