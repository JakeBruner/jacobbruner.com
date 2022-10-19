<script lang="ts">
  import type { PostInfo } from "$lib/blog/blog";
  export let post: PostInfo;
  export let subject: string = "";
</script>

<div
  class="group rounded-lg flex flex-col justify-between shadow-md hover:shadow-lg self-center transition ease-in-out duration-200 dark:shadow-white/5 hover:dark:shadow-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800/25 hover:scale-[100.5%] hover:-translate-y-1"
>
  <a href={"/" + subject ? subject + "/" + post.slug : post.slug}>
    {#if post.thumbnailpath}
      <div
        class="group-hover:contrast-[90%] rounded-t-lg aspect-w-16 lg:aspect-h-9 aspect-h-7 w-full bg-cover bg-center min-w-full transition ease-in-out duration-200"
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
