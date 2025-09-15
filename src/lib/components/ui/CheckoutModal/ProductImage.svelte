<script lang="ts">

	let { image, className = "" } = $props();

</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="relative w-full flex-shrink-0 overflow-hidden bg-cover bg-center {className}"
  class:h-56={!className.includes('h-')}
  class:sm:h-64={!className.includes('h-')}
  class:md:h-90={!className.includes('h-')}
  class:lg:h-100={!className.includes('h-')}
  style="background-image: url({image})"
>
  <!-- Gradient overlay -->
  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
</div>