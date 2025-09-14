<script lang="ts">
	import { goto } from '$app/navigation';

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
						{#if errorMessage}
							<p class="text-xs text-red-600 lg:text-sm">{errorMessage}</p>
						{/if}
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

					<!-- Terms and Privacy Checkbox -->
					<div class="space-y-4">
						<label class="flex cursor-pointer items-start space-x-3">
							<input
								type="checkbox"
								bind:checked={termsAccepted}
								class="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900"
							/>
							<span class="text-xs leading-5 text-gray-600 lg:text-sm">
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
							<p class="text-xs text-red-600 lg:text-sm">
								Please accept the terms and privacy policy to continue
							</p>
						{/if}
					</div>

					<!-- Bottom Buttons -->
					<div class="space-y-4 lg:space-y-3">
						<button
							on:click={handleSignup}
							class="flex w-full cursor-pointer items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 lg:py-4 lg:text-base"
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

<!-- Terms of Service Modal -->
{#if showTerms}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
		<div class="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white">
			<div class="border-b border-gray-200 p-6">
				<div class="flex items-center justify-between">
					<h2 class="cursor-pointer text-xl font-bold text-gray-900">Terms of Service</h2>
					<button on:click={() => (showTerms = false)} class="text-gray-400 hover:text-gray-600">
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							></path>
						</svg>
					</button>
				</div>
			</div>
			<div class="max-h-96 overflow-y-auto p-6 text-sm text-gray-700">
				<p><em>Last updated: {new Date().toLocaleDateString()}</em></p>

				<h3 class="mt-4 mb-2 font-semibold">1. Acceptance of Terms</h3>
				<p>
					By accessing and using our food surplus platform, you agree to be bound by these Terms of
					Service and our Privacy Policy.
				</p>

				<h3 class="mt-4 mb-2 font-semibold">2. Platform Description</h3>
				<p>
					Our platform connects food sellers with surplus inventory to buyers, helping reduce food
					waste while providing affordable food options.
				</p>

				<h3 class="mt-4 mb-2 font-semibold">3. Seller Responsibilities</h3>
				<p>As a seller, you agree to:</p>
				<ul class="mt-2 ml-5 list-disc">
					<li>Provide accurate descriptions of food items and their condition</li>
					<li>Ensure all food items meet safety standards and are fit for consumption</li>
					<li>Comply with local food safety regulations and licensing requirements</li>
					<li>Honor pickup and delivery commitments as specified</li>
				</ul>

				<h3 class="mt-4 mb-2 font-semibold">4. Communications</h3>
				<p>
					Our platform includes a chat system for communication between buyers and sellers. All
					communications are monitored for quality and safety purposes.
				</p>

				<h3 class="mt-4 mb-2 font-semibold">5. Prohibited Items</h3>
				<p>The following items are prohibited on our platform:</p>
				<ul class="mt-2 ml-5 list-disc">
					<li>Expired or spoiled food items</li>
					<li>Items that require special licensing (alcohol, tobacco)</li>
					<li>Any items that pose health or safety risks</li>
				</ul>

				<h3 class="mt-4 mb-2 font-semibold">6. Liability</h3>
				<p>
					We act as a platform facilitator only. Sellers are responsible for food safety and
					quality. We are not liable for any health issues or damages resulting from food purchased
					through the platform.
				</p>

				<h3 class="mt-4 mb-2 font-semibold">7. Account Termination</h3>
				<p>
					We reserve the right to suspend or terminate accounts that violate these terms or engage
					in fraudulent activity.
				</p>
			</div>
		</div>
	</div>
{/if}

<!-- Privacy Policy Modal -->
{#if showPrivacy}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
		<div class="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white">
			<div class="border-b border-gray-200 p-6">
				<div class="flex items-center justify-between">
					<h2 class=" text-xl font-bold text-gray-900">Privacy Policy</h2>
					<button on:click={() => (showPrivacy = false)} class="text-gray-400 hover:text-gray-600">
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							></path>
						</svg>
					</button>
				</div>
			</div>
			<div class="max-h-96 overflow-y-auto p-6 text-sm text-gray-700">
				<p><em>Last updated: {new Date().toLocaleDateString()}</em></p>

				<h3 class="mt-4 mb-2 font-semibold">1. Information We Collect</h3>
				<p>We collect the following information:</p>
				<ul class="mt-2 ml-5 list-disc">
					<li><strong>Account Information:</strong> Store name, address, contact details</li>
					<li><strong>Communications:</strong> Messages sent through our chat system</li>
				</ul>

				<h3 class="mt-4 mb-2 font-semibold">2. How We Use Your Information</h3>
				<p>Your information is used to:</p>
				<ul class="mt-2 ml-5 list-disc">
					<li>Facilitate transactions between buyers and sellers</li>
					<li>Provide customer support and resolve disputes</li>
					<li>Improve platform functionality and user experience</li>
					<li>Ensure platform safety and prevent fraud</li>
					<li>Send important updates about your account or our services</li>
				</ul>

				<h3 class="mt-4 mb-2 font-semibold">3. Chat System and Communications</h3>
				<p>
					<strong>Important:</strong> All messages sent through our chat system are stored and monitored
					by our team for:
				</p>
				<ul class="mt-2 ml-5 list-disc">
					<li>Quality assurance and customer support</li>
					<li>Fraud prevention and safety monitoring</li>
					<li>Dispute resolution between users</li>
					<li>Platform improvement and training purposes</li>
				</ul>
				<p class="mt-2">
					Please do not share sensitive personal information (like financial details) through our
					chat system.
				</p>

				<h3 class="mt-4 mb-2 font-semibold">4. Information Sharing</h3>
				<p>We do not sell your personal information. We may share information with:</p>
				<ul class="mt-2 ml-5 list-disc">
					<li>Other platform users as necessary for transactions</li>
					<li>Service providers who help us operate the platform</li>
					<li>Law enforcement if required by legal obligations</li>
				</ul>

				<h3 class="mt-4 mb-2 font-semibold">5. Data Security</h3>
				<p>
					We implement reasonable security measures to protect your information, but no system is
					100% secure. You are responsible for maintaining the confidentiality of your account
					credentials.
				</p>

				<h3 class="mt-4 mb-2 font-semibold">6. Your Rights</h3>
				<p>You have the right to:</p>
				<ul class="mt-2 ml-5 list-disc">
					<li>Access and review your personal information</li>
					<li>Request correction of inaccurate information</li>
					<li>Delete your account and associated data</li>
					<li>Opt out of non-essential communications</li>
				</ul>

				<h3 class="mt-4 mb-2 font-semibold">7. Data Retention</h3>
				<p>
					We retain your information for as long as your account is active or as needed to provide
					services. Chat messages may be retained for up to 2 years for quality and safety purposes.
				</p>

				<h3 class="mt-4 mb-2 font-semibold">8. Contact Us</h3>
				<p>
					For questions about this Privacy Policy or your data, contact us at
					supersale.phbusiness@gmail.com
				</p>
			</div>
		</div>
	</div>
{/if}
