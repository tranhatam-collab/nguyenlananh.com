(() => {
  if ("loading" in HTMLImageElement.prototype) return;

  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  if (!lazyImages.length) return;

  let obs;
  if ("IntersectionObserver" in window) {
    obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          obs.unobserve(img);
        }
      });
    }, { rootMargin: "200px 0px" });
  }

  lazyImages.forEach((img) => {
    if (obs) {
      img.dataset.src = img.src;
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      obs.observe(img);
    } else {
      img.src = img.dataset.src || img.src;
    }
  });
})();
