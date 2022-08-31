<script lang='ts'>
  export const prerender = true;
  const featuredposts = ["/Math/ComplexNumbers", "/Math/EulerExploration", "/Computer-Science/Guess The Build Solver", "/Writing/PublicDefenders"]

  const rand = (max: number): number => {
    return Math.floor(Math.random() * max)
  }

  const randomlink: string = featuredposts[rand(featuredposts.length)]
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section class="-mt-[68px]">
  <div
    class="codybowl bg-[url('/images/codybowl.jpg')] dark:bg-[url('/images/jacksonstars.jpg')] bg-fixed min-h-screen bg-cover bg-center min-w-full flex flex-col justify-center items-center"
  >
    <h1
      class="bg-white_translucent dark:bg-zinc-900/70 sm:text-[53px] text-5xl text-zinc-700 dark:text-zinc-300 font-light pb-[13px] pt-[17px] px-2 my-4 fadeInDown text-center"
    >
      Learning as a Hobby
      <!-- Learning is a skill -->
    </h1>
    <h2
      class="bg-white_translucent dark:bg-zinc-900/70 text-[25px] text-zinc-600 dark:text-zinc-300 italic py-0.1 px-1.5 font-normal fadeInDown"
    >
      The work of Jacob Bruner
    </h2>
    <div>
      <button
        class="my-3 px-3 py-1.5 text-base lg:font-medium font-small text-center text-white dark:text-black transition duration-500 ease-in-out transform bg-blue-400/80 lg:px-7 lg:py-2 rounded-xl hover:bg-blue-400 hover:scale-[102%] focus:ring-2 focus:ring-offset-0.5 focus:ring-white"
      >
        About Me
      </button>
      <a href={randomlink}>
      <button
        class="my-3 px-3 py-1.5 text-base lg:font-medium font-small text-center text-white dark:text-black transition duration-500 ease-in-out transform bg-primary/80 lg:px-7 lg:py-2 rounded-xl hover:bg-primary hover:scale-[102%] focus:ring-2 focus:ring-offset-0.5 focus:ring-white"
        >Random Post</button
      ></a>
    </div>
  </div>
</section>

<section class="my-24 px-6">
  <!-- MD IS MY BREAKPOINT FOR THIS TO BE A COLUMN -->
  <div
    class="flex md:flex-row flex-col lg:px-20 md:px-30 justify-center content-center md:space-x-12"
  >
    <div
      class="mx-auto flex-initial shadow-lg shadow-zinc-300 dark:shadow-zinc-700 sm:p-7 p-5 rounded-md "
    >
      <img
        class="w-[400px] md:h-full object-cover overflow-hidden top-0 min-w-[200px]"
        src="/images/schoolphoto2.jpg"
        alt="Jacob Bruner"
      />
    </div>

    <div class="flex-1 md:basis-1/2">
      <p
        class="2xl:leading-loose lg:text-2xl leading-relaxed sm:text-xl text-lg inset-0 pt-8 px-10 font-light dark:text-zinc-300"
        id="whoami"
      >
        Jacob Bruner is a 17 year-old student at The Dwight School in New York City. During his
        junior year in high-school, he is exploring his various creative interests through his
        out-of-school self-study and projects. Beyond his class' curriculum, he spends his free time
        learning new things. He would best describe himself as an interdisciplinary thinker, who
        thrives on his inability to stick to one thing. The culmination of these efforts is a wide
        variety of projects demonstrating his ability and understanding across a range of fields,
        including some more STEM-oriented and some more humanities oriented. Explore this website to
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
