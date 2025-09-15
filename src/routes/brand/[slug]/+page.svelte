<script lang="ts">
	export let data: { seller: any, error?: string };
</script>

{#if data.seller}
  <h1>{data.seller.store_name}</h1>
{:else}
  <p>{data.error ?? 'Seller not found'}</p>
{/if}