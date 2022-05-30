<script context="module">
  import Header from "$lib/Header.svelte";
  export const prerender = true;
</script>

<script>
  import Counter from "$lib/Counter.svelte";
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section
  class="codybowl bg-[url('/images/codybowl.jpg')] dark:bg-[url('/images/jacksonstars.jpg')] bg-fixed min-h-screen min-w-full flex flex-col justify-center items-center"
>
  <Header />
  <h1 class="bg-white_translucent font-light py-0.5 px-2 my-3">
    Learning as a Hobby
  </h1>
  <h2 class="bg-white_translucent text-[19px] italic font-thin py-0.1 px-0.5">
    The work of Jacob Bruner
  </h2>
  <div>
    <button
      class="my-3 px-3 py-1.5 text-base lg:font-medium font-small text-center text-white transition duration-500 ease-in-out transform bg-blue-400/80 lg:px-7 lg:py-2 rounded-xl hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-0.5 focus:ring-white"
      >About Me</button
    >
    <button
      class="my-3 px-3 py-1.5 text-base lg:font-medium font-small text-center text-white transition duration-500 ease-in-out transform bg-primary_translucent lg:px-7 lg:py-2 rounded-xl hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-0.5 focus:ring-white"
      >About Me</button
    >
  </div>
  <!-- <Counter /> -->
</section>

<style>
  .codybowl {
    background-size: cover;
    background-position: center;
  }
</style>
