class AudioPlayer {
  constructor(audioElement) {
    this.wrapElement(audioElement);
    this.bindEvents();
  }

  formatTime(timeInSeconds) {
    const seconds = parseInt(timeInSeconds);
    const hours = parseInt(seconds / 3600);
    const mins = parseInt((seconds - hours * 3600) / 60);
    const secs = seconds - (hours * 3600 + mins * 60);
    return `${("00" + hours).slice(-2)}:${("00" + mins).slice(-2)}:${("00" + secs).slice(-2)}`;
  }

  wrapElement(audioElement) {
    // Cache the native HTML audio element
    this.audioElement = audioElement;
    // Get a reference to the custom audio player template
    const template = document.querySelector("#audioPlayerTemplate");

    // Clone the template
    this.player = template.content.firstElementChild.cloneNode(true);
    console.log(audioElement.dataset["length"]);
    this.player.querySelector(".ap-duration").innerText = this.formatTime(audioElement.dataset["length"]);
    // Append the new player as a sibling of the native audio element
    audioElement.parentNode.appendChild(this.player, audioElement);

    // Hide the native HTML5 audio element
    audioElement.style.display = "none";
  }

  bindEvents() {
    // bind play/pause
    this.player.querySelectorAll(".styled-player button[title=Play]").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();

        // Get the nativePlayer element that is wrapped in this custom player skin
        const nativePlayer = this.audioElement;

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

        ["ap-play", "ap-pause"].map((btn) => e.target.parentNode.classList.toggle(btn));
      });
    });

    // Bind progress bar click-to-seek
    this.player.querySelector(".ap-time-slider").addEventListener("click", (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      this.audioElement.currentTime = this.audioElement.duration * pos;
    });

    // Bind the various user feedback elements including buffer bar, progress bar and elapsed time
    this.audioElement.addEventListener("timeupdate", (e) => {
      const elapsed = this.audioElement.currentTime;
      const duration = this.audioElement.duration;
      const progress = elapsed / duration;
      const buffered = this.audioElement.buffered.end(0) / duration;

      // Update the current time display
      this.player.querySelector(".ap-currenttime-container .ap-currenttime").innerText = this.formatTime(elapsed);

      // Update the buffer bar
      this.player.querySelector(".ap-time-slider .ap-time-loaded").style.transform = `scaleX(${buffered})`;

      // Update the progres bar
      this.player.querySelector(".ap-time-slider .ap-time-current").style.transform = `scaleX(${progress})`;
    });
  }
}
