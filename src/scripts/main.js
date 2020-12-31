class SpaceStation23 {
  constructor() {
    this._bindEvents();
  }

  _bindEvents() {
    document.querySelectorAll(".tinyPlayer").forEach((t) => {
      t.addEventListener("click", (e) => {
        e.preventDefault();
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", (e) => {
  new SpaceStation23();
});
