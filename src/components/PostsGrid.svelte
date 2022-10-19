<script lang="ts">
  import type { PostInfo } from "$lib/blog/blog";
  import Post from "$components/Post.svelte";
  export let subject: string;
  export let posts: PostInfo[];
</script>

<div class="mt-12 grid gap-16 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-12 content-center">
  {#each posts as post}
    <div
      class="group border border-zinc-300 dark:border-zinc-700 rounded-lg flex flex-col justify-between self-center transition ease-in-out duration-200 shadow-sm dark:shadow-white/5 hover:shadow-lg hover:dark:shadow-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800/25 hover:scale-[101%]"
    >
      <a href="/{subject}/{post.slug}">
        {#if post.thumbnailpath}
          <div
            class="group-hover:contrast-[90%] rounded-t-lg aspect-w-16 lg:aspect-h-9 aspect-h-7 w-full bg-cover bg-center min-w-full transition ease-in-out duration-200  border-b border-zinc-100 dark:border-zinc-800"
            style="background-image: url({post.thumbnailpath})"
          />
        {/if}
        <div class="p-4 self-end">
          <p class="text-xl font-medium dark:text-zinc-100 text-zinc-800">{post.title}</p>
          <p class="mt-3 dark:text-zinc-400 text-zinc-500">{post.excerpt}</p>
          <div class="mt-6">
            <div class="text-sm dark:text-zinc-400/60 text-zinc-500">
              <time>{post.datestring}</time>
            </div>
          </div>
        </div>
      </a>
    </div>
  {/each}
  {#each posts as post}
    <Post {post} {subject} />
  {/each}
</div>
