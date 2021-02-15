/**
 * Implements a simple custom audio player replacement for the HTML5 audio element
 * - Design based on https://www.mediaelementjs.com but minus ALL their JS and 99% of their CSS
 * - 100% NoJS compatible. This player replaces the native player only if JavaScript is available. Otherwise native player remains.
 * - Note that by replacement we mean replace the native UI. The native audio element remains in the DOM and is controlled by this.
 * TODO: Add support for dragging to adjust the scrubber and volume bars
 * TODO: Add support for arrow keys to adjust the scrubber and volume bars
 * @class AudioPlayer
 */
class AudioPlayer {
  /**
   * Creates an instance of audioPlayer.
   * @param {node} audioElement: The HTML5 audio DOM element to replace
   * @memberof audioPlayer
   */
  constructor(audioElement) {
    this.wrapElement(audioElement);
    this.bindEvents();
  }

  /**
   * Helper function that converts a float of seconds to a string in the form hh:mm:ss
   *
   * @param {float} timeInSeconds:  Number of seconds to convert to a formatted string
   * @returns {string}:             A formatted string hh:mm:ss
   * @memberof audioPlayer
   */
  formatTime(timeInSeconds) {
    // Accept a float but convert to an int as we do not show fractional values in the output
    const seconds = parseInt(timeInSeconds);
    const hours = parseInt(seconds / 3600);
    const mins = parseInt((seconds - hours * 3600) / 60);
    const secs = seconds - (hours * 3600 + mins * 60);
    return `${("00" + hours).slice(-2)}:${("00" + mins).slice(-2)}:${("00" + secs).slice(-2)}`;
  }

  /**
   * Wrap the source HTML5 audio element in the custom markup.
   * - Note: This codebase includes an .hbs template intended to render an HTML5 template element that is used by wrapElement()
   *
   * @param {node} audioElement:  The HTML5 audio element to replace
   * @memberof audioPlayer
   */
  wrapElement(audioElement) {
    // Cache the native HTML audio element
    this.audioElement = audioElement;
    // Get a reference to the custom audio player template
    const template = document.querySelector("#audioPlayerTemplate");
    // Clone the template
    this.player = template.content.firstElementChild.cloneNode(true);
    // Set the id
    this.player.querySelector("#ap-").id = `ap-${audioElement.id}`;
    // Set the static duration time string after first formatting the number of seconds
    this.player.querySelector(".ap-duration").innerText = this.formatTime(audioElement.dataset["length"]);
    //
    // Append the new player as a sibling of the native audio element
    audioElement.parentNode.appendChild(this.player, audioElement);
    // Hide the native HTML5 audio element
    audioElement.style.display = "none";
  }

  /**
   * Binds various event handlers to this instance including clicks as well as callbacks from the underlying HTML5 audio element
   *
   * @memberof audioPlayer
   */
  bindEvents() {
    // Play/Pause
    this.player.querySelectorAll(".styled-player button[title=Play]").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();

        // Get the nativePlayer element that is wrapped in this custom player skin
        const audioElement = this.audioElement;

        // Toggle the state of the native player between paused and play
        if (audioElement.paused) {
          e.target.title = "Pause";
          e.target.ariaLabel = "Pause";
          audioElement.play();
        } else {
          e.target.title = "Play";
          e.target.ariaLabel = "Play";
          audioElement.pause();
        }

        // Toggle the svg sprite icon
        ["ap-play", "ap-pause"].map((btn) => e.target.parentNode.classList.toggle(btn));
      });
    });

    // Volume
    this.player.querySelector(".ap-horizontal-volume-slider").addEventListener("click", (e) => {
      // This markup is still borrowed from mediaelement.js and they have this slider wrapped in an <a> for some reason.
      e.preventDefault();
      // Get the horizontal click position as a value between 0 and 1
      const rect = e.currentTarget.getBoundingClientRect();
      // Set the volume to the normalised horizontal position (e.g. 0=no volume and 1=max volume)
      this.audioElement.volume = (e.clientX - rect.left) / rect.width;
    });

    // Mute
    this.player.querySelector(".ap-volume-button").addEventListener("click", (e) => {
      // Get the nativePlayer element that is wrapped in this custom player skin
      const audioElement = this.audioElement;

      // Toggle the state of the native player between mute and unmute
      if (audioElement.muted) {
        e.target.title = "Mute";
        e.target.ariaLabel = "Mute";
        audioElement.muted = false;
      } else {
        e.target.title = "Unmute";
        e.target.ariaLabel = "Unmute";
        audioElement.muted = true;
      }

      // Toggle the svg sprite icon
      ["ap-mute", "ap-unmute"].map((div) => e.target.parentNode.classList.toggle(div));
    });

    // Seek
    this.player.querySelector(".ap-time-slider").addEventListener("click", (e) => {
      const audioElement = this.audioElement;
      // Get the horizontal click position as a value between 0 and 1
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      // Set the current time as a percentage of the position
      audioElement.currentTime = audioElement.duration * pos;
    });

    // UI feedback elements including buffer bar, progress bar and elapsed time
    // TODO: This is brute-forceish as we udpate everything 4x a second even if it has not changed. Some should be event driven.
    this.audioElement.addEventListener("timeupdate", () => {
      const audioElement = this.audioElement;
      const player = this.player;

      const elapsed = audioElement.currentTime;
      const duration = audioElement.duration;
      const progress = elapsed / duration;
      const buffered = audioElement.buffered.end(0) / duration;
      const volume = `${audioElement.volume * 100}%`;
      // Update the current time display
      player.querySelector(".ap-currenttime-container .ap-currenttime").innerText = this.formatTime(elapsed);

      // Update the buffer bar
      player.querySelector(".ap-time-slider .ap-time-loaded").style.transform = `scaleX(${buffered})`;

      // Update the progress bar
      player.querySelector(".ap-time-slider .ap-time-current").style.transform = `scaleX(${progress})`;

      // Update the volume bar

      player.querySelector(".ap-horizontal-volume-current").style.width = volume;
      player.querySelector(".ap-horizontal-volume-current").setAttribute("aria-valuenow", volume);
    });
  }
}
