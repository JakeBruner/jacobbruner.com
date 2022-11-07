<script>
  import { page } from "$app/stores";
  import { loading } from "$lib/loading";
  // console.log($page)
  const navitems = [
    { title: "Home", path: "/" },
    { title: "Music", path: "/Music" },
    { title: "Math", path: "/Math" },
    { title: "Photography", path: "/Photography" },
    { title: "CS", path: "/Computer-Science" },
    { title: "Writing", path: "/Writing" }
  ];

  let menuOpen = false;
</script>

<header>
  <nav
    class="backdrop-blur-sm fixed top-0 left-0 right-0 z-[800] bg-white_translucent dark:bg-zinc-900/80 px-2 sm:px-4 py-3.5 text-black dark:text-zinc-100/90 shadow-md dark:shadow-black/30"
  >
    <style>
      nav::before {
        /* background-image: linear-gradient(90deg, #b15e84, #d772a1, #8b4968, #b15e84); */
        animation: gradientWander 25s linear infinite;
        height: 4px;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        content: "";
        background-size: 200%;
      }
      @media (prefers-color-scheme: light) {
        nav::before {
          background-image: linear-gradient(90deg, #d772a1, #bc8ebf, #93a8da, #bc8ebf, #d772a1);
        }
      }
      @media (prefers-color-scheme: dark) {
        nav::before {
          background-image: linear-gradient(90deg, #c16891, #8b6d92, #6e7ea4, #8b6d92, #c16891);
        }
      }
      @keyframes gradientWander {
        0% {
          background-position: -30% 0%;
        }
        100% {
          background-position: 170% 0%;
        }
      }
    </style>
    <!-- dark:bg-gray-800 dark:text-white -->
    <div
      class="pt-[4px] flex flex-wrap justify-between items-center xl:px-40 lg:px-24 xs:px-12 px-4"
    >
      <!-- NAME/LOGO -->
      <a href="/" class="name m-0 p-0 font-bold text-[28px]"
        >Jacob <span class="text-primary">B.</span></a
      >

      <!-- MOBILE HAMBURGER ICON -->
      <button
        class="z-51 flex md:hidden"
        on:click={() => (menuOpen = !menuOpen)}
        aria-label="Collapse Pop-out Menu"
      >
        <!-- svg with 3 lines -->
        <svg
          width="28"
          height="21"
          class="min-h-[21px] stroke-1 transition-transform duration-300 ease-in-out stroke-zinc-500"
          class:menuOpen
        >
          <line id="top" x1="0" y1="2" x2="28" y2="2" />
          <line id="middle" x1="0" y1="10.5" x2="24" y2="10.5" />
          <line id="bottom" x1="0" y1="19" x2="28" y2="19" />
          <!-- look at how pretty this thing is -->
        </svg>
      </button>

      <!-- MOBILE ROW POPOUT MENU -->
      <aside
        class:menuOpen
        class="md:hidden fixed -z-1 w-1/2 mt-[60px] min-h-screen inset-y-0 shadow-md bg-white/80 dark:bg-zinc-900/80  transition duration-300 ease-in-out"
      >
        <ul class="flex flex-col p-5 space-y-4 ">
          {#each navitems as item}
            <li class="hover:scale-[102%] transition ease-in-out duration-300">
              <a
                href={item.path}
                class:active={$page.url.pathname === item.path}
                class="before:!bottom-[-2px] transition ease-in-out duration-100 text-zinc-800/90 hover:text-primary dark:text-zinc-200/90"
                on:click={() => {
                  $loading = true;
                  menuOpen = false;
                }}>{item.title}</a
              >
            </li>
          {/each}
        </ul>
      </aside>

      <!-- LARGE SCREEN COLUMN LAYOUT -->
      <div class="hidden md:flex justify-between items-center w-full md:w-auto md:order-1">
        <!-- hidden and flex utility classes overwrite oneanother: here it is hidden until the min width 'md' makes it flex -->
        <ul class="flex lg:space-x-7 space-x-4">
          {#each navitems as item}
            <li class="hover:scale-105 transition ease-in-out duration-300">
              <a
                href={item.path}
                class:active={$page.url.pathname === item.path}
                class="transition ease-in-out duration-100 decoration-primary block text-[17px] text-zinc-800/90 hover:text-primary dark:text-zinc-200/90 hover:dark:text-primary after:bg-primary after:bottom-[2px] after:absolute after:h-[2.5px] after:left-[2px] after:right-[2px] after:invisible after:-scale-x-0 hover:after:-scale-x-100 hover:after:visible after:transition after:ease-out after:duration-500"
                on:click={() => ($loading = true)}>{item.title}</a
              >
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </nav>
</header>

<style>
  aside {
    transition: right 0.3s ease-in-out;
    @apply -right-[100%];
  }
  aside.menuOpen {
    @apply right-0;
  }
  /* SVG HAMBURGER ANIMATION */
  svg {
    min-height: 21px;
    transition: transform 0.3s ease-in-out;
  }

  svg line {
    @apply stroke-zinc-600 dark:stroke-zinc-300;
    stroke-width: 1.5;
    transition: transform 0.3s ease-in-out;
  }

  svg.menuOpen {
    @apply scale-75;
  }

  .menuOpen #top {
    @apply translate-x-1 scale-90 rotate-45;
  }

  .menuOpen #middle {
    @apply scale-0 translate-y-3;
  }

  .menuOpen #bottom {
    @apply -translate-x-[0.63rem] translate-y-[0.43rem] scale-90 -rotate-45;
  }

  /* PINK UNDERLINE */
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
  /* .active::after {
    position: absolute;
    bottom: -3px;
    left: 0;
    right: 0;
    content: "";
    width: 30px;
    height: 2px;
    background: var(--accent-color);
    margin: 0 auto;
  } */
  .active::before {
    content: "";
    background-color: var(--accent-color);
    bottom: 2px;
    height: 2px;
    position: absolute;
    left: 6px;
    right: 6px;
    transition: all 0.15s ease-in;
  }
</style>
