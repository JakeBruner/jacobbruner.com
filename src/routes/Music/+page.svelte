<script lang="ts">
  import type { PostInfo, BlogType } from "$lib/blog/blog";

  import PostsGrid from "$lib/blog/PostsGrid.svelte";

  /** @type {import('./$types').PageData} */
  export let data: { p: PostInfo[] };
  const subject = "Music" as BlogType;
  // this is basically useless but makes it easier for me to copy paste for now :)
</script>

<svelte:head>
  <title>{subject}</title>
</svelte:head>

<!-- TODO maybe make the 'post loading' animation a little cleaner with the grey pulsing thing tailwind offers. this could hook right into navigating... maybe with some backend restructuring -->
<div class=" pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
  <div class="max-w-lg mx-auto lg:max-w-7xl">
    <div class="border-b border-b-zinc-200  dark:border-b-zinc-700 pb-6">
      <h2 class="text-3xl tracking-tight font-semibold  sm:text-4xl">{subject}</h2>
    </div>
    <div class="pt-10 ">
      <h2 class="pl-4 text-zinc-700 font-bold">Performances:</h2>
      <div class="max-w-md lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto mt-8 block pb-10">
        <div class="relative aspect-w-16 aspect-h-9">
          <iframe
            class="rounded-md caption"
            src="https://www.youtube-nocookie.com/embed/2Yg0VeePZXo"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
        </div>
        <p class="w-full text-center italic">Gaspard de la Nuit: 1. Ondine — Maurice Ravel</p>
      </div>
    </div>
    <h2 class="pl-4 text-zinc-700 font-bold -mb-6">Compositions and Analysis:</h2>
    <PostsGrid {subject} posts={data.p} />
  </div>
</div>

<style>
  .caption::after {
    content: "";
    position: absolute;
    bottom: 0;
    text-align: center;
  }
</style>
