<script lang="ts">
  import type { PostInfo } from "$lib/blog/blog";
  import Post from "$components/Post.svelte";
  export let subject: string;
  export let posts: PostInfo[];

  import { inview } from "svelte-inview";
  import type { ObserverEventDetails, Options } from "svelte-inview";
  // import { fly } from "svelte/transition";
  //* the animation here is done at the Post component level

  let isInView = new Array(posts.length).fill(false);
  const options: Options = {
    rootMargin: "5px",
    unobserveOnEnter: true
  };

  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
    const id: string = detail.node.id;
    isInView[+id] = detail.inView;
  };
</script>

<div class="mt-12 grid gap-16 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-12 content-center">
  {#each posts as post, i}
    <div use:inview={options} on:change={handleChange} id={i.toString()}>
      {#if isInView[i]}
        <Post {post} {subject} id={i} />
      {:else}
        <div
          class="w-full h-full rounded-lg bg-white dark:bg-zinc-900 min-h-[380px] md:h-[410px]"
        />
      {/if}
    </div>
  {/each}
</div>
