<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<section 
  class="relative flex items-center justify-center min-h-[100vh] sm:min-h-[90vh] md:min-h-[100vh] lg:h-[100vh] bg-cover bg-center"
  style="background-image: url('/salcedo.jpg');"
>
  <!-- Overlay -->
  <div class="absolute inset-0 bg-black/60"></div>

  <!-- Hero content -->
  <div class="relative container mx-auto px-4 sm:px-6 text-center text-white flex flex-col items-center">
    <!-- Logo -->
    <img 
      src="/logo.svg" 
      alt="SuperSale-Logo" 
      class="mx-auto w-full max-w-[95%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] h-auto logo-glow"
    />

    <!-- Tagline -->
    <p class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 
              drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] leading-snug">
        The smart way to clear and buy surplus.
    </p>
    
    <!-- Subtext -->
    <p 
      class="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl 
          max-w-4xl mx-auto leading-relaxed text-white
          drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] font-bold"
    >
      Find food deals from your favourite stores at 
      <span 
        class="font-extrabold text-red-500 drop-shadow-[0_4px_10px_rgba(255,255,255,1)]"
      >
        SUPERSALE
      </span> 
      prices!
    </p>

    
    <!-- <p class="text-xl sm:text-2xl md:text-3xl lg:text-4xl opacity-95 max-w-4xl mx-auto 
              drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] leading-relaxed">
      Find food deals from your favourite stores at AMAZING prices.
      <span 
        class="block mt-2 font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
         bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent
         drop-shadow-[0_6px_10px_rgba(0,0,0,1)]"
      >
        20 to 90% off!
      </span>
    </p> -->
   
    <!-- Buttons -->
    <div class="mt-8 flex flex-col sm:flex-row gap-4">
      <a
        class="cursor-pointer px-8 py-3 rounded-2xl font-semibold text-lg 
        bg-gradient-to-r from-orange-400 to-orange-600 text-white 
        shadow-lg hover:scale-105 hover:shadow-orange-500/50 
        transition-all duration-300"
        href="#hotdeals"
      >
        Find super food deals!
      </a>
      
      <button
        class="cursor-pointer px-8 py-3 rounded-2xl font-semibold text-lg bg-white/90 text-black 
               shadow-lg hover:bg-white hover:scale-105 hover:shadow-white/50 transition-all duration-300"
        on:click={() => goto('/protected/seller')}
      >
        Want to sell your surplus?
      </button>
    </div>
  </div>
</section>

<style>
  .logo-glow {
    filter:
      drop-shadow(0 0 26px #fcead6)
      drop-shadow(0 0 34px #fcead6);
  }

</style>
