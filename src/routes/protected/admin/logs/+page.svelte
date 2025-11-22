<script lang="ts">
	import { onMount } from 'svelte';
	import { toastError } from '$lib/stores/toast';

	type Log = {
		id: string;
		user_id: string | null;
		user_email: string | null;
		message: string;
		created_at: string;
	};

	const PAGE_LIMIT = 50;

	export let data;
	const CURRENT_USER_ROLE = data.role;

	let logs: Log[] = [];
	let offset = 0;
	let hasMore = true;
	let loading = false;
	let error: string | null = null;
	let search = '';

	let sentinel: HTMLElement | null = null;
	let observer: IntersectionObserver | null = null;

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			timeZone: 'Asia/Manila'
		}).format(date);
	}

	function getLogType(message: string): { type: string; color: string } {
		const lower = message.toLowerCase();
		if (lower.includes('failure') || lower.includes('error') || lower.includes('failed')) {
			return { type: 'error', color: 'text-red-600 bg-red-50' };
		}
		if (lower.includes('success') || lower.includes('successful')) {
			return { type: 'success', color: 'text-green-600 bg-green-50' };
		}
		if (lower.includes('access control') || lower.includes('unauthorized')) {
			return { type: 'warning', color: 'text-orange-600 bg-orange-50' };
		}
		if (lower.includes('validation')) {
			return { type: 'validation', color: 'text-yellow-600 bg-yellow-50' };
		}
		return { type: 'info', color: 'text-blue-600 bg-blue-50' };
	}

	async function fetchPage(off = 0, append = true) {
		if (loading) return;
		loading = true;
		error = null;
		try {
			const params = new URLSearchParams();
			params.set('limit', String(PAGE_LIMIT));
			params.set('offset', String(off));
			if (search.trim()) params.set('search', search.trim());

			const res = await fetch(`/protected/admin/api/logs?${params.toString()}`);

			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body?.error || 'Failed to fetch logs');
			}
			const body = await res.json();
			const fetched: Log[] = body.logs ?? [];
			if (append) logs = [...logs, ...fetched];
			else logs = fetched;

			hasMore = fetched.length >= PAGE_LIMIT;
			offset = off + fetched.length;
		} catch (err: any) {
			console.error(err);
			error = err?.message ?? 'Failed to load logs';
			toastError(error || 'Failed to load logs');
		} finally {
			loading = false;
		}
	}

	// initial load and when search changes (debounce)
	let searchTimer: any;
	let previousSearch = '';
	$: if (search !== undefined && search !== previousSearch) {
		previousSearch = search;
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			logs = [];
			offset = 0;
			hasMore = true;
			fetchPage(0, false);
		}, 300);
	}

	onMount(() => {
		fetchPage(0, false);

		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting && hasMore && !loading) {
						fetchPage(offset, true);
					}
				}
			},
			{ root: null, rootMargin: '200px', threshold: 0.1 }
		);

		if (sentinel) observer.observe(sentinel);

		return () => {
			observer?.disconnect();
			clearTimeout(searchTimer);
		};
	});
</script>

<svelte:head>
	<title>Admin — Logs</title>
</svelte:head>

<div class="mx-auto max-w-7xl">
	<h1 class="mb-4 text-2xl font-semibold">System Logs</h1>

	<div class="mb-4 flex items-center gap-2">
		<input
			type="search"
			placeholder="Search by user email or message..."
			bind:value={search}
			class="w-full rounded-md border px-3 py-2 md:w-1/3"
		/>
		<div class="text-sm text-gray-500">Showing {logs.length} logs</div>
	</div>

	<div class="overflow-hidden rounded-lg bg-white shadow">
		<div class="overflow-x-auto">
			<table class="min-w-full">
				<thead class="bg-gray-100">
					<tr>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase"
							>Timestamp</th
						>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">User</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Message</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each logs as log (log.id)}
						{@const logType = getLogType(log.message)}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-3 text-sm whitespace-nowrap text-gray-600">
								{formatDate(log.created_at)}
							</td>
							<td class="px-4 py-3 text-sm">
								{#if log.user_email}
									<div class="font-medium text-gray-900">{log.user_email}</div>
									<div class="text-xs text-gray-500">{log.user_id}</div>
								{:else}
									<span class="text-gray-400 italic">System</span>
								{/if}
							</td>
							<td class="px-4 py-3">
								<span class="inline-block rounded px-2 py-1 text-xs font-medium {logType.color}">
									{log.message}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="flex items-center justify-between border-t bg-gray-50 px-4 py-3">
			<div class="text-sm text-gray-600">
				{#if loading}
					Loading...
				{:else if hasMore}
					Scroll to load more
				{:else}
					All logs loaded
				{/if}
			</div>
		</div>

		<div bind:this={sentinel} style="height:1px;"></div>
	</div>

	{#if error}
		<div class="mt-4 rounded-md bg-red-50 p-4 text-red-600">{error}</div>
	{/if}
</div>

<style>
	/* Additional styles if needed */
</style>
