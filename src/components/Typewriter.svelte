<script lang="ts">
  export let text: string;
  export let speed: number = 120;
  let span: HTMLSpanElement;
  export let activated = false;
  let hidden = false;

  export const startTypewriter = () => {
    let i = 0;
    span.innerHTML = "";
    const type = () => {
      if (i < text.length) {
        span.textContent += text.charAt(i);
        i++;
        const rand = 1.3 * (Math.random() - 0.5);
        setTimeout(type, speed + rand * speed);
      }
    };
    type();
    setTimeout(() => {
      hidden = true;
    }, text.length * speed + 2000);
  };

  $: if (activated) {
    startTypewriter();
  }
</script>

<!-- prettier-ignore -->
<span bind:this={span} class="w-full"> </span><span
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
