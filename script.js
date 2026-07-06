const intro = document.querySelector("#intro");
const introVideo = document.querySelector(".intro-video");
const bootTextTargets = document.querySelectorAll("[data-boot-text]");
const hero = document.querySelector(".hero");
const hackerImageWrap = document.querySelector(".hacker-image-wrap");

let introFinished = false;
let fallbackTimer;
let panelsBooted = false;

function typeText(target, text, speed = 58) {
  if (!target) return Promise.resolve();

  target.textContent = "";

  return new Promise((resolve) => {
    let index = 0;
    const timer = window.setInterval(() => {
      target.textContent += text.charAt(index);
      index += 1;

      if (index >= text.length) {
        window.clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

async function typeBootLines() {
  for (const target of bootTextTargets) {
    await typeText(target, target.dataset.bootText || "", 34);
    await new Promise((resolve) => window.setTimeout(resolve, 220));
  }
}

function finishIntro() {
  if (introFinished) return;

  introFinished = true;
  document.body.classList.remove("intro-active");
  intro?.setAttribute("aria-hidden", "true");
  introVideo?.pause();
  hero?.classList.add("hero-zap");
  hackerImageWrap?.classList.add("eye-flicker");
  bootPanelsOnScroll();
}

function bootPortfolio() {
  const fallbackRevealDelay = 15000;
  fallbackTimer = window.setTimeout(finishIntro, fallbackRevealDelay);
  typeBootLines();

  function syncIntroDuration() {
    if (!introVideo?.duration || !Number.isFinite(introVideo.duration)) return;

    const introMs = Math.max(introVideo.duration * 1000, 4000);
    document.documentElement.style.setProperty("--intro-duration", `${introMs}ms`);
    window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(finishIntro, introMs + 100);
  }

  introVideo?.addEventListener(
    "ended",
    () => {
      window.clearTimeout(fallbackTimer);
      finishIntro();
    },
    { once: true }
  );
  introVideo?.addEventListener("loadedmetadata", syncIntroDuration, { once: true });
  syncIntroDuration();

  if (introVideo) {
    const playAttempt = introVideo.play();
    if (playAttempt) {
      playAttempt.catch(() => {
        introVideo.style.display = "none";
      });
    }
  }
}

function bootPanelsOnScroll() {
  if (panelsBooted) return;
  panelsBooted = true;

  const panels = document.querySelectorAll(
    ".terminal-card, .main-panel, .experience-strip, .site-footer"
  );

  panels.forEach((panel) => panel.classList.add("boot-panel"));

  if (!("IntersectionObserver" in window)) {
    panels.forEach((panel) => panel.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.16,
    }
  );

  panels.forEach((panel) => observer.observe(panel));
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

window.addEventListener("load", bootPortfolio);
