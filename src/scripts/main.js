class SpaceStation23 {
  constructor() {
    this._bindEvents();
  }

  _bindEvents() {
    // This is Javascript and we are here so we must be able to use the styled audio player
    document.querySelectorAll(".native-player").forEach((player) => {
      player.controls = false;
    });

    document.querySelectorAll(".styled-player").forEach((player) => {
      player.style.display = "block";
    });

    // Listen Now button
    document.querySelector("#btnListenNow").addEventListener("click", (e) => {
      // Don't prevent default because we want to scroll to the Latest Episodes
      // Click the styled player button so that we get styled player feedback. It will start the underlying HTML5 Audio.
      document.querySelectorAll(".styled-player")[0].querySelector("button[title=Play]").click();
    });

    document.querySelectorAll(".styled-player button[title=Play]").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const player = document.querySelector(`#player-${e.target.parentNode.parentNode.dataset.episode}`);
        if (player.paused) {
          e.target.title = "Pause";
          e.target.ariaLabel = "Pause";
          player.play();
        } else {
          e.target.title = "Play";
          e.target.ariaLabel = "Play";
          player.pause();
        }

        ["mejs__play", "mejs__pause"].map((v) => e.target.parentNode.classList.toggle(v));
      });
    });

    // List of sections to observe and their respective intersection ratios
    const observableSections = {
      hero: 0.5,
      "latest-episodes": 0.9,
      subscribe: 0.5,
      archives: 0.0,
    };

    // Observer options, accounting for 61px sticky nav
    const options = {
      // root: document.querySelector(".site-wrap"),
      //rootMargin: "61px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    };
    // Observer callback
    const cb = (entries) => {
      entries.forEach((entry) => {
        const hash = "#" + entry.target.id;
        const th = observableSections[entry.target.id] || 0;
        console.log(hash, entry.intersectionRatio);
        const navLink = document.querySelector(`a[href="${hash}"]`);

        if (entry.isIntersecting && entry.intersectionRatio > th) {
          console.log("E", entry.target.id, th);
          navLink.parentNode.classList.add("active");
        } else {
          navLink.parentNode.classList.remove("active");
        }
      });
    };

    // Start observing...
    const observer = new IntersectionObserver(cb, options);

    for (const [key, val] of Object.entries(observableSections)) {
      console.log(document.querySelector(`#${key}`));
      observer.observe(document.querySelector(`#${key}`));
    }
  }
}

document.addEventListener("DOMContentLoaded", (e) => {
  new SpaceStation23();
});
