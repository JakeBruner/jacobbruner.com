<script lang="ts">
  import type { PostInfo } from "$lib/blog/blog";
  export let post: PostInfo;
  export let subject: string = "";
</script>

<div
  class="flex flex-col overflow-hidden rounded-lg shadow-md group hover:shadow-xl transition-all ease-in-out duration-200 hover:scale-[100.5%] hover:-translate-y-1"
>
  <!-- group border border-zinc-300 dark:border-zinc-700 rounded-lg flex flex-col justify-between self-center transition ease-in-out duration-200 shadow-sm dark:shadow-white/5 hover:shadow-lg hover:dark:shadow-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800/25 hover:scale-[101%] -->
  <a href={"/" + subject ? subject + "/" + post.slug : post.slug} class="mt-2 block">
    <div class="flex-shrink-0">
      {#if post.thumbnailpath}
        <img class="h-48 w-full object-cover" src={post.thumbnailpath} alt="" />
      {/if}
    </div>
    <div class="flex flex-1 flex-col justify-between bg-white p-6">
      <div class="flex-1">
        <!-- * note that I will pass only post.slug if I need this in a not blogpost context -->

        <p class="text-xl font-semibold text-gray-900">{post.title}</p>
        <p class="mt-3 text-base text-gray-500">
          {post.excerpt}
        </p>
      </div>
      <div class="ml-3">
        <div class="flex space-x-1 text-sm text-gray-500">
          <time>{post.datestring}</time>
        </div>
      </div>
    </div>
  </a>
</div>

<div
  class="group border border-zinc-300 dark:border-zinc-700 rounded-lg flex flex-col justify-between self-center transition ease-in-out duration-200 shadow-sm dark:shadow-white/5 hover:shadow-lg hover:dark:shadow-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800/25 hover:scale-[101%]"
>
  <a href={"/" + subject ? subject + "/" + post.slug : post.slug}>
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
