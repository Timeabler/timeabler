const FRIEND_NAME = "Frosty";

const snapshots = [
  {
    src: "assets/The court of snowmen will decide your fate.png",
    alt: "The court of snowmen will decide your fate.",
    caption: "The court of snowmen will decide your fate.",
  },
  {
    src: "assets/Yed toon.png",
    alt: "Why is bro so horny",
    caption: "Why is bro so horny.",
  },
  {
    src: "assets/coddy sucking.png",
    alt: "I don't why I have so much of this kind of photos",
    caption: "I don't why I have so much of this kind of photos.",
  },
  {
    src: "assets/BALLS.png",
    alt: "A hat in jick",
    caption: "A hat in jick.",
  },
];

const memories = [
  {
    id: "memory-1",
    title: "A state of well-being characterized by emotions ranging from contentment to intense joy; often signaled by a smile or a sense of deep satisfaction.",
    prompt: "Type the word that describes the question.",
    answer: "Happy",
    memory:
      "We were both way too tired and everything was funny, but that one word completely broke us.",
  },
  {
    id: "memory-2",
    title: "The emergence of a new individual from the body of its parent; the beginning or origin of a life, process, or era.",
    prompt:
      "Type the word that describes the question.",
    answer: "Birth",
    memory:
      "Blankets, a ridiculous watchlist, and the exact right amount of chaos in the group chat.",
  },
  {
    id: "memory-3",
    title: "A period of twenty-four hours, traditionally measured from one midnight to the next, or the interval of time during which the sun is above the horizon.",
    prompt: "Type the word that describes the question.",
    answer: "day",
    memory:
      "Our unofficial HQ. No matter how the day was going, that place reset everything.",
  },
];

function setupFriendName() {
  const nameEls = [
    document.getElementById("friend-name"),
    document.getElementById("friend-name-letter"),
  ];
  nameEls.forEach((el) => {
    if (el) el.textContent = FRIEND_NAME;
  });
}

function setupMusic() {
  const gate = document.getElementById("music-gate");
  const enterButton = document.getElementById("enter-experience");
  const toggle = document.getElementById("music-toggle");
  const audio = document.getElementById("bg-music");

  if (!gate || !enterButton || !toggle || !audio) return;

  let isPlaying = false;

  function setToggleIcon() {
    toggle.textContent = isPlaying ? "⏸" : "▶";
  }

  async function playMusic() {
    try {
      await audio.play();
      isPlaying = true;
      setToggleIcon();
    } catch (err) {
      console.warn("Autoplay was blocked, user must interact.", err);
    }
  }

  enterButton.addEventListener("click", async () => {
    gate.style.opacity = "0";
    gate.style.pointerEvents = "none";
    setTimeout(() => {
      gate.style.display = "none";
    }, 260);
    await playMusic();
  });

  toggle.addEventListener("click", () => {
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      isPlaying = true;
    } else {
      audio.pause();
      isPlaying = false;
    }
    setToggleIcon();
  });

  document.addEventListener("visibility", () => {
    if (document.hidden && !audio.paused) {
      audio.pause();
      isPlaying = false;
      setToggleIcon();
    }
  });
}

