import { cn } from '../../lib/utils'

const Separator = ({ className, orientation = 'horizontal', decorative = true, ...props }) => (
	<div
		role={decorative ? 'none' : 'separator'}
		aria-orientation={decorative ? undefined : orientation}
		className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
		{...props}
	/>
)

export { Separator }
