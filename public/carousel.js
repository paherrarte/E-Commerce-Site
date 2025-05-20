document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-btn.next');
    const prevButton = document.querySelector('.carousel-btn.prev');
    let currentIndex = 0;

    const moveToSlide = index => {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      track.style.transform = `translateX(-${index * 100}%)`;
      currentIndex = index;
    };

    nextButton.addEventListener('click', () => moveToSlide(currentIndex + 1));
    prevButton.addEventListener('click', () => moveToSlide(currentIndex - 1));

    // Automatic slideshow
    setInterval(() => {
      moveToSlide(currentIndex + 1);
    }, 3000); // Change every 3 seconds
  });
