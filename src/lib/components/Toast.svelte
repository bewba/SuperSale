<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { ToastType, ToastPosition } from '$lib/stores/toast';

	export let id: number;
	export let type: ToastType = 'success'; // 'success' | 'error'
	export let message: string = '';
	export let title: string = '';
	export let duration: number = 5000;
	export let position: ToastPosition = 'top-right';

	const dispatch = createEventDispatcher<{ remove: number }>();
	let isVisible: boolean = false;
	let element: HTMLElement;

	// Handle removal
	function handleRemove(): void {
		isVisible = false;
		setTimeout(() => {
			dispatch('remove', id);
		}, 300);
	}

	// Show toast and start duration countdown
	function onMount(): void {
		setTimeout(() => {
			isVisible = true;
		}, 50);

		if (duration > 0) {
			setTimeout(() => {
				handleRemove();
			}, duration);
		}
	}

	$: if (element) onMount();

	// Animation classes based on position
	$: animationClass = getAnimationClass(position);

	function getAnimationClass(pos: ToastPosition): string {
		const classes: Record<ToastPosition, string> = {
			'top-right': 'toast-slide-right',
			'top-left': 'toast-slide-left',
			'bottom-right': 'toast-slide-right',
			'bottom-left': 'toast-slide-left',
			'top-center': 'toast-slide-up',
			'bottom-center': 'toast-slide-down'
		};
		return classes[pos] || 'toast-slide-right';
	}

	// Styling & icons based on type
	$: bgGradient =
		type === 'success'
			? 'from-green-500 via-green-600 to-green-700'
			: type === 'error'
				? 'from-red-500 via-red-600 to-red-700'
				: type === 'warning'
					? 'from-yellow-400 via-yellow-500 to-yellow-600'
					: 'from-blue-500 via-blue-600 to-blue-700'; // info

	$: iconPath =
		type === 'success'
			? 'M5 13l4 4L19 7' // checkmark
			: type === 'error'
				? 'M6 18L18 6M6 6l12 12' // X mark
				: type === 'warning'
					? 'M12 9v2m0 4h.01M12 5a7 7 0 100 14a7 7 0 000-14z' // warning icon
					: 'M12 8v4m0 2a1 1 0 100 2a1 1 0 000-2zM12 2a10 10 0 100 20a10 10 0 000-20z'; // info icon
</script>

<div
	bind:this={element}
	class="toast-wrapper {animationClass}"
	class:toast-visible={isVisible}
	class:toast-hidden={!isVisible}
>
	<div
		class={`hover:shadow-3xl relative
             overflow-hidden rounded-2xl border
             border-[rgba(0,0,0,0.15)]
             bg-gradient-to-r ${bgGradient}
             p-6 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105`}
	>
		<!-- Shimmer Effect -->
		<div class="shimmer-overlay"></div>

		<!-- Progress Bar -->
		{#if duration > 0}
			<div class="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-2xl">
				<div
					class="progress-bar h-full bg-white/30"
					style="animation-duration: {duration}ms;"
				></div>
			</div>
		{/if}

		<div class="flex items-start space-x-4">
			<!-- Icon -->
			<div class="flex-shrink-0">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm"
				>
					<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={iconPath} />
					</svg>
				</div>
			</div>

			<!-- Content -->
			<div class="min-w-0 flex-1">
				{#if title}
					<h4 class="font-inter mb-1 text-lg font-semibold text-white">{title}</h4>
				{/if}
				<p class="font-inter text-sm leading-relaxed text-white/90">{message}</p>
			</div>

			<!-- Close Button -->
			<button
				on:click={handleRemove}
				class="flex-shrink-0 rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white focus:ring-2 focus:ring-white/50 focus:outline-none"
				aria-label="Close notification"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	</div>
</div>

<style>
	.toast-wrapper {
		transform: translateX(100%) scale(0.9);
		opacity: 0;
		transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		will-change: transform, opacity;
	}

	.toast-slide-right {
		transform: translateX(100%) scale(0.9);
	}
	.toast-slide-left {
		transform: translateX(-100%) scale(0.9);
	}
	.toast-slide-up {
		transform: translateY(-100%) scale(0.9);
	}
	.toast-slide-down {
		transform: translateY(100%) scale(0.9);
	}

	.toast-visible {
		transform: translateX(0) scale(1);
		opacity: 1;
	}
	.toast-hidden {
		transform: translateX(100%) scale(0.8);
		opacity: 0;
	}
	.toast-slide-left.toast-hidden {
		transform: translateX(-100%) scale(0.8);
	}
	.toast-slide-up.toast-hidden {
		transform: translateY(-100%) scale(0.8);
	}
	.toast-slide-down.toast-hidden {
		transform: translateY(100%) scale(0.8);
	}

	.shimmer-overlay {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		animation: shimmer 3s infinite;
	}

	.progress-bar {
		transform-origin: left;
		animation: progress linear;
	}

	@keyframes shimmer {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}
	@keyframes progress {
		0% {
			transform: scaleX(1);
		}
		100% {
			transform: scaleX(0);
		}
	}

	@media (max-width: 640px) {
		.toast-wrapper {
			margin: 0 1rem;
		}
		.toast-wrapper > div {
			min-width: 280px;
			max-width: calc(100vw - 2rem);
		}
	}
</style>
