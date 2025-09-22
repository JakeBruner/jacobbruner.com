<script lang="ts">
  const navitems = [
    { title: "Home", path: "/" },
    { title: "Music", path: "/Music" },
    { title: "Math", path: "/Math" },
    { title: "Photography", path: "/Photography" },
    { title: "CS", path: "/Computer-Science" },
    { title: "Writing", path: "/Writing" }
  ];
  import { dev } from "$app/environment";
</script>

<footer class="bg-white dark:bg-zinc-900">
  <div class="w-full insex-x-0 bottom-0 left-0 right-0 pt-16 pb-10">
    <div class="md:container md:mx-auto xl:px-40 lg:px-28">
      <div class="flex sm:flex-row flex-col gap-y-6">
        <div class="basis-[37.5%] md:px-7 px-7 xl:px-16">
          <h4 class="pb-4 font-bold text-primary">Website</h4>
          <p class="leading-relaxed font-light dark:text-zinc-300">
            Hand-coded by Jacob using Svelte, Rust, Typescript.
          </p>
        </div>
        <div class="basis-[37.5] md:px-9 px-7 xl:px-16">
          <h4 class="pb-4 font-bold text-primary">Links</h4>
          <p class="flex md:grid md:grid-cols-2 flex-col leading-relaxed font-light">
            {#each navitems as item}
              <a
                class="leading-[1.8] hover:text-stone-900 dark:text-zinc-200 dark:hover:text-zinc-50 transition ease-in-out duration-300"
                href={item.path}
                >{item.title}
              </a>
            {/each}
          </p>
        </div>
        <div class="basis-1/2 md:px-7 px-7 xl:px-16">
          <h4 class="pb-4 font-bold text-primary">Contact Information</h4>
          <p class="leading-relaxed font-light dark:text-zinc-300">
            New York City <br />
            United States <br />
            <a href="mailto:jacob.bruner@duke.edu">jacob.bruner@duke.edu</a><br />
            <a href="mailto:jacobbruner24@gmail.com">jacobbruner24@gmail.com</a><br />
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">jacobbruner.com</a>
          </p>
        </div>
      </div>
      <div class="text-center pt-14 pb-5">
        <small class="block text-[17px] italic text-stone-700 dark:text-zinc-400">
          Made with &#x2661 by Jacob Bruner
        </small>
        <div class="flex flex-row gap-6 justify-center py-4">
          <div class="text-primary">
            <a href="https://www.instagram.com/jake.bruner/" aria-label="Instagram"
              ><svg xmlns="http://www.w3.org/2000/svg" width="32" height="50" viewBox="0 0 512 512">
                <path
                  style="fill:currentColor"
                  d="M256,49.471c67.266,0,75.233.257,101.8,1.469,24.562,1.121,37.9,5.224,46.778,8.674a78.052,78.052,0,0,1,28.966,18.845,78.052,78.052,0,0,1,18.845,28.966c3.45,8.877,7.554,22.216,8.674,46.778,1.212,26.565,1.469,34.532,1.469,101.8s-0.257,75.233-1.469,101.8c-1.121,24.562-5.225,37.9-8.674,46.778a83.427,83.427,0,0,1-47.811,47.811c-8.877,3.45-22.216,7.554-46.778,8.674-26.56,1.212-34.527,1.469-101.8,1.469s-75.237-.257-101.8-1.469c-24.562-1.121-37.9-5.225-46.778-8.674a78.051,78.051,0,0,1-28.966-18.845,78.053,78.053,0,0,1-18.845-28.966c-3.45-8.877-7.554-22.216-8.674-46.778-1.212-26.564-1.469-34.532-1.469-101.8s0.257-75.233,1.469-101.8c1.121-24.562,5.224-37.9,8.674-46.778A78.052,78.052,0,0,1,78.458,78.458a78.053,78.053,0,0,1,28.966-18.845c8.877-3.45,22.216-7.554,46.778-8.674,26.565-1.212,34.532-1.469,101.8-1.469m0-45.391c-68.418,0-77,.29-103.866,1.516-26.815,1.224-45.127,5.482-61.151,11.71a123.488,123.488,0,0,0-44.62,29.057A123.488,123.488,0,0,0,17.3,90.982C11.077,107.007,6.819,125.319,5.6,152.134,4.369,179,4.079,187.582,4.079,256S4.369,333,5.6,359.866c1.224,26.815,5.482,45.127,11.71,61.151a123.489,123.489,0,0,0,29.057,44.62,123.486,123.486,0,0,0,44.62,29.057c16.025,6.228,34.337,10.486,61.151,11.71,26.87,1.226,35.449,1.516,103.866,1.516s77-.29,103.866-1.516c26.815-1.224,45.127-5.482,61.151-11.71a128.817,128.817,0,0,0,73.677-73.677c6.228-16.025,10.486-34.337,11.71-61.151,1.226-26.87,1.516-35.449,1.516-103.866s-0.29-77-1.516-103.866c-1.224-26.815-5.482-45.127-11.71-61.151a123.486,123.486,0,0,0-29.057-44.62A123.487,123.487,0,0,0,421.018,17.3C404.993,11.077,386.681,6.819,359.866,5.6,333,4.369,324.418,4.079,256,4.079h0Z"
                />
                <path
                  style="fill:currentColor"
                  d="M256,126.635A129.365,129.365,0,1,0,385.365,256,129.365,129.365,0,0,0,256,126.635Zm0,213.338A83.973,83.973,0,1,1,339.974,256,83.974,83.974,0,0,1,256,339.973Z"
                />
                <circle style="fill:currentColor" cx="390.476" cy="121.524" r="30.23" />
              </svg></a
            >
          </div>
          <div class=" text-primary">
            <a href="https://github.com/JakeBruner/sveltekit" aria-label="Github"
              ><svg
                width="32"
                height="50"
                viewBox="0 0 1024 1024"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
                  transform="scale(64)"
                  fill="currentColor"
                />
              </svg></a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="bottom-0 text-right text-zinc-500/80 dark:text-zinc-500 mr-4 text-base">
    {#if !dev}
      <a href="https://github.com/JakeBruner/jacobbruner.com">
        <svg
          aria-hidden="true"
          height="16"
          viewBox="0 0 16 16"
          width="16"
          class="inline-block align-text-bottom text-zinc-500/90 dark:text-zinc-600/90 fill-current"
        >
          <path
            fill-rule="evenodd"
            class=""
            d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"
          />
        </svg>
        <span class="dark:text-zinc-600/90 text-zinc-500/90 italic">prod</span>
      </a>
    {:else}
      <span class="dark:text-zinc-600/90 text-zinc-500/90 italic">dev</span>
    {/if}
  </div>
</footer>
