<script lang="ts">
  import { onMount } from "svelte";

  export let text: string;
  export let speed: number = 120;
  export let activated = false;
  let displayedText = "";
  let hidden = false;
  let mounted = false;
  let typingTimer: ReturnType<typeof setTimeout> | undefined;
  let cursorTimer: ReturnType<typeof setTimeout> | undefined;

  const clearTimers = () => {
    clearTimeout(typingTimer);
    clearTimeout(cursorTimer);
    typingTimer = undefined;
    cursorTimer = undefined;
  };

  export const startTypewriter = () => {
    clearTimers();
    if (!mounted) return;

    let i = 0;
    displayedText = "";
    hidden = false;
    const type = () => {
      typingTimer = undefined;
      if (i < text.length) {
        displayedText += text.charAt(i);
        i++;
      }
      if (i < text.length) {
        const rand = 1.3 * (Math.random() - 0.5);
        typingTimer = setTimeout(type, speed + rand * speed);
      } else {
        cursorTimer = setTimeout(() => {
          cursorTimer = undefined;
          hidden = true;
        }, 2000);
      }
    };
    type();
  };

  onMount(() => {
    mounted = true;
    return () => {
      mounted = false;
      clearTimers();
    };
  });

  $: if (mounted && activated) {
    startTypewriter();
  } else {
    clearTimers();
  }
</script>

<!-- prettier-ignore -->
<span class="w-full">{displayedText}</span><span
  class:hidden
  class="cursor text-primary-100 dark:text-primary-900">|</span
>

<style>
  .cursor {
    animation: blink 1s infinite;
  }
  @keyframes blink {
    0% {
      opacity: 0;
    }
    40% {
      opacity: 1;
    }
    60% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
</style>
