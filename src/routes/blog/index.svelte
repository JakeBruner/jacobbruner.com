<script>
  export let posts;
</script>

<!-- TODO add a way to have a thumbnail for some posts -->
<div class=" pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
  <div class="max-w-lg mx-auto lg:max-w-7xl">
    <div class="border-b border-b-gray-200 pb-6">
      <h2
        class="text-3xl tracking-tight font-semibold text-gray-900 sm:text-4xl"
      >
        Recent Posts
      </h2>
    </div>
    <div class="mt-12 grid gap-16 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-12">
      {#each posts as post}
        <div
          class="border border-gray-200 p-4 rounded-lg flex flex-col justify-between"
        >
          <a href="/blog/{post.path}" sveltekit:prefetch>
            <p class="text-xl text-gray-900">{post.title}</p>
            <p class="mt-3 text-gray-500">{post.excerpt}</p>
          </a>
          <div class="mt-6">
            <div class="text-sm text-gray-500">
              <time datetime="2020-03-16">{post.published}</time>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
