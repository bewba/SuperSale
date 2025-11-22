<script lang="ts">
	// optional: if you want to receive a message from a redirect
	export let data: { message?: string };
</script>

<svelte:head>
	<title>Unauthorized — Access Denied</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 p-6">
	<div class="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="mx-auto h-16 w-16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
			/>
		</svg>

		<h1 class="mt-6 text-2xl font-semibold">Access denied</h1>
		<p class="mt-2 text-sm text-gray-600">You don’t have permission to view this page.</p>

		{#if data?.message}
			<p class="mt-4 text-sm text-gray-500">{data.message}</p>
		{/if}

		<div class="mt-6 flex justify-center gap-3">
			<a href="/" class="rounded-lg border px-4 py-2">Go home</a>
			<a href="/auth" class="rounded-lg bg-blue-600 px-4 py-2 text-white">Sign in</a>
		</div>

		<p class="mt-4 text-xs text-gray-400">If you think this is a mistake, contact support.</p>
	</div>
</div>
