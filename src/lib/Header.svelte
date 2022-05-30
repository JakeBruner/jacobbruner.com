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
    class="bg-white_translucent px-2 sm:px-4 py-3.5 dark:bg-gray-800 text-black dark:text-white"
  >
    <div class="container flex flex-wrap justify-between items-center px-8">
      <a href="/" class="name font-bold"
        >Jacob <span class="text-primary">B.</span></a
      >
      <div
        class="hidden justify-between items-center w-full md:flex md:w-auto md:order-1"
        id="mobile-menu-2"
      >
        <ul
          class="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium"
        >
          {#each nav as item}
            <li>
              <a
                href={item.path}
                class:active={$page.url.pathname === item.path}
                class="decoration-primary block text-[18px] text-stone-900/90 hover:text-stone-900"
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
