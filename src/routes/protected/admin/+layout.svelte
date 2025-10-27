<!-- src/routes/admin/+layout.svelte -->
<script>
	import Sidebar from '$lib/components/Sidebar.svelte';
</script>

<div class="admin-layout">
	<Sidebar />

	<main class="main-content">
		<slot />
	</main>
</div>

<style>
	.admin-layout {
		display: flex;
		min-height: 100vh;
		background: #f1f5f9;
	}

	.main-content {
		flex: 1;
		margin-left: 260px;
		padding: 2rem;
	}

	@media (max-width: 768px) {
		.main-content {
			margin-left: 0;
			padding: 1rem;
		}
	}

	:global(body) {
		margin: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
	}
</style>
