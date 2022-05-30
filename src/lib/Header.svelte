<script context="module">
  import { page } from "$app/stores";
  // console.log($page)
  const nav = [
    { title: "Home", path: "/" },
    { title: "Music", path: "/about" },
    { title: "Math", path: "/about" },
    { title: "Photography", path: "/about" },
    { title: "CS", path: "/about" },
    { title: "Writing", path: "/about" },
    { title: "Contact", path: "/about" },
  ];
</script>

<header>
  <nav
    class="fixed top-0 left-0 right-0 z-50 bg-white_translucent dark:bg-zinc-900/80 px-2 sm:px-4 py-3.5 text-black dark:text-zinc-200/90"
  >
    <!-- dark:bg-gray-800 dark:text-white -->
    <div
      class="flex flex-wrap justify-between items-center xl:px-40 lg:px-24 px-12"
    >
      <a href="/" class="name font-bold"
        >Jacob <span class="text-primary">B.</span></a
      >
      <div
        class="hidden justify-between items-center w-full md:flex md:w-auto md:order-1"
        id="mobile-menu"
      >
        <ul
          class="flex mt-4 md:flex-row lg:space-x-7 space-x-4 md:mt-0 md:text-sm"
        >
          {#each nav as item}
            <li>
              <a
                href={item.path}
                class:active={$page.url.pathname === item.path}
                class="transition ease-in-out duration-300 hover:scale-105 decoration-primary block text-[17px] text-stone-900/90 hover:text-stone-900 dark:text-zinc-200/90 hover:dark:text-zinc-200 "
                >{item.title}</a
              >
            </li>
          {/each}
          <!-- TODO: make a collapsable menu thing -->
        </ul>
      </div>
    </div>
  </nav>
</header>

<style>
  .name {
    font-size: 32px;
    margin: 0;
    padding: 0;
  }
  a {
    text-decoration: none;
  }
  /* alternate method of doing the pink underline */
  /* .active {
	text-decoration: underline;
	text-decoration-color: var(--accent-color);
	text-decoration-thickness: 1.5px;
	text-underline-offset: 6px;
} */
  .active {
    position: relative;
  }
  .active::after {
    position: absolute;
    bottom: -3px;
    left: 0;
    right: 0;
    content: "";
    width: 30px;
    height: 2px;
    background: var(--accent-color);
    margin: 0 auto;
  }
</style>
