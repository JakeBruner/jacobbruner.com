<script lang="ts">
  import type { PostInfo, BlogType } from "$lib/blog/blog";

  import PostsGrid from "$components/PostsGrid.svelte";

  /** @type {import('./$types').PageData} */
  export let data: { p: PostInfo[] };
  const subject = "Writing" as BlogType;
  // this is basically useless but makes it easier for me to copy paste for now :)
</script>

<svelte:head>
  <title>{subject}</title>
</svelte:head>

<!-- TODO add a way to have a thumbnail for some posts -->
<div class="pt-8 md:pt-16 pb-20 px-4 sm:px-6 lg:pt-20 lg:pb-28 lg:px-8">
  <div class="max-w-lg mx-auto lg:max-w-7xl">
    <div class="border-b border-b-zinc-200  dark:border-b-zinc-700 pb-6">
      <h2 class="text-3xl tracking-tight font-semibold  sm:text-4xl">Writing</h2>
    </div>

    <PostsGrid {subject} posts={data.p} />
  </div>
</div>
