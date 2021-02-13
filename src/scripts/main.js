class SpaceStation23 {
  constructor() {
    this.bindPlayerBits();
    this.bindNavigationBits();
    this.bindEvents();
    this.menus = {
      hero: 0,
      "latest-episodes": this.getCoords(document.querySelector("#latest-episodes")).top,
      subscribe: this.getCoords(document.querySelector("#subscribe")).top,
      archives: this.getCoords(document.querySelector("#archives")).top,
    };
    console.log("MMM", this.menus);
  }

  bindEvents() {
    // // List of sections to observe and their respective intersection ratios
    // const observableSections = {
    //   hero: 0.5,
    //   "latest-episodes": 0.9,
    //   subscribe: 0.5,
    //   archives: 0.0,
    // };
    // // Observer options, accounting for 61px sticky nav
    // const options = {
    //   // root: document.querySelector(".site-wrap"),
    //   //rootMargin: "61px",
    //   threshold: [0, 0.25, 0.5, 0.75, 1],
    // };
    // // Observer callback
    // const cb = (entries) => {
    //   entries.forEach((entry) => {
    //     const hash = "#" + entry.target.id;
    //     const th = observableSections[entry.target.id] || 0;
    //     console.log(hash, entry.intersectionRatio);
    //     const navLink = document.querySelector(`a[href="${hash}"]`);
    //     if (entry.isIntersecting && entry.intersectionRatio > th) {
    //       console.log("E", entry.target.id, th);
    //       navLink.parentNode.classList.add("active");
    //     } else {
    //       navLink.parentNode.classList.remove("active");
    //     }
    //   });
    // };
    // // Start observing...
    // const observer = new IntersectionObserver(cb, options);
    // for (const [key, val] of Object.entries(observableSections)) {
    //   console.log(document.querySelector(`#${key}`));
    //   observer.observe(document.querySelector(`#${key}`));
    // }
  }

  debounce(fn, wait) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, arguments), wait);
    };
  }

  getCoords(elem) {
    // crossbrowser version
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
  }

  /**
   * Takes care of binding mobile nav display, open and closing menu items as well as highlighting the current menu position.
   *
   * @memberof SpaceStation23
   */
  bindNavigationBits() {
    // Listen Now button
    document.querySelector("#btnListenNow").addEventListener("click", (e) => {
      // Don't prevent default because we want to scroll to the Latest Episodes
      // Click the styled player button so that we get styled player feedback. It will start the underlying HTML5 Audio.
      document.querySelectorAll(".styled-player")[0].querySelector("button[title=Play]").click();
    });

    // Open the mobile nav on user tap
    document.querySelector(".navbar-toggler[data-target='#main_nav']").addEventListener("click", (e) => {
      e.preventDefault();
      const mainNav = document.querySelector("#main_nav");
      mainNav.style.display = mainNav.style.display === "block" ? "none" : "block";
    });

    // Close the mobile nav following an item click
    document.querySelectorAll(".nav-link").forEach((nav) => {
      nav.addEventListener("click", (e) => {
        document.querySelector("#main_nav").style.display = "none";
      });
    });

    // Update nav based on scroll position
    document.addEventListener(
      "scroll",
      this.debounce(() => {
        const pos = document.documentElement.scrollTop;
        let menuId = "";
        for (const key of Object.keys(this.menus)) {
          if (pos >= this.menus[key]) {
            // Nibble away at each item, last one standing is the current one
            menuId = key;
          }
        }

        // Remove the previous entry
        if (this.currentNav) {
          this.currentNav.parentNode.classList.remove("active");
        }

        this.currentNav = document.querySelector(`a[href="#${menuId}"]`);
        // Set the menuId node's parent li (nav-item) active
        this.currentNav.parentNode.classList.add("active");
      }, 125)
    );
  }

  /**
   * Takes care of wiring up all the audio player bits and pieces.
   *
   * @memberof SpaceStation23
   */
  bindPlayerBits() {
    // This is Javascript and we are here so we must be able to use the styled audio player therefore hide the native player.
    document.querySelectorAll(".native-player").forEach((player) => {
      player.controls = false;
    });

    document.querySelectorAll(".styled-player").forEach((player) => {
      player.style.display = "block";
    });

    document.querySelectorAll(".styled-player button[title=Play]").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();

        // Get the nativePlayer element that is wrapped in this custom player skin
        const nativePlayer = document.querySelector(`#player-${e.target.parentNode.parentNode.dataset.episode}`);

        // Toggle the state of the native player between paused and play
        if (nativePlayer.paused) {
          e.target.title = "Pause";
          e.target.ariaLabel = "Pause";
          nativePlayer.play();
        } else {
          e.target.title = "Play";
          e.target.ariaLabel = "Play";
          nativePlayer.pause();
        }

        // Note that mejs__* are leftover from the massive and former mediaplayer.js plugin that was mostly refactored away.
        ["mejs__play", "mejs__pause"].map((btn) => e.target.parentNode.classList.toggle(btn));
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", (e) => {
  new SpaceStation23();
});
