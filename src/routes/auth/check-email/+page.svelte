<script>
	import { goto } from '$app/navigation';
	// import Logo from '$lib/components/Logo.svelte';

	function goHome() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Check Your Email - SuperSale.ph</title>
</svelte:head>

<div class="bg-[#fcead6] flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
	<div class="relative w-full max-w-md sm:max-w-lg lg:max-w-2xl space-y-6 text-center">	
		<!-- Title -->
		<h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
			Check Your Email
		</h2>

		<!-- Message -->
		<p class="text-sm sm:text-base lg:text-lg text-gray-700 px-2 sm:px-6">
			We've sent you a confirmation link. Please check your inbox and click the link to verify your account.
		</p>

		<!-- Button -->
		<div class="pt-4">
			<button
				on:click={goHome}
				class="bg-[#0060a9] hover:bg-[#0060a1] cursor-pointer rounded-md px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-white font-semibold shadow transition-all duration-200 hover:scale-[1.05] text-lg"
			>
				Return to main page
			</button>
		</div>
	
		<!-- Support -->
		<p class="text-xs sm:text-sm px-2 sm:px-6 text-gray-700">
			Didn't receive the email?<br>
			Contact <span class="font-medium">supersale.phbusiness@gmail.com</span> for help.
		</p>
	
		<!-- Logo -->
		<img 
			src="/logo.svg" 
			alt="supersale" 
			class="mx-auto h-10 sm:h-12 lg:h-16 w-auto object-contain"
		/>
	</div>
</div>
