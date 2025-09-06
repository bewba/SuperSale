import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
	| 'top-right'
	| 'top-left'
	| 'top-center'
	| 'bottom-right'
	| 'bottom-left'
	| 'bottom-center';

export interface Toast {
	id: number;
	type: ToastType;
	message: string;
	title?: string;
	duration: number;
	position: ToastPosition;
}

export interface ToastOptions {
	title?: string;
	duration?: number;
	position?: ToastPosition;
}

export const toasts = writable<Toast[]>([]);

let toastId = 0;

export const addToast = (
	toast: { message: string } & Partial<Omit<Toast, 'id' | 'message'>>
): number => {
	const id = toastId++;
	console.log('Toast input:', toast);
	const newToast: Toast = {
		...toast, // user-supplied options first
		id,
		type: toast.type ?? 'success', // fallback only if undefined
		duration: toast.duration ?? 5000,
		position: toast.position ?? 'top-right'
	};

	toasts.update((current: Toast[]) => [...current, newToast]);

	if (newToast.duration > 0) {
		setTimeout(() => {
			removeToast(id);
		}, newToast.duration);
	}

	return id;
};

export const removeToast = (id: number): void => {
	toasts.update((current: Toast[]) => current.filter((toast) => toast.id !== id));
};

export const clearAllToasts = (): void => {
	toasts.set([]);
};

// Convenience functions with proper TypeScript
export const toastSuccess = (message: string, options: ToastOptions = {}): number =>
	addToast({ message, ...options, type: 'success' });

export const toastError = (message: string, options: ToastOptions = {}): number =>
	addToast({ message, ...options, type: 'error' });

export const toastWarning = (message: string, options: ToastOptions = {}): number =>
	addToast({ message, ...options, type: 'warning' });

export const toastInfo = (message: string, options: ToastOptions = {}): number =>
	addToast({ message, ...options, type: 'info' });
