<script lang="ts">
	import { goto } from '$app/navigation';
	import { HandHelping, Truck } from '@lucide/svelte';

	let storeName = '';
	let address = '';
	let pickup = true;
	let delivery = true;
	let termsAccepted = false;
	let attemptedSubmit = false;
	let loading = false;
	let errorMessage;
	let showTerms = false;
	let showPrivacy = false;

	function verifyStoreName(storeName: string) {
		if (!storeName.trim()) {
			errorMessage = 'Store name is required';
			return false;
		}

		errorMessage = '';
		return true;
	}

	async function handleSignup() {
		attemptedSubmit = true;

		if (!termsAccepted) {
			return;
		}

		if (!verifyStoreName(storeName)) {
			return;
		}

		loading = true;
		try {
			const res = await fetch('/api/createAccount', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ storeName, address, pickup, delivery, termsAccepted })
			});

			const data = await res.json();

			if (data.success) {
				goto('/protected/seller');
			} else {
				alert(data.error || 'Failed to register store');
			}
		} catch (err) {
			console.error(err);
			alert('Something went wrong');
		} finally {
			loading = false;
		}
	}

	function handleNotSeller() {
		goto('/');
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
	<div class="w-full max-w-md sm:max-w-lg lg:max-w-2xl">
		<div class="rounded-2xl bg-white p-6 shadow-xl sm:p-8 lg:p-12">
			<!-- Header -->
			<div class="mb-8 text-center sm:mb-10 lg:mb-12">
				<h1 class="mb-2 text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">Store Registration</h1>
				<p class="text-gray-600 text-sm sm:text-base lg:text-lg">Set up your store details and delivery options</p>
			</div>

			<!-- Responsive Grid Layout -->
			<div class="grid sm:gap-8 grid-cols-1 lg:gap-10">
				<!-- Form Fields -->
				<div class="space-y-6 sm:space-y-7 lg:space-y-8">
					<!-- Store Name Input -->
					<div class="space-y-2 sm:space-y-3">
						<label for="" class="block text-sm font-medium text-gray-700 sm:text-base">Store Name</label>
						<input
							type="text"
							bind:value={storeName}
							placeholder="Enter your store name"
							class="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:ring-0 focus:outline-none sm:px-4 sm:py-3 sm:text-base lg:py-4"
						/>
						{#if errorMessage}
							<p class="text-xs text-red-600 sm:text-sm">{errorMessage}</p>
						{/if}
					</div>

					<!-- Address Input -->
					<div class="space-y-2 sm:space-y-3">
						<label for="" class="block text-sm font-medium text-gray-700 sm:text-base">Address</label>
						<textarea
							bind:value={address}
							placeholder="Enter your store address"
							rows="3"
							class="w-full resize-none rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:ring-0 focus:outline-none sm:px-4 sm:py-3 sm:text-base lg:py-4"
						></textarea>
					</div>
				</div>

				<!-- Options and Buttons -->
				<div class="mt-8 space-y-6 sm:mt-0 sm:space-y-7 lg:space-y-8">
					<!-- Service Options -->
					<div class="space-y-5 sm:space-y-6">
						<h3 class="text-sm font-medium text-gray-700 sm:text-base">Service Options</h3>

						<!-- Pickup Toggle -->
						<div class="flex items-center justify-between rounded-xl bg-gray-50 p-3 sm:p-4">
							<div class="flex items-center space-x-3">
								<div class="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gray-200">
									<svg class="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<HandHelping />	
									</svg>
								</div>
								<div>
									<span class="text-sm font-medium text-gray-900 sm:text-base">Pickup</span>
									<p class="text-xs text-gray-500 sm:text-sm">Customers can pick up orders</p>
								</div>
							</div>
							<button
								on:click={() => (pickup = !pickup)}
								class="relative inline-flex h-5 w-10 sm:h-6 sm:w-11 lg:h-7 lg:w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {pickup
									? 'bg-[#0060a9]'
									: 'bg-gray-300'}"
								role="switch"
								aria-checked={pickup}
								aria-label="pickup"
							>
								<span
									class="pointer-events-none inline-block h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out {pickup
										? 'translate-x-5 sm:translate-x-5'
										: 'translate-x-0'}"
								></span>
							</button>
						</div>

						<!-- Delivery Toggle -->
						<div class="flex items-center justify-between rounded-xl bg-gray-50 p-3 sm:p-4">
							<div class="flex items-center space-x-3">
								<div class="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gray-200">
									<svg class="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<Truck />
									</svg>
								</div>
								<div>
									<span class="text-sm font-medium text-gray-900 sm:text-base">Delivery</span>
									<p class="text-xs text-gray-500 sm:text-sm">Deliver orders to customers</p>
								</div>
							</div>
							<button
								on:click={() => (delivery = !delivery)}
								class="relative inline-flex h-5 w-10 sm:h-6 sm:w-11 lg:h-7 lg:w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {delivery
									? 'bg-[#0060a9]'
									: 'bg-gray-300'}"
								role="switch"
								aria-checked={delivery}
								aria-label="delivery"
							>
								<span
									class="pointer-events-none inline-block h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out {delivery
										? 'translate-x-5 sm:translate-x-5'
										: 'translate-x-0'}"
								></span>
							</button>
						</div>
					</div>

					<!-- Terms and Privacy Checkbox -->
					<div class="space-y-3 sm:space-y-4">
						<label class="flex cursor-pointer items-start space-x-3">
							<input
								type="checkbox"
								bind:checked={termsAccepted}
								class="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900"
							/>
							<span class="text-xs leading-5 text-gray-600 sm:text-sm">
								I agree to the
								<button
									type="button"
									on:click={() => (showTerms = true)}
									class="cursor-pointer text-gray-900 underline hover:text-gray-700"
								>
									Terms of Service
								</button>
								and
								<button
									type="button"
									on:click={() => (showPrivacy = true)}
									class="cursor-pointer text-gray-900 underline hover:text-gray-700"
								>
									Privacy Policy
								</button>
							</span>
						</label>
						{#if !termsAccepted && attemptedSubmit}
							<p class="text-xs text-red-600 sm:text-sm">
								Please accept the terms and privacy policy to continue
							</p>
						{/if}
					</div>

					<!-- Bottom Buttons -->
					<div class="space-y-3 sm:space-y-4">
						<button
							on:click={handleSignup}
							class="flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#0060a9] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0060a1] disabled:cursor-not-allowed disabled:bg-gray-400 sm:px-6 sm:py-3 sm:text-base lg:py-4"
							disabled={loading}
						>
							{#if loading}
								<svg class="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
								</svg>
							{:else}
								Create Store Account
							{/if}
						</button>
						<button
							on:click={handleNotSeller}
							class="w-full cursor-pointer rounded-xl border-2 border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:px-6 sm:py-3 sm:text-base lg:py-4"
						>
							I'm not a seller
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
