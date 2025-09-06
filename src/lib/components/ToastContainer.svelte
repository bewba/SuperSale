<script lang="ts">
	import { toasts } from '$lib/stores/toast';
	import Toast from './Toast.svelte';
	import type { ToastPosition } from '$lib/stores/toast';

	export let position: ToastPosition = 'top-right';

	const positionClasses: Record<ToastPosition, string> = {
		'top-right': 'top-6 right-6',
		'top-left': 'top-6 left-6',
		'top-center': 'top-6 left-1/2 -translate-x-1/2',
		'bottom-right': 'bottom-6 right-6',
		'bottom-left': 'bottom-6 left-6',
		'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2'
	};

	function removeToast(event: CustomEvent<number>): void {
		const id = event.detail;
		toasts.update((current) => current.filter((toast) => toast.id !== id));
	}
</script>

<div class="toast-container fixed z-50 {positionClasses[position]}">
	{#each $toasts.filter((toast) => toast.position === position) as toast (toast.id)}
		<div class="toast-item">
			<Toast {...toast} on:remove={removeToast} />
		</div>
	{/each}
</div>

<style>
	.toast-container {
		pointer-events: none;
		max-height: calc(100vh - 3rem);
		overflow: hidden;
	}

	.toast-item {
		pointer-events: auto;
		margin-bottom: 1rem;
	}

	.toast-item:last-child {
		margin-bottom: 0;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.toast-container {
			left: 1rem !important;
			right: 1rem !important;
			transform: none !important;
			max-width: calc(100vw - 2rem);
		}
	}
</style>
