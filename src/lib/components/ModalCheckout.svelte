<script lang="ts">
	export let title: string = '';
	export let show: boolean = false;
	export let onConfirm:
		| ((data: {
				name: string;
				contactNumber: string;
				email: string;
				quantity: number;
				deal: any;
				total: number;
				offer: number;
		  }) => void)
		| null = null;
	export let onCancel: (() => void) | null = null;
	export let confirmText: string = 'Confirm';
	export let cancelText: string = 'Cancel';
	export let hideCancel: boolean = false;
	export let price: number = 0;
	export let deal: any = null;

	let name = '';
	let contactNumber = '';
	let email = '';
	let quantity: number | null = null;
	let offer: number | null = null;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	$: total = quantity && offer > 0 ? quantity * offer : 0;
	$: isEmailValid = emailRegex.test(email.trim());
	$: isFormValid =
		name.trim() !== '' &&
		contactNumber.trim() !== '' &&
		isEmailValid &&
		quantity !== null &&
		quantity > 0 &&
		offer !== null &&
		offer > 0;

	function confirm() {
		console.log(
			'helloooooo nigga',
			name,
			contactNumber,
			email,
			quantity,
			deal,
			deal.title,
			offer,
			'byeee nigga'
		);
		if (onConfirm && isFormValid) {
			onConfirm({ name, contactNumber, email, quantity, deal, offer });
			resetInputs();
		}
	}

	function handleCancel() {
		if (onCancel) onCancel();
		resetInputs();
	}

	function resetInputs() {
		name = '';
		contactNumber = '';
		email = '';
		quantity = null;
		offer = null;
	}
</script>

<!-- 
	Removed the following for div:
	on:click={handleCancel}
	role="button"
	tabindex="0"
	on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCancel()}
-->
{#if show}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
	>
		<div
			class="animate-fade-in relative w-[24rem] max-w-full rounded-2xl bg-white p-6 shadow-2xl"
			on:click|stopPropagation
			role="presentation"
		>
			<!-- Header -->
			<div class="mb-5 flex items-center justify-between">
				<h2 class="text-xl font-bold text-gray-800">
					{title}: <span class="">{deal?.title ?? 'Unknown Item'}</span>
				</h2>
				<button
					class="cursor-pointer rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
					on:click={handleCancel}>✕</button
				>
			</div>

			<!-- Deal Info -->
			<div class="mb-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 shadow-inner">
				<p class="mt-1 text-sm text-gray-600">
					<strong>Remaining qty:</strong>
					{deal?.quantity ?? 0}
				</p>
				<p class="text-sm text-gray-600">
					<strong>Discounted price offer:</strong> ₱{deal?.discount_price ?? 0} per/qty
				</p>
				<p class="text-sm text-gray-600">
					<strong>Your Offer:</strong>
					{offer ? `₱${offer}` : 'Not set'}
				</p>
			</div>

			<!-- Form -->
			<div class="mb-6 flex flex-col gap-4">
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">Name</label>
					<input
						bind:value={name}
						type="text"
						placeholder="Your name"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
					/>
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">Email</label>
					<input
						bind:value={email}
						type="text"
						placeholder="example@email.com"
						class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-1
		{isEmailValid || email === ''
							? 'border-gray-300 focus:border-red-500 focus:ring-red-500'
							: 'border-red-500 focus:border-red-500 focus:ring-red-500'}"
					/>
					{#if email !== '' && !isEmailValid}
						<p class="mt-1 text-xs text-red-500">Please enter a valid email address</p>
					{/if}
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">Contact Number</label>
					<input
						bind:value={contactNumber}
						type="text"
						placeholder="09XXXXXXXXX"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
						<input
							bind:value={quantity}
							type="number"
							min="1"
							placeholder="Enter quantity"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Your Offer</label>
						<input
							bind:value={offer}
							type="number"
							min="1"
							placeholder="Enter your offer"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						/>
					</div>
				</div>
			</div>

			<!-- Total -->
			<div
				class="mb-6 flex items-center justify-between rounded-lg bg-gray-100 px-4 py-3 shadow-inner"
			>
				<span class="text-sm font-medium text-gray-700">Total</span>
				<span class="text-lg font-bold text-red-600">₱{total}</span>
			</div>

			<!-- Actions -->
			<div class="flex justify-end gap-3">
				{#if !hideCancel}
					<button
						on:click={handleCancel}
						class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
					>
						{cancelText}
					</button>
				{/if}
				<button
					on:click={confirm}
					class="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition-colors"
					class:bg-red-500={isFormValid}
					class:hover:bg-red-600={isFormValid}
					class:bg-gray-300={!isFormValid}
					class:text-gray-600={!isFormValid}
					disabled={!isFormValid}
				>
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}
