<script context="module">
  export const prerender = true;
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section class="">
  <div
    class="codybowl bg-[url('/images/codybowl.jpg')] dark:bg-[url('/images/jacksonstars.jpg')] bg-fixed min-h-screen bg-cover bg-center min-w-full flex flex-col justify-center items-center"
  >
    <h1
      class="bg-white_translucent dark:bg-zinc-900/70 text-[53px] dark:text-zinc-300 font-light py-0.5 px-2 my-3 fadeInDown"
    >
      Learning as a Hobby
      <!-- Learning is a skill -->
    </h1>
    <h2
      class="bg-white_translucent dark:bg-zinc-900/70 text-[25px] dark:text-zinc-300 italic font-semithin py-0.1 px-1.5 fadeInDown"
    >
      The work of Jacob Bruner
    </h2>
    <div>
      <button
        class="my-3 px-3 py-1.5 text-base lg:font-medium font-small text-center text-white dark:text-black transition duration-500 ease-in-out transform bg-blue-400/80 lg:px-7 lg:py-2 rounded-xl hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-0.5 focus:ring-white"
      >
        About Me
      </button>
      <button
        class="my-3 px-3 py-1.5 text-base lg:font-medium font-small text-center text-white dark:text-black transition duration-500 ease-in-out transform bg-primary_translucent lg:px-7 lg:py-2 rounded-xl hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-0.5 focus:ring-white"
        >Randomize</button
      >
    </div>
    <!-- <Counter /> -->
  </div>
</section>

<!-- Profile Picture -->
<section class="container my-24 px-6 mx-auto">
  <div
    class="flex flex-wrap lg:px-20 px-30 basis-auto justify-center content-center space-x-12"
  >
    <div
      class="grow-0 shrink-0 lg:w-4/12 w-10/12 shadow-xl dark:shadow-zinc-700/50 p-7 rounded-md bg-[url('/images/schoolphoto2.jpg')] bg-cover bg-top lg:h-[500px] h-[700px] lg:w-min-full bg-clip-content lg:m-0 m-12"
      aria-label="Photo of Jacob"
    >
      <!-- <img src="/images/schoolphoto.jpg" alt="Jacob Bruner" /> -->
    </div>

    <div class="grow-0 shrink-0 basis-auto w-full lg:w-7/12 self-center">
      <p class="text-[22px] px-10 dark:text-zinc-300 lg:text-left text-justify">
        Jacob Bruner is a 17 year-old student at The Dwight School in New York
        City. During his junior year in high-school, he is exploring his various
        creative interests through his out-of-school self-study and projects.
        Beyond his class' curriculum, he spends his free time learning new
        things. He would best describe himself as an interdisciplinary thinker,
        who thrives on his inability to stick to one thing. The culmination of
        these efforts is a wide variety of projects demonstrating his ability
        and understanding across a range of fields, including some more
        STEM-oriented and some more humanities oriented. Explore this website to
        find out more!
      </p>
    </div>
  </div>
</section>

<!-- Extracurriciulars and other photos -->

<section
  class="min-h-[700px] bg-primary bg-fixed bg-cover bg-center justify-center items-center flex flex-col"
/>

<style>
</style>
