<script lang="ts">
  import Header from "$lib/components/ui/Header.svelte";
  import BrandInfo from "$lib/components/brand/BrandInfo.svelte";
  
  export let data: { seller: any, error?: string };
</script>

<div class="min-h-[100vh]">
  <Header />

  <div class="mt-8 px-0 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
    
    <div class="px-4 sm:px-0">
      <BrandInfo brand={data.seller} />

    </div> 
  </div>
</div>