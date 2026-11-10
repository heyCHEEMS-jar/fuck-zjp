import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from './ui/alert-dialog'
import { buttonVariants } from './ui/button'

const AlertContext = createContext(null)

export function AlertProvider({ children }) {
	const [dialog, setDialog] = useState(null)
	const resolverRef = useRef(null)

	const openDialog = useCallback(options => {
		resolverRef.current?.(false)
		return new Promise(resolve => {
			resolverRef.current = resolve
			setDialog(options)
		})
	}, [])

	const showAlert = useCallback(
		(description, { title = '提示', confirmText = '知道了', variant = 'default' } = {}) =>
			openDialog({ type: 'alert', title, description, confirmText, variant }),
		[openDialog]
	)

	const showConfirm = useCallback(
		(description, { title = '请确认', confirmText = '确认', cancelText = '取消', variant = 'default' } = {}) =>
			openDialog({ type: 'confirm', title, description, confirmText, cancelText, variant }),
		[openDialog]
	)

	const closeDialog = useCallback(result => {
		const resolve = resolverRef.current
		resolverRef.current = null
		setDialog(null)
		resolve?.(result)
	}, [])

	useEffect(() => () => resolverRef.current?.(false), [])

	const value = useMemo(() => ({ showAlert, showConfirm }), [showAlert, showConfirm])

	return (
		<AlertContext.Provider value={value}>
			{children}
			<AlertDialog open={Boolean(dialog)} onOpenChange={open => !open && closeDialog(false)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{dialog?.title}</AlertDialogTitle>
						<AlertDialogDescription className="whitespace-pre-line">{dialog?.description}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						{dialog?.type === 'confirm' && <AlertDialogCancel onClick={() => closeDialog(false)}>{dialog.cancelText}</AlertDialogCancel>}
						<AlertDialogAction
							className={dialog?.variant === 'destructive' ? buttonVariants({ variant: 'destructive' }) : undefined}
							onClick={() => closeDialog(true)}
						>
							{dialog?.confirmText}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</AlertContext.Provider>
	)
}

export const useAlert = () => {
	const context = useContext(AlertContext)
	if (!context) throw new Error('useAlert 必须在 AlertProvider 内使用')
	return context
}
