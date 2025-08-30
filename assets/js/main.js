/**=============================
 * Initialize Website Features
 =============================*/
function init() {
  initLoadingScreen();
  initSmoothScrolling();
  initChallengesAnimation();
  initPromiseSection();
}

/**==================
 * Loading Screen
 ===================*/
function initLoadingScreen() {
  const panelLeft = document.getElementById("panelLeft");
  const panelRight = document.getElementById("panelRight");
  const overlay = document.getElementById("loadingOverlay");

  if (!panelLeft || !panelRight || !overlay) return;

  setTimeout(() => {
    panelLeft.classList.add("opening");
    panelRight.classList.add("opening");

    setTimeout(() => {
      overlay.style.display = "none";
      const hero = document.querySelector(".hero");
      if (hero) hero.classList.add("loaded");
    }, 1500);
  }, 3000);
}

/**=======================
 * Lenis Smooth Scrolling
 ========================*/
function initSmoothScrolling() {
  lenis = new Lenis({
    lerp: 0.05,
    duration: 6,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: "vertical",
    gestureDirection: "vertical",
    smooth: true,
    mouseMultiplier: 0.5,
    smoothTouch: true,
    touchMultiplier: 2,
    infinite: false,
    autoResize: true,
    syncTouch: true,
    touchInertiaMultiplier: 35,
    wheelMultiplier: 0.8,
  });

  lenis.on("scroll", (e) => {
    updatePromiseScrollEffects();
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/**=======================
 * Challenges Animation
 ========================*/
function initChallengesAnimation() {
  const challengeItems = document.querySelectorAll(".challenges__item");
  if (challengeItems.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  challengeItems.forEach((item) => observer.observe(item));
}

/**===============================
 * PROMISE SECTION CONTROLLER
 ================================*/
let promiseSection, videoStage, journey, scene, contentPoints;
let isJourneyActive = false;
let isPromiseCompleted = false;
let lastScrollDirection = null;

function initPromiseSection() {
  promiseSection = document.querySelector(".promise");
  videoStage = document.getElementById("videoStage");
  journey = document.getElementById("journey3D");
  scene = document.getElementById("journeyScene");
  contentPoints = document.querySelectorAll(".content__point");

  if (
    !promiseSection ||
    !videoStage ||
    !journey ||
    !scene ||
    contentPoints.length === 0
  )
    return;

  // Initialize state based on current classes
  isPromiseCompleted = promiseSection.classList.contains("completed");

  updatePromiseScrollEffects();
}

function updatePromiseScrollEffects() {
  if (!promiseSection) return;

  const rect = promiseSection.getBoundingClientRect();
  const sectionTop = rect.top;
  const sectionHeight = rect.height;
  const viewportHeight = window.innerHeight;

  // Calculate scroll progress within the Promise section
  const scrollProgress = Math.max(
    0,
    Math.min(
      1,
      (viewportHeight - sectionTop) / (viewportHeight + sectionHeight)
    )
  );

  // Determine scroll direction
  const currentScrollY = window.pageYOffset;
  const scrollDirection =
    currentScrollY > (updatePromiseScrollEffects.lastScrollY || 0)
      ? "down"
      : "up";
  updatePromiseScrollEffects.lastScrollY = currentScrollY;

  // Check if we're beyond the Promise section
  const isAfterSection = sectionTop + sectionHeight < viewportHeight;
  const isBeforeSection = sectionTop > viewportHeight;

  console.log("=== DEBUG ===");
  console.log("sectionTop:", sectionTop);
  console.log("sectionHeight:", sectionHeight);
  console.log("viewportHeight:", viewportHeight);
  console.log("scrollProgress:", scrollProgress);
  console.log("isBeforeSection:", isBeforeSection);
  console.log("isAfterSection:", isAfterSection);
  console.log("=============");

  // State 1: Before Promise Section
  if (isBeforeSection) {
    if (isPromiseCompleted) {
      isPromiseCompleted = false;
      promiseSection.classList.remove("completed", "exiting");
    }

    videoStage.classList.remove("visible");
    journey.classList.remove("active");
    isJourneyActive = false;

    // Reset all content points
    contentPoints.forEach((point) => {
      point.classList.remove("active", "passed");
    });
    return;
  }

  // State 3: After Promise Section - Exit Strategy
  if (isAfterSection) {
    if (!isPromiseCompleted) {
      isPromiseCompleted = true;

      // Add exiting class for transition
      promiseSection.classList.add("exiting");

      // After transition completes, add completed class
      setTimeout(() => {
        promiseSection.classList.remove("exiting");
        promiseSection.classList.add("completed");

        // Ensure final state for fixed elements
        videoStage.style.position = "absolute";
        videoStage.style.top = "auto";
        videoStage.style.bottom = "0";
        videoStage.style.left = "0";
        videoStage.style.transform = "none";
        videoStage.style.width = "100%";
        videoStage.style.height = "100vh";
        videoStage.classList.add("visible");

        journey.style.position = "absolute";
        journey.style.top = "auto";
        journey.style.bottom = "0";
        journey.style.left = "0";
        journey.style.width = "100%";
        journey.style.height = "100vh";
        journey.classList.add("active");

        // Show final content state
        contentPoints.forEach((point) => {
          point.classList.add("active");
          point.classList.remove("passed");
        });
      }, 800); // Match transition duration in CSS
    }
    return;
  }

  // State 2: In Promise Section - Active Scroll Effects

  // Handle returning from completed state
  if (isPromiseCompleted && scrollDirection === "up") {
    isPromiseCompleted = false;
    promiseSection.classList.remove("completed");

    // Reset to fixed positioning
    videoStage.style.position = "fixed";
    videoStage.style.top = "50%";
    videoStage.style.left = "50%";
    videoStage.style.bottom = "auto";
    videoStage.style.width = "100vw";
    videoStage.style.height = "100vh";

    journey.style.position = "fixed";
    journey.style.top = "0";
    journey.style.left = "0";
    journey.style.bottom = "auto";
    journey.style.width = "100vw";
    journey.style.height = "100vh";
  }

  // Show video at 15% into the section
  if (scrollProgress >= 0.15) {
    videoStage.classList.add("visible");
  } else {
    videoStage.classList.remove("visible");
    journey.classList.remove("active");
    isJourneyActive = false;
    contentPoints.forEach((point) => {
      point.classList.remove("active", "passed");
    });
    return;
  }

  // Phase 1: Video scaling (15% to 25% progress)
  if (scrollProgress >= 0.15 && scrollProgress <= 0.25) {
    const scaleProgress = (scrollProgress - 0.15) / 0.1;
    const scaleValue = 0.4 + scaleProgress * 0.6; // Scale from 0.4 to 1.0

    videoStage.style.transform = `translate(-50%, -50%) scale(${scaleValue})`;

    // Deactivate journey during video scaling
    journey.classList.remove("active");
    isJourneyActive = false;

    // Reset all content points
    contentPoints.forEach((point) => {
      point.classList.remove("active", "passed");
    });
  }

  // Phase 2: 3D Journey (30% to 100% progress)
  else if (scrollProgress > 0.3) {
    // Ensure video is fully scaled
    videoStage.style.transform = `translate(-50%, -50%) scale(1)`;

    // Activate journey
    if (!isJourneyActive) {
      journey.classList.add("active");
      isJourneyActive = true;
    }

    // Calculate journey progress (30% to 100% becomes 0 to 1)
    const journeyProgress = (scrollProgress - 0.3) / 0.7;

    // Calculate camera position in 3D space
    const cameraZ = journeyProgress * 12500;

    // Update scene transform to simulate camera movement
    scene.style.transform = `translateZ(${cameraZ}px)`;

    // Update content points visibility
    contentPoints.forEach((point, index) => {
      const pointZ =
        parseInt(point.style.getPropertyValue("--z").replace("px", "")) * -1;
      const relativeZ = pointZ - cameraZ;

      // Point is active when it's in the focal range (-400 to 200px from camera)
      if (relativeZ >= -400 && relativeZ <= 200) {
        if (!point.classList.contains("active")) {
          point.classList.remove("passed");
          point.classList.add("active");
        }
      }
      // Point has been passed
      else if (relativeZ > 200) {
        point.classList.remove("active");
        point.classList.add("passed");
      }
      // Point is still ahead
      else {
        point.classList.remove("active", "passed");
      }
    });
  }

  // Phase 1.5: Pause between video scaling and text reveals (25% to 30% progress)
  else {
    // Keep video fully scaled but don't start text reveals yet
    videoStage.style.transform = `translate(-50%, -50%) scale(1)`;
    journey.classList.remove("active");
    isJourneyActive = false;
    contentPoints.forEach((point) => {
      point.classList.remove("active", "passed");
    });
  }
}

/**================
 * Initialization 
 =================*/
document.addEventListener("DOMContentLoaded", () => {
  init();
  // Fallback scroll listener for browsers that don't support Lenis properly
  let ticking = false;
  function handleFallbackScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (!lenis) {
          updatePromiseScrollEffects();
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", handleFallbackScroll, { passive: true });
});
