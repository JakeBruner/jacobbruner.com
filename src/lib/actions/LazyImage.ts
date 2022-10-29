// https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
const options = {
  root: null,
  rootMargin: "10px",
  threshold: 0.0
};

export const lazyImage = (image: HTMLImageElement, src: string) => {
  const loaded = () => {
    observer.unobserve(image);
    image.removeEventListener("load", loaded);
    image.style.animation = "none";
    //TODO: add animation
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        image.src = src;
        image.onload = loaded;
      }
    });
  }, options);

  // const observer = new IntersectionObserver((entries) => {
  //   if (entries[0].isIntersecting) {
  //     image.src = src;
  //     if (image.complete) {
  //       loaded();
  //     } else {
  //       image.addEventListener("load", loaded);
  //     }
  //   }
  // }, options);

  observer.observe(image);

  return {
    destroy() {
      image.removeEventListener("load", loaded);
      observer.unobserve(image);
    }
  };
};
