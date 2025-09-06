<script lang="ts">
	import { goto } from '$app/navigation';

	export let form;

	let email = '';
	let password = '';
	let isLoading = false;

	function goBack() {
		history.back();
	}
</script>

<svelte:head>
	<title>Sign Up - UnliPassion</title>
</svelte:head>


<div class="flex min-h-screen items-start justify-center bg-gray-100 px-4 pt-16 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-6">
		<!-- Header -->
		<div class="text-center">
			<!-- svelte-ignore a11y_consider_explicit_label -->
			<button
				on:click={goBack}
				class="absolute top-4 left-4 cursor-pointer text-orange-500 transition-all duration-200 hover:scale-110 hover:text-orange-600"
			>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"
					></path>
				</svg>
			</button>


			<!-- Logo -->
			<div class="mb-4">
				<img
					src="/logo.png"
					alt="UGLY.PH Logo"
					class="logo-glow mx-auto mb-2 h-auto w-full max-w-[95%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%]"
				/>
				<div class="text-sm text-gray-600 italic">for sellers</div>
			</div>

			<h2 class="mt-4 text-2xl font-bold text-gray-900">Create your account!</h2>
			<p class="mt-1 text-sm text-gray-600">
				Sign up to your Ugly.ph account to list your surplus.
			</p>

		</div>

		<!-- Login Form -->
		<form
			method="POST"
			use:enhance={({ pending }) => {
				isLoading = pending;
			}}
			class="mt-6 space-y-4"
		>
			{#if form?.error}
				<div class="text-center text-sm text-red-500">{form.error}</div>
			{/if}

			<!-- Social Login Buttons -->
			<div class="space-y-3">
				<button
					type="button"
					on:click={() => goto('/auth/login/google')}

					class="flex w-full transform cursor-pointer items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 transition-all duration-200 hover:scale-[1.02] hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
				>
					<svg class="h-5 w-5" viewBox="0 0 24 24">
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>

					Continue with Google
				</button>

				<!-- <button
					type="button"
					on:click={handleFacebookLogin}
					disabled={isLoading}
					class="flex w-full transform cursor-pointer items-center justify-center gap-3 rounded-lg border border-transparent bg-[#1877F2] px-4 py-3 text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#166FE5] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
				>
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
						/>
					</svg>
					Continue with Facebook
				</button> -->
			</div>

			<!-- Divider -->
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm">

					<span class="bg-gray-100 px-2 text-gray-500">Or sign up with email</span>
				</div>
			</div>

			<div class="space-y-4">
				<div>

					<label for="email" class="block text-sm font-medium text-gray-900"> Email Address </label>
					<input
						id="email"
						name="email"
						type="email"
						bind:value={email}
						required

						class="relative mt-1 block w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
						placeholder="juan@example.com"
					/>
				</div>

				<div>

					<label for="password" class="block text-sm font-medium text-gray-900"> Password </label>
					<input
						id="password"
						name="password"
						type="password"
						bind:value={password}
						required
						class="relative mt-1 block w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
						placeholder="Enter your password."
					/>
				</div>
			</div>

			{#if form?.error}
				<p class="text-sm text-red-500">{form.error}</p>
			{/if}

			<div>
				<button
					type="submit"
					class="group relative flex w-full transform cursor-pointer justify-center rounded-lg border border-transparent bg-orange-500 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-orange-600 hover:shadow-lg focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					Create Account
				</button>
			</div>

			<div class="text-center">
				<p class="text-sm text-gray-600">
					Already have an account?
					<a href="/auth" class="font-medium hover:underline">Sign in here</a>
				</p>
			</div>
		</form>
	</div>
</div>
