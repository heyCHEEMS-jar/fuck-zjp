import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { buttonVariants } from './button'
import { cn } from '../../lib/utils'

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = ({ className, ...props }) => (
	<AlertDialogPrimitive.Overlay className={cn('fixed inset-0 z-50 bg-black/50', className)} {...props} />
)

const AlertDialogContent = ({ className, ...props }) => (
	<AlertDialogPortal>
		<AlertDialogOverlay />
		<AlertDialogPrimitive.Content
			className={cn(
				'fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg',
				className
			)}
			{...props}
		/>
	</AlertDialogPortal>
)

const AlertDialogHeader = ({ className, ...props }) => <div className={cn('flex flex-col gap-2 text-center sm:text-left', className)} {...props} />

const AlertDialogFooter = ({ className, ...props }) => (
	<div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
)

const AlertDialogTitle = ({ className, ...props }) => <AlertDialogPrimitive.Title className={cn('text-lg font-semibold', className)} {...props} />

const AlertDialogDescription = ({ className, ...props }) => (
	<AlertDialogPrimitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
)

const AlertDialogAction = ({ className, ...props }) => <AlertDialogPrimitive.Action className={cn(buttonVariants(), className)} {...props} />

const AlertDialogCancel = ({ className, ...props }) => (
	<AlertDialogPrimitive.Cancel className={cn(buttonVariants({ variant: 'outline' }), className)} {...props} />
)

export {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	AlertDialogPortal,
	AlertDialogTitle,
	AlertDialogTrigger
}
