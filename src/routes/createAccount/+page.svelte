<script lang="ts">
	import { goto } from '$app/navigation';

	let storeName = '';
	let address = '';
	let pickup = true;
	let delivery = true;
	let loading = false;
	let errorMessage;

	function verifyStoreName(storeName: string) {
		if (!storeName.trim()) {
			errorMessage = 'Store name is required';
			return false;
		}

		errorMessage = '';
		return true;
	}

	async function handleSignup() {
		if (!verifyStoreName(storeName)) {
			return;
		}

		loading = true;
		try {
			const res = await fetch('/api/createAccount', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ storeName, address, pickup, delivery })
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

<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
	<div class="w-full max-w-md lg:max-w-2xl">
		<div class="rounded-2xl bg-white p-6 shadow-xl lg:p-12">
			<!-- Header -->
			<div class="mb-8 text-center lg:mb-12">
				<h1 class="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl">Store Registration</h1>
				<p class="text-gray-600 lg:text-lg">Set up your store details and delivery options</p>
			</div>

			<!-- Desktop Grid Layout -->
			<div class="lg:grid lg:grid-cols-2 lg:gap-12">
				<!-- Form Fields -->
				<div class="space-y-6 lg:space-y-8">
					<!-- Store Name Input -->
					<div class="space-y-3">
						<label class="block text-sm font-medium text-gray-700 lg:text-base">Store Name</label>
						<input
							type="text"
							bind:value={storeName}
							placeholder="Enter your store name"
							class="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:ring-0 focus:outline-none lg:py-4 lg:text-base"
						/>
					</div>

					<!-- Address Input -->
					<div class="space-y-3">
						<label class="block text-sm font-medium text-gray-700 lg:text-base">Address</label>
						<textarea
							bind:value={address}
							placeholder="Enter your store address"
							rows="3"
							class="w-full resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:ring-0 focus:outline-none lg:py-4 lg:text-base"
						></textarea>
					</div>
				</div>

				<!-- Options and Buttons -->
				<div class="mt-8 space-y-6 lg:mt-0 lg:space-y-8">
					<!-- Service Options -->
					<div class="space-y-6">
						<h3 class="text-sm font-medium text-gray-700 lg:text-base">Service Options</h3>

						<!-- Pickup Toggle -->
						<div class="flex items-center justify-between rounded-xl bg-gray-50 p-4">
							<div class="flex items-center space-x-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
									<svg
										class="h-5 w-5 text-gray-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 8h14M5 8a2 2 0 110-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H16a2 2 0 012 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2V8z"
										></path>
									</svg>
								</div>
								<div>
									<span class="text-sm font-medium text-gray-900 lg:text-base">Pickup</span>
									<p class="text-xs text-gray-500 lg:text-sm">Customers can pick up orders</p>
								</div>
							</div>
							<button
								on:click={() => (pickup = !pickup)}
								class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none lg:h-7 lg:w-12 {pickup
									? 'bg-gray-900'
									: 'bg-gray-300'}"
								role="switch"
								aria-checked={pickup}
							>
								<span
									class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out lg:h-6 lg:w-6 {pickup
										? 'translate-x-5 lg:translate-x-5'
										: 'translate-x-0'}"
								></span>
							</button>
						</div>

						<!-- Delivery Toggle -->
						<div class="flex items-center justify-between rounded-xl bg-gray-50 p-4">
							<div class="flex items-center space-x-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
									<svg
										class="h-5 w-5 text-gray-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
										></path>
									</svg>
								</div>
								<div>
									<span class="text-sm font-medium text-gray-900 lg:text-base">Delivery</span>
									<p class="text-xs text-gray-500 lg:text-sm">Deliver orders to customers</p>
								</div>
							</div>
							<button
								on:click={() => (delivery = !delivery)}
								class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none lg:h-7 lg:w-12 {delivery
									? 'bg-gray-900'
									: 'bg-gray-300'}"
								role="switch"
								aria-checked={delivery}
							>
								<span
									class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out lg:h-6 lg:w-6 {delivery
										? 'translate-x-5 lg:translate-x-5'
										: 'translate-x-0'}"
								></span>
							</button>
						</div>
					</div>

					<!-- Bottom Buttons -->
					<div class="space-y-4 lg:space-y-3">
						<button
							on:click={handleSignup}
							class="flex w-full items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 lg:py-4 lg:text-base"
							disabled={loading}
						>
							{#if loading}
								<!-- Spinner -->
								<svg
									class="h-5 w-5 animate-spin text-white"
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
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
									></path>
								</svg>
							{:else}
								Create Store Account
							{/if}
						</button>
						<button
							on:click={handleNotSeller}
							class="w-full cursor-pointer rounded-xl border-2 border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:py-4 lg:text-base"
						>
							I'm not a seller
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
