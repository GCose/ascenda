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
let isPromiseFixed = false;

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

  const scrollTop = window.pageYOffset;
  const viewportHeight = window.innerHeight;

  const sectionTop = promiseSection.offsetTop;
  const sectionHeight = promiseSection.offsetHeight;
  const sectionEnd = sectionTop + sectionHeight - viewportHeight;

  // Calculate scroll progress within the Promise section
  const scrollProgress = Math.max(
    0,
    Math.min(
      1,
      (viewportHeight - (sectionTop - scrollTop)) / (viewportHeight + sectionHeight)
    )
  );

  // Check section states
  const isBeforeSection = scrollTop < sectionTop;
  const isInSection = scrollTop >= sectionTop && scrollTop <= sectionEnd;
  const isAfterSection = scrollTop > sectionEnd;

  // State 1: Before Promise Section
  if (isBeforeSection) {
    if (isPromiseCompleted || isPromiseFixed) {
      isPromiseCompleted = false;
      isPromiseFixed = false;
      promiseSection.classList.remove("completed", "is-fixed");
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

  // State 2: In Promise Section
  if (isInSection) {
    if (isPromiseCompleted) {
      isPromiseCompleted = false;
      promiseSection.classList.remove("completed");
    }

    if (!isPromiseFixed) {
      isPromiseFixed = true;
      promiseSection.classList.add("is-fixed");
    }
  }

  // State 3: After Promise Section - Exit Strategy
  if (isAfterSection) {
    if (isPromiseFixed && !isPromiseCompleted) {
      isPromiseFixed = false;
      isPromiseCompleted = true;
      promiseSection.classList.remove("is-fixed");
      promiseSection.classList.add("completed");
    }
    return;
  }

  // State 2: In Promise Section - Active Scroll Effects


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
