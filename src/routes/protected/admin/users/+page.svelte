<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { readable, writable } from 'svelte/store';

	type User = {
		id: string;
		email: string | null;
		role: string | null;
		created_at: string | null;
	};

	const PAGE_LIMIT = 20;
	const ROLE_OPTIONS = ['moderator', 'admin', 'seller'];

	let users: User[] = [];
	let offset = 0;
	let hasMore = true;
	let loading = false;
	let updatingId: string | null = null;
	let error: string | null = null;
	let search = '';

	let sentinel: HTMLElement | null = null;
	let observer: IntersectionObserver | null = null;

	async function fetchPage(off = 0, append = true) {
		if (loading) return;
		loading = true;
		error = null;
		try {
			const params = new URLSearchParams();
			params.set('limit', String(PAGE_LIMIT));
			params.set('offset', String(off));
			if (search.trim()) params.set('search', search.trim());

			const res = await fetch(`/protected/admin/api/fetchUsers?${params.toString()}`);
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body?.error || 'Failed to fetch users');
			}
			const body = await res.json();
			const fetched: User[] = body.users ?? [];
			if (append) users = [...users, ...fetched];
			else users = fetched;

			hasMore = fetched.length >= PAGE_LIMIT;
			offset = off + fetched.length;
		} catch (err: any) {
			console.error(err);
			error = err?.message ?? 'Failed to load users';
		} finally {
			loading = false;
		}
	}

	// initial load and when search changes (debounce)
	let searchTimer: any;
	$: if (search !== undefined) {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			users = [];
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

	async function handleRoleChange(userId: string, newRole: string) {
		const prev = users.find((u) => u.id === userId)?.role ?? null;
		// optimistic
		users = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
		updatingId = userId;
		try {
			const res = await fetch('/protected/admin/api/updateUserRole', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: userId, role: newRole })
			});
			const body = await res.json();
			if (!res.ok) throw new Error(body.error || 'Failed to update role');
			// success
		} catch (err: any) {
			// revert
			users = users.map((u) => (u.id === userId ? { ...u, role: prev } : u));
			alert('Failed to update role: ' + (err?.message ?? 'Unknown error'));
		} finally {
			updatingId = null;
		}
	}
</script>

<svelte:head>
	<title>Admin — Users</title>
</svelte:head>

<main class="min-h-screen bg-gray-50 p-6">
	<div class="mx-auto max-w-6xl">
		<h1 class="mb-4 text-2xl font-semibold">Users</h1>

		<div class="mb-4 flex items-center gap-2">
			<input
				type="search"
				placeholder="Search by email..."
				bind:value={search}
				class="w-full rounded-md border px-3 py-2 md:w-1/3"
			/>
			<div class="text-sm text-gray-500">Showing {users.length} users</div>
		</div>

		<div class="overflow-hidden rounded-lg bg-white shadow">
			<table class="min-w-full">
				<thead class="bg-gray-100">
					<tr>
						<th class="px-4 py-3 text-left">Email</th>
						<th class="px-4 py-3 text-left">Created</th>
						<th class="px-4 py-3 text-left">Role</th>
					</tr>
				</thead>
				<tbody>
					{#if users.length === 0 && !loading}
						<tr>
							<td colspan="3" class="px-4 py-6 text-center text-gray-500">No users found.</td>
						</tr>
					{/if}

					{#each users as u (u.id)}
						<tr class="border-t">
							<td class="px-4 py-3">
								<div class="text-sm">{u.email ?? '—'}</div>
								<div class="text-xs text-gray-500">{u.id}</div>
							</td>
							<td class="px-4 py-3">
								<div class="text-sm">
									{u.created_at ? new Date(u.created_at).toLocaleString() : '—'}
								</div>
							</td>
							<td class="px-4 py-3">
								<select
									value={u.role ?? ''}
									on:change={(e) => handleRoleChange(u.id, (e.target as HTMLSelectElement).value)}
									disabled={updatingId === u.id}
									class="rounded border px-2 py-1"
								>
									<option value="">(no role)</option>
									{#each ROLE_OPTIONS as r}
										<option value={r} selected={u.role === r}
											>{r[0].toUpperCase() + r.slice(1)}</option
										>
									{/each}
								</select>
								{#if updatingId === u.id}
									<span class="ml-2 text-sm">Saving…</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<div class="flex items-center justify-between p-4">
				<div class="text-sm text-gray-600">
					{#if loading}Loading...{:else if hasMore}Scroll to load more{:else}All users loaded{/if}
				</div>
			</div>

			<div bind:this={sentinel} style="height:1px;"></div>
		</div>

		{#if error}
			<div class="mt-4 text-red-600">{error}</div>
		{/if}
	</div>
</main>

<style>
	/* small helper if you want */
</style>
