<script>
	import { goto } from '$app/navigation';
	// import Logo from '$lib/components/Logo.svelte';

	function goHome() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Check Your Email - UnliPassion</title>
</svelte:head>

<div class="bg-unli-light flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
	<div class="relative w-full max-w-md space-y-6 text-center">
		<!-- Large Centered Logo
		<div class="flex justify-center hover:scale-[1.02]">
			<Logo size="xl" showText={false} />
		</div>   -->

		<!-- Title -->
		<h2 class="text-unli-deep text-3xl font-bold">Check Your Email</h2>

		<!-- Message -->
		<p class="text-unli-forest">
			We’ve sent you a confirmation link. Please check your inbox and click the link to verify your
			account.
		</p>

		<!-- Button -->
		<div class="pt-4">
			<button
				on:click={goHome}
				class="bg-unli-forest hover:bg-unli-dark cursor-pointer rounded-md px-6 py-2 text-white shadow transition-all duration-200 hover:scale-[1.02]"
			>
				Go Back Home
			</button>
		</div>
	</div>
</div>