function createPuzzleCard(memory, onSolved) {
  const card = document.createElement("article");
  card.className = "puzzle-card glass";
  card.dataset.memoryId = memory.id;

  const content = document.createElement("div");
  content.className = "puzzle-card-content";

  const header = document.createElement("div");
  header.className = "puzzle-card-header";

  const tag = document.createElement("span");
  tag.className = "puzzle-tag";
  tag.textContent = "Puzzle";

  const pill = document.createElement("span");
  pill.className = "pill";
  pill.textContent = "Locked";

  header.appendChild(tag);
  header.appendChild(pill);

  const title = document.createElement("h3");
  title.className = "puzzle-title";
  title.textContent = memory.title;

  const body = document.createElement("p");
  body.className = "puzzle-body";
  body.textContent = memory.prompt;

  const inputRow = document.createElement("div");
  inputRow.className = "puzzle-input-row";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type your answer here";
  input.autocomplete = "off";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Unlock";

  inputRow.appendChild(input);
  inputRow.appendChild(button);

  const feedback = document.createElement("div");
  feedback.className = "puzzle-feedback puzzle-locked-hint";
  feedback.textContent = "You can do it!";

  content.appendChild(header);
  content.appendChild(title);
  content.appendChild(body);
  content.appendChild(inputRow);
  content.appendChild(feedback);
  card.appendChild(content);

  card.addEventListener("transitionend", (ev) => {
    if (
      ev.propertyName === "opacity" &&
      card.classList.contains("puzzle-card-vanish")
    ) {
      card.remove();
    }
  });

  let solved = false;

  function checkAnswer() {
    if (solved) return;
    const guess = input.value.trim().toLowerCase();
    const correct = (memory.answer || "").trim().toLowerCase();

    if (!guess) {
      feedback.textContent = "Type something first :3";
      feedback.classList.remove("ok", "error");
      feedback.classList.add("error");
      return;
    }

    if (guess === correct && correct.length > 0) {
      solved = true;
      feedback.textContent = "Unlocked!";
      feedback.classList.remove("error");
      feedback.classList.add("ok");
      pill.textContent = "Unlocked";
      pill.style.borderColor = "rgba(189, 220, 252, 0.95)";
      pill.style.background = "rgba(8, 30, 60, 0.9)";
      card.classList.add("puzzle-card-vanish");
      if (typeof onSolved === "function") onSolved();
    } else {
      feedback.textContent = "Not quite, try another word or spelling.";
      feedback.classList.remove("ok");
      feedback.classList.add("error");
      card.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-4px)" },
          { transform: "translateX(4px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 180, easing: "ease-out" }
      );
    }
  }

  button.addEventListener("click", checkAnswer);
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      checkAnswer();
    }
  });

  return card;
}

function setupPuzzles() {
  const grid = document.getElementById("puzzle-grid");
  const letterOverlay = document.getElementById("letter-overlay");
  const pageFlipAudio = document.getElementById("page-flip-sfx");
  if (!grid) return;
  grid.innerHTML = "";

  let solvedCount = 0;

  function openLetterOverlay() {
    if (!letterOverlay) return;
    letterOverlay.classList.add("letter-overlay-open");
    letterOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (pageFlipAudio) {
      try {
        pageFlipAudio.currentTime = 0;
        pageFlipAudio.play();
      } catch (e) {
        // ignore autoplay issues
      }
    }
  }

  function closeLetterOverlay() {
    if (!letterOverlay) return;
    letterOverlay.classList.remove("letter-overlay-open");
    letterOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (letterOverlay) {
    letterOverlay.addEventListener("click", (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.letterClose === "true") {
        closeLetterOverlay();
      }
    });
  }

  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape") return;
    if (!letterOverlay) return;
    if (letterOverlay.classList.contains("letter-overlay-open")) {
      closeLetterOverlay();
    }
  });

  function handleSolved() {
    solvedCount += 1;
    if (solvedCount === memories.length) {
      openLetterOverlay();
    }
  }

  memories.forEach((memory) => {
    const card = createPuzzleCard(memory, handleSolved);
    grid.appendChild(card);
  });
}

function setupStatCounters() {
  const cards = document.querySelectorAll(".stat-card");
  if (!cards.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        const el = entry.target;
        const numberEl = el.querySelector(".stat-number");
        const target = parseInt(
          el.getAttribute("data-count-target") || "0",
          10
        );
        if (!numberEl || !target || Number.isNaN(target)) return;

        const duration = 1100;
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.floor(target * eased);
          numberEl.textContent = value.toLocaleString();
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            numberEl.textContent = target.toLocaleString();
          }
        }

        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 }
  );

  cards.forEach((card) => observer.observe(card));
}

