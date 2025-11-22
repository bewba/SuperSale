<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { signOut } from '@auth/sveltekit/client';

	const { userStatus, isAuth } = $props<{ userStatus: string; isAuth: string }>();

	console.log(userStatus);

	const message = $derived(() => {
		let msg;
		if (userStatus === 'seller') {
			msg = 'Seller Dashboard';
		} else if (userStatus === 'admin' || userStatus === 'moderator') {
			msg = 'Admin Dashboard';
		} else if (isAuth && !userStatus) {
			msg = 'Create Store!';
		} else {
			msg = 'Want to sell your surplus?';
		}
		return msg;
	});

	let loading = $state(false);
	let scrolled = $state(false);

	// Track if page is scrolling
	onMount(() => {
		const update = () => (scrolled = scrollY > 0);
		update();
		window.addEventListener('scroll', update);
		return () => window.removeEventListener('scroll', update);
	});

	async function handleClick() {
		loading = true;
		try {
			if (userStatus === 'seller') {
				await goto('/protected/seller');
			} else if (userStatus === 'admin' || userStatus === 'moderator') {
				await goto('/protected/admin');
			} else if (isAuth) {
				await goto('/protected/seller');
			} else {
				await goto('/auth');
			}
		} finally {
			loading = false;
		}
	}
</script>

<header
	class="sticky top-0 z-50 border-b border-gray-200 bg-[#eee] px-4 shadow-sm transition-transform
	duration-300 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20"
>
	<div class="flex w-full items-center justify-between py-3">
		<!-- Left Section: Logo + Dashboard button -->
		<div class="flex items-center gap-4">
			<!-- Logo -->
			<a href="/" class="flex shrink-0 items-center transition-opacity hover:opacity-80">
				<img src="/logo.svg" alt="SuperSale-logo" class="h-10 w-auto sm:h-12 md:h-14" />
			</a>
		</div>

		<!-- Right Section: Auth controls -->
		<div class="flex items-center gap-3">
			<!-- Dashboard / Seller button -->
			<button
				class="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0060a9] px-4 py-2
				text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-all duration-200
				hover:bg-[#004d8c] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70
				sm:px-5 sm:py-2.5 sm:text-base"
				onclick={handleClick}
				disabled={loading}
			>
				{#if loading}
					<svg
						class="h-4 w-4 animate-spin text-white sm:h-5 sm:w-5"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
					</svg>
					<span>Loading...</span>
				{:else}
					{message()}
				{/if}
			</button>
			{#if isAuth}
				<button
					onclick={signOut}
					class="cursor-pointer rounded-lg bg-red-200 px-4 py-2 text-sm font-semibold
					text-red-700 transition hover:bg-red-300 active:scale-95"
				>
					Sign out
				</button>
			{/if}
		</div>
	</div>
</header>
