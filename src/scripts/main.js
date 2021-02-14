class SpaceStation23 {
  constructor() {
    this.bindAudioPlayers();

    this.bindNavigationBits();

    this.menus = {
      hero: 0,
      "latest-episodes": this.getCoords(document.querySelector("#latest-episodes")).top,
      subscribe: this.getCoords(document.querySelector("#subscribe")).top,
      archives: this.getCoords(document.querySelector("#archives")).top,
    };
    this.currentNav = document.querySelector(".nav-item.active .nav-link");
  }

  bindAudioPlayers() {
    const audioPlayers = document.querySelectorAll("audio");
    audioPlayers.forEach((ap) => {
      // Insert new custom audio player and hide the HTML5 audio element
      new AudioPlayer(ap);
    });
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
}

document.addEventListener("DOMContentLoaded", (e) => {
  new SpaceStation23();
});
