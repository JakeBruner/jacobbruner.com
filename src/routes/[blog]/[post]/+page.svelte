<script lang="ts">
  import type { FullPost, BlogType } from "$lib/blog/blog";
  import { BlogTagColors } from "$lib/blog/blog";
  // import "/src/app.css"; // doesn't do this by default
  export let data: [FullPost, BlogType];
  const post: FullPost = data[0];
  // i love monads

  const subject = data[1];
</script>

<svelte:head>
  <title>{subject} | {post.title}</title>
</svelte:head>

<article class="md:container md:mx-auto xl:px-40 lg:px-28 mx-auto py-6 md:py-16 px-4 sm:px-6 ">
  <!-- <div
    class="fixed top-0 left-0 right-0 z-1 bg-white px-2 sm:px-4 py-3.5 h-[76px]"
  >
    J
  </div> -->
  <div class="md:px-16 min-h-screen sm:min-h-0">
    <div
      class="cursor-pointer hover:-translate-x-0.5 transition-all ease-in-out duration-300 hover:brightness-110"
    >
      <button
        class="group"
        on:click={() => {
          history.back();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="inline h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
        </svg>
        <p class="inline">back</p>
        <!-- why wont this work? -->
      </button>
    </div>
    <h2 class="my-4 text-3xl md:text-4xl font-semibold">{post.title}</h2>
    <p class="my-4 text-zinc-500 dark:text-zinc-400">{post.formatteddate}</p>
    {#if post.tags}
      <div class="flex flex-row space-x-1">
        {#each post.tags as tag}
          <div
            class="rounded-xl py-1 px-2 group-hover:rounded-lg group-hover:contrast-125 transition-all ease-in-out"
            style:background-color={BlogTagColors[tag]}
          >
            <span class="text-xs relative block text-white">{tag}</span>
          </div>
        {/each}
      </div>
    {/if}
    {#if post?.videoid}
      <div class="w-full mb-6 aspect-w-16 aspect-h-9">
        <embed
          src="https://www.youtube.com/embed/{post?.videoid}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="rounded"
          title=""
        />
      </div>
    {/if}
    {#if post?.audiopath}
      <div class="mb-4">
        <audio type="mp3" controls>
          <source src={post?.audiopath} />
        </audio>
      </div>
    {/if}
    {#if post?.pdfpath}
      <div class="mb-8 relative aspect-h-11 aspect-w-8">
        <iframe class="" title="Pdf file" src={post?.pdfpath} frameborder="0" />
      </div>
    {/if}
    <div class="w-full relative prose max-w-none prose-lg lg:prose-xl prose-zinc dark:prose-invert">
      <!-- firstletter isnt working here... not sure why -->

      {@html post.html}
      <!-- <svelte:component this={post.content} /> -->
    </div>
  </div>
</article>

<style>
  button {
    all: unset;
  }
</style>
