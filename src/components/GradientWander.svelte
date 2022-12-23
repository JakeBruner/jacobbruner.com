<div class="nav w-full" />

<style>
  .nav::before {
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
    .nav::before {
      background-image: linear-gradient(90deg, #d772a1, #bc8ebf, #93a8da, #bc8ebf, #d772a1);
    }
  }
  @media (prefers-color-scheme: dark) {
    .nav::before {
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
