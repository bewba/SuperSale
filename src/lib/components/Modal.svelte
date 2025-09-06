<script lang="ts">
	export let title: string = 'Modal Title';
	export let message: string = 'Your message here';
	export let show: boolean = false;
	export let onConfirm: (() => void) | null = null;
	export let onCancel: (() => void) | null = null;
	export let confirmText: string = 'Confirm';
	export let cancelText: string = 'Cancel';
	export let hideCancel: boolean = false; // optional: hide cancel button
</script>

{#if show}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="animate-fade-in w-80 max-w-full rounded-xl bg-white p-6 text-center shadow-2xl">
			<h2 class="mb-4 text-xl font-bold text-gray-800">{title}</h2>
			<p class="mb-6 text-gray-600">{message}</p>
			<div class="flex justify-center space-x-4">
				{#if !hideCancel}
					<button
						on:click={() => onCancel && onCancel()}
						class="flex-1 cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-100"
					>
						{cancelText}
					</button>
				{/if}
				<button
					on:click={() => onConfirm && onConfirm()}
					class="hover:bg-unli-dark flex-1 cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-white transition"
				>
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.animate-fade-in {
		animation: fadeIn 0.2s ease-out;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
