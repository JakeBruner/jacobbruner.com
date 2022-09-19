<script lang="ts">
  import type { PostInfo, BlogType } from "$lib/blog/blog";

  import PostsGrid from "$lib/blog/PostsGrid.svelte";

  /** @type {import('./$types').PageData} */
  export let data: { p: PostInfo[] };
  const subject = "Math" as BlogType;
  // this is basically useless but makes it easier for me to copy paste for now :)
</script>

<svelte:head>
  <title>{subject}</title>
</svelte:head>

<div class="w-full -mt-[64px] h-auto bg-zinc-800 ">
  <video class="flex px-5 pt-16 lg:w-1/2 md:w-2/3 mx-auto" autoplay playsinline autoPlay loop muted>
    <source src="videos/ComplexFourierTransform.webm" type="video/webm" />
    <source src="videos/ComplexFourierTransform2.mp4" type="video/mp4" />
    <track kind="captions" />
  </video>
</div>

<!-- TODO add a way to have a thumbnail for some posts -->
<div class="sm:pt-10 pt-8  pb-20 px-4 sm:px-6 lg:pb-28 lg:px-8">
  <div class="max-w-lg mx-auto lg:max-w-7xl">
    <div class="border-b border-b-zinc-200  dark:border-b-zinc-700 pb-6">
      <h2 class="text-3xl tracking-tight font-semibold  sm:text-4xl">{subject}</h2>
    </div>
    <PostsGrid {subject} posts={data.p} />
  </div>
</div>
