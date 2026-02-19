(function () {
  const audio = document.getElementById("bg-audio");
  const button = document.getElementById("bg-toggle");
  if (!button || !audio) return;

  function setState(isPlaying) {
    button.setAttribute("aria-pressed", isPlaying ? "true" : "false");
    button.setAttribute(
      "aria-label",
      isPlaying ? "Pause background audio" : "Play background audio",
    );
  }

  button.addEventListener("click", function () {
    if (audio.paused) {
      audio
        .play()
        .then(() => setState(true))
        .catch(() => {
          setState(false);
        });
    } else {
      audio.pause();
      setState(false);
    }
  });

  audio.addEventListener("play", () => {
    setState(true);
  });
  audio.addEventListener("pause", () => {
    setState(false);
  });

  setState(!audio.paused);
})();
