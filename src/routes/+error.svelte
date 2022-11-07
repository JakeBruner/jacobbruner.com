<script lang="ts">
  import { page } from "$app/stores";
</script>

<div class="mx-auto w-2/3 lg:w-1/2 pt-20 pb-20 sm:pb-[480px]">
  <h1 class="py-7 text-center text-5xl">Oops!</h1>
  <h2 class="text-2xl font-light text-grey-500 text-center">
    The page you were looking for is imaginary! Please rotate your device through 90° to get back to
    a real one!
  </h2>

  <h3
    class="text-lg font-light text-grey-300 dark:text-zinc-600 text-center pt-5 italic yesthisissanitized"
  >
    [{$page.status}] {$page?.error?.message + "!"}
  </h3>
</div>
