<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.ico';
	import Header from '$lib/components/ui/Header.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { dev } from '$app/environment';

	// svelte-ignore export_let_unused
	export let data: {
		user: any; // or User | null
		cartItemCount: any;
	};

	if (typeof window !== 'undefined') {
		import('@vercel/analytics/sveltekit').then(({ injectAnalytics }) => {
			injectAnalytics({ mode: dev ? 'development' : 'production' });
		});
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- <Header user={data.user} cartItemCount={data.cartItemCount} /> -->

<slot />
<!-- Toast containers for different positions -->
<ToastContainer position="top-right" />
<ToastContainer position="top-left" />
<ToastContainer position="bottom-right" />
<ToastContainer position="bottom-left" />
<ToastContainer position="top-center" />
<ToastContainer position="bottom-center" />
