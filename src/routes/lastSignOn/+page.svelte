<script lang="ts">
	export let data;

	// extract second last sign-in
	const signIn = data.secondLastSignIn;

	// parse created_at to a readable PH time
	let formattedSignIn = '';
	if (signIn) {
		formattedSignIn = new Date(signIn.created_at).toLocaleString('en-PH', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: true,
			timeZone: 'Asia/Manila'
		});
	}
</script>

<svelte:head>
	<title>Is this you?</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 p-6">
	<div class="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
		<!-- Yellow warning triangle -->
		<div class="mx-auto mb-6 h-20 w-20">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="h-full w-full">
				<polygon points="100,20 180,180 20,180" fill="#FBBF24" stroke="#F59E0B" stroke-width="4" />
				<rect x="95" y="70" width="10" height="60" fill="#78350F" rx="2" />
				<circle cx="100" cy="150" r="7" fill="#78350F" />
			</svg>
		</div>

		<h1 class="mt-6 text-2xl font-semibold">Your Last Sign In Was On:</h1>

		{#if formattedSignIn}
			<p class="mt-4 text-sm text-gray-500">{formattedSignIn}</p>
		{/if}

		<div class="mt-6 flex justify-center gap-3">
			<a href="/" class="rounded-lg border px-4 py-2">Go home</a>
		</div>

		<p class="mt-4 text-xs text-gray-400">If this was not you, contact support.</p>
	</div>
</div>
