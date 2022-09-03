<script lang="ts">
  export let src: string;
  export let style: string;
</script>

<div
  class="p-1 md:p-2 transition-all ease-out hover:brightness-90 hover:contrast-[90%] hover:scale-[100.5%]"
  class:style
>
  <img
    alt="gallery"
    class="block object-cover object-center w-full h-full rounded-lg shadow-sm"
    {src}
  />
</div>