function setupSnapshots() {
  const openBtn = document.getElementById("open-snapshots");
  const viewer = document.getElementById("snapshot-viewer");
  const closeBtn = document.getElementById("snapshot-close");
  const prevBtn = document.getElementById("snapshot-prev");
  const nextBtn = document.getElementById("snapshot-next");
  const img = document.getElementById("snapshot-img");
  const caption = document.getElementById("snapshot-caption");
  const count = document.getElementById("snapshot-count");
  const zoomInBtn = document.getElementById("snapshot-zoom-in");
  const zoomOutBtn = document.getElementById("snapshot-zoom-out");
  const zoomResetBtn = document.getElementById("snapshot-zoom-reset");

  if (
    !openBtn ||
    !viewer ||
    !closeBtn ||
    !prevBtn ||
    !nextBtn ||
    !img ||
    !caption ||
    !count ||
    !zoomInBtn ||
    !zoomOutBtn ||
    !zoomResetBtn
  ) {
    return;
  }

  let index = 0;
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let baseW = 0;
  let baseH = 0;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function applyTransform() {
    img.style.setProperty("--zoom", String(zoom));
    img.style.setProperty("--pan-x", `${panX}px`);
    img.style.setProperty("--pan-y", `${panY}px`);
    if (zoom > 1) img.classList.add("is-zoomed");
    else img.classList.remove("is-zoomed");
  }

  function resetView() {
    zoom = 1;
    panX = 0;
    panY = 0;
    applyTransform();
  }

  function clampPan() {
    const stage = img.parentElement;
    if (!stage) return;
    const stageRect = stage.getBoundingClientRect();
    const maxX = Math.max(0, (baseW * zoom - stageRect.width) / 2);
    const maxY = Math.max(0, (baseH * zoom - stageRect.height) / 2);
    panX = clamp(panX, -maxX, maxX);
    panY = clamp(panY, -maxY, maxY);
  }

  function render() {
    const item = snapshots[index];
    if (!item) return;
    const handleLoaded = () => {
      resetView();
      const stage = img.parentElement;
      if (stage && img.naturalWidth && img.naturalHeight) {
        const stageRect = stage.getBoundingClientRect();
        const scale = Math.min(
          stageRect.width / img.naturalWidth,
          stageRect.height / img.naturalHeight
        );
        baseW = img.naturalWidth * scale;
        baseH = img.naturalHeight * scale;
      } else {
        const rect = img.getBoundingClientRect();
        baseW = rect.width;
        baseH = rect.height;
      }
      clampPan();
      applyTransform();
    };

    img.onload = handleLoaded;
    img.src = item.src;
    img.alt = item.alt || "";
    caption.textContent = item.caption || "";
    count.textContent = `${index + 1} / ${snapshots.length}`;

    if (img.complete) {
      handleLoaded();
    }
  }

  function openViewer() {
    viewer.classList.add("snapshot-viewer-open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    render();
    closeBtn.focus();
  }

  function closeViewer() {
    viewer.classList.remove("snapshot-viewer-open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    openBtn.focus();
  }

  function prev() {
    index = (index - 1 + snapshots.length) % snapshots.length;
    render();
  }

  function next() {
    index = (index + 1) % snapshots.length;
    render();
  }

  openBtn.addEventListener("click", () => {
    index = 0;
    openViewer();
  });

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);
  closeBtn.addEventListener("click", closeViewer);

  viewer.addEventListener("click", (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.snapshotClose === "true") closeViewer();
  });

  document.addEventListener("keydown", (ev) => {
    const isOpen = viewer.classList.contains("snapshot-viewer-open");
    if (!isOpen) return;
    if (ev.key === "Escape") closeViewer();
    if (ev.key === "ArrowLeft") prev();
    if (ev.key === "ArrowRight") next();
  });

  zoomInBtn.addEventListener("click", () => {
    zoom = clamp(zoom + 0.5, 1, 3);
    clampPan();
    applyTransform();
  });

  zoomOutBtn.addEventListener("click", () => {
    zoom = clamp(zoom - 0.5, 1, 3);
    clampPan();
    applyTransform();
  });

  zoomResetBtn.addEventListener("click", () => {
    resetView();
  });

  img.addEventListener("click", () => {
    if (zoom === 1) zoom = 2.2;
    else zoom = 1;
    clampPan();
    applyTransform();
  });

  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let startPanX = 0;
  let startPanY = 0;

  img.addEventListener("pointerdown", (ev) => {
    if (zoom <= 1) return;
    isPanning = true;
    img.classList.add("is-panning");
    img.setPointerCapture(ev.pointerId);
    startX = ev.clientX;
    startY = ev.clientY;
    startPanX = panX;
    startPanY = panY;
  });

  img.addEventListener("pointermove", (ev) => {
    if (!isPanning) return;
    panX = startPanX + (ev.clientX - startX);
    panY = startPanY + (ev.clientY - startY);
    clampPan();
    applyTransform();
  });

  img.addEventListener("pointerup", () => {
    if (!isPanning) return;
    isPanning = false;
    img.classList.remove("is-panning");
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupFriendName();
  setupMusic();
  setupSnapshots();
  setupPuzzles();
  setupStatCounters();
});


