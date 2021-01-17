class SpaceStation23 {
  constructor() {
    this._bindEvents();
  }

  _bindEvents() {
    // List of sections to observe and their respective intersection ratios
    const observableSections = {
      hero: 0.5,
      "recent-episodes": 0.9,
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

    //   (entries) => {
    //     entries.forEach((entry) => {
    //       const hash = "#" + entry.target.id;
    //       const navEl = document.querySelector(`a[href="${hash}"]`);
    //       if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
    //         navEl.classList.add("active");
    //         // console.log(`${entry.target.id} in the view`);
    //         // // Remove active from all items
    //         // document.querySelectorAll(".nav-item").forEach((navItem) => {
    //         //   navItem.classList.remove("active");
    //         // });
    //         // const section = document.querySelector(`.nav-link[href$='${entry.target.id}']`);
    //         // if (section) {
    //         //   console.log(section.parentNode);
    //         //   section.parentNode.classList.add("active");
    //         // }
    //       } else {
    //         navEl.classList.remove("active");
    //       }
    //     });
    //   }
    // );

    for (const [key, val] of Object.entries(observableSections)) {
      console.log(document.querySelector(`#${key}`));
      observer.observe(document.querySelector(`#${key}`));
    }

    // document.querySelectorAll(".tinyPlayer").forEach((t) => {
    //   t.addEventListener("click", (e) => {
    //     e.preventDefault();
    //   });
    // });
  }
}

document.addEventListener("DOMContentLoaded", (e) => {
  new SpaceStation23();
});
