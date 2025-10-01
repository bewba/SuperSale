<script>
	import { goto } from '$app/navigation';

	export let items = [{ name: 'Home', href: '/', icon: '🏠' }];

	function navigate(href) {
		goto(href);
	}
</script>

<nav class="fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white shadow-md">
	<ul class="flex h-14 items-center justify-around">
		{#each items as item}
			<li>
				<button
					on:click={() => navigate(item.href)}
					class="flex cursor-pointer flex-col items-center text-gray-500 transition-colors hover:text-blue-600"
				>
					<span class="text-xl">{item.icon}</span>
					<span class="text-xs">{item.name}</span>
				</button>
			</li>
		{/each}
	</ul>
</nav>
