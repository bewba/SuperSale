<!-- src/lib/components/Sidebar.svelte -->
<script lang="ts">
	import { page } from '$app/stores';

	export let role: string;

	let navItems = [];

	if (role === 'admin') {
		navItems = [
			{
				href: '/protected/admin/users',
				label: 'Users',
				icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
			},
			{
				href: '/protected/admin/logs',
				label: 'Logs',
				icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
			}
		];
	} else {
		navItems = [
			{
				href: '/protected/admin/users',
				label: 'Users',
				icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
			}
		];
	}

	$: currentPath = $page.url.pathname;
</script>

<aside class="fixed top-0 left-0 flex h-screen w-64 flex-col bg-slate-800 text-slate-200 shadow-lg">
	<div class="border-b border-slate-700 p-8">
		<h1 class="text-2xl font-bold text-slate-50">Admin Panel</h1>
	</div>

	<nav class="flex-1 overflow-y-auto py-4">
		{#each navItems as item}
			<a
				href={item.href}
				class="flex items-center gap-3 border-l-3 px-6 py-3.5 text-slate-300 transition-all hover:bg-slate-700 hover:text-slate-50 {currentPath ===
				item.href
					? 'border-l-blue-400 bg-slate-700 text-blue-400'
					: 'border-l-transparent'}"
			>
				<svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
				</svg>
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>
</aside>
