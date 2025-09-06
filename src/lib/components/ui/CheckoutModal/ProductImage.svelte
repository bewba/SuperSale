<script lang="ts">

	let { image } = $props();

</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="relative h-56 w-full flex-shrink-0 overflow-hidden bg-cover bg-center sm:h-64 md:h-90 lg:h-100"
	style="background-image: url({image})"
>
	<!-- Gradient overlay -->
	<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
</div>