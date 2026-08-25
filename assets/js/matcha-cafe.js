(() => {
  const cafe = document.querySelector(".matcha-cafe-shell");
  if (!cafe) return;

  const steps = {
    intro: cafe.querySelector(".matcha-cafe-step--intro"),
    choose: cafe.querySelector(".matcha-cafe-step--choose"),
    making: cafe.querySelector(".matcha-cafe-step--making")
  };
  const progress = [...cafe.querySelectorAll(".matcha-cafe-progress span")];
  const progressLabel = cafe.querySelector(".matcha-cafe-progress");
  const shopCanvas = cafe.querySelector(".matcha-cafe-shop-canvas");
  const processCanvas = cafe.querySelector(".matcha-cafe-process-canvas");
  const speechBubble = cafe.querySelector(".matcha-cafe-speech");
  const context = shopCanvas.getContext("2d");
  const processContext = processCanvas.getContext("2d");
  const openShop = new Image();
  const cleanCurtain = new Image();
  const closedSign = new Image();
  const shopForeground = new Image();
  const sourceWidth = 1024;
  const sourceHeight = 1536;
  let imagesReady = 0;
  let openingRequested = false;
  let processRun = 0;

  const processSteps = [
    { src: "/assets/images/matcha-step-powder.png", duration: 12000, label: "Adding matcha powder from the tin to the bowl", speech: "I'm brewing a calming matcha for you" },
    { src: "/assets/images/matcha-step-water.png", duration: 12000, label: "Adding hot water to the matcha bowl", speech: "I'm pouring it gently, nice and slow" },
    { src: "/assets/images/matcha-step-whisk.png", duration: 36000, label: "Whisking the matcha", speech: "Now I'm whisking it until it's smooth" },
    { src: "/assets/images/matcha-step-smell.png", duration: 30000, label: "Smelling the freshly prepared matcha" },
    { src: "/assets/images/matcha-step-sip.png", duration: 30000, label: "Taking a calm sip of matcha" }
  ].map((step) => {
    const image = new Image();
    image.src = `${step.src}?v=20260814-1`;
    return { ...step, image };
  });

  const smootherStep = (progress) => (
    progress * progress * progress * (progress * (progress * 6 - 15) + 10)
  );

  const drawOpeningProgress = (progress) => {
    const canvasWidth = shopCanvas.width;
    const canvasHeight = shopCanvas.height;
    const scaleX = canvasWidth / sourceWidth;
    const scaleY = canvasHeight / sourceHeight;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(openShop, 0, 0, canvasWidth, canvasHeight);
    if (progress >= 1) return;

    const easedProgress = smootherStep(progress);
    const curtainLeft = 138;
    const curtainTop = 68;
    const curtainWidth = 750;
    const closedCurtainHeight = 857;
    const openCurtainHeight = 210;
    const currentCurtainHeight = closedCurtainHeight - easedProgress * (closedCurtainHeight - openCurtainHeight);
    const fabricBulge = Math.sin(progress * Math.PI) * 12 * scaleX;
    const destinationLeft = curtainLeft * scaleX - (fabricBulge / 2);
    const destinationTop = curtainTop * scaleY;
    const destinationWidth = curtainWidth * scaleX + fabricBulge;
    const destinationHeight = currentCurtainHeight * scaleY;

    // Hide the original whisking hands while the café is fully closed, then
    // reveal them as soon as the fabric begins rolling upward.
    const concealProgress = Math.min(progress / .14, 1);
    const concealedBottom = 1012 - concealProgress * 87;
    const concealedHeight = Math.max(0, Math.min(concealedBottom, 1003) - 925);
    context.clearRect(292 * scaleX, 925 * scaleY, 384 * scaleX, concealedHeight * scaleY);

    // Compress the same closed curtain upward instead of clipping it away.
    context.save();
    context.globalAlpha = progress > .82 ? (1 - progress) / .18 : 1;
    context.drawImage(
      cleanCurtain,
      curtainLeft, curtainTop, curtainWidth, closedCurtainHeight,
      destinationLeft, destinationTop, destinationWidth, destinationHeight
    );

    // A narrow doubled fabric edge makes the upward motion read as rolling.
    if (progress > .03 && progress < .92) {
      const rollHeight = (14 + Math.sin(progress * Math.PI) * 12) * scaleY;
      context.globalAlpha = Math.min(1, progress * 5) * (progress > .82 ? (1 - progress) / .1 : 1);
      context.drawImage(
        cleanCurtain,
        curtainLeft, 840, curtainWidth, 70,
        destinationLeft, destinationTop + destinationHeight - (rollHeight / 2), destinationWidth, rollHeight
      );
    }

    // The sign is a separate object: it lifts away before the fabric rolls,
    // so its lettering never becomes compressed into the curtain.
    if (progress < .2) {
      const signProgress = smootherStep(progress / .2);
      context.globalAlpha = 1 - signProgress;
      context.translate(0, -signProgress * 14 * scaleY);
      context.drawImage(closedSign, 0, 0, canvasWidth, canvasHeight);
    }
    context.restore();

    // Counter, rear edge, and props always sit in front of the curtain. Keeping
    // them in their own layer prevents the line and tin from being clipped.
    context.drawImage(shopForeground, 0, 0, canvasWidth, canvasHeight);
  };

  const playOpening = () => {
    if (imagesReady < 4) {
      openingRequested = true;
      return;
    }
    openingRequested = false;
    const duration = 4700;
    let startTime;
    speechBubble.hidden = true;
    shopCanvas.setAttribute("aria-label", "The matcha cafe curtain opening to reveal the shop");

    const advance = (time) => {
      if (startTime === undefined) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      drawOpeningProgress(progress);
      if (progress < 1) {
        requestAnimationFrame(advance);
      } else if (cafe.dataset.cafeState === "choose") {
        speechBubble.hidden = false;
      }
    };

    requestAnimationFrame(advance);
  };

  const imageLoaded = () => {
    imagesReady += 1;
    if (imagesReady === 4) {
      drawOpeningProgress(0);
      if (openingRequested) playOpening();
    }
  };
  openShop.addEventListener("load", imageLoaded);
  cleanCurtain.addEventListener("load", imageLoaded);
  closedSign.addEventListener("load", imageLoaded);
  shopForeground.addEventListener("load", imageLoaded);
  openShop.src = "/assets/images/matcha-shop-greeting.png?v=20260814-3";
  cleanCurtain.src = "/assets/images/matcha-curtain-clean.png";
  closedSign.src = "/assets/images/matcha-closed-sign.png";
  shopForeground.src = "/assets/images/matcha-shop-foreground-with-whisk.png?v=20260814-4";

  const drawProcessFrame = (previousImage, currentImage, blend) => {
    const width = processCanvas.width;
    const height = processCanvas.height;
    processContext.clearRect(0, 0, width, height);
    if (previousImage && blend < 1) {
      processContext.globalAlpha = 1 - blend;
      processContext.drawImage(previousImage, 0, 0, width, height);
    }
    processContext.globalAlpha = blend;
    processContext.drawImage(currentImage, 0, 0, width, height);
    processContext.globalAlpha = 1;
    // Reuse one exact counter layer in every phase. This keeps the rear edge
    // continuous and the whisk seated on its holder while poses crossfade.
    processContext.drawImage(shopForeground, 0, 0, width, height);
  };

  const playMatchaProcess = async () => {
    const run = ++processRun;
    await Promise.all(processSteps.map(({ image }) => image.decode()));
    if (run !== processRun || cafe.dataset.cafeState !== "making") return;

    const totalDuration = 120000;
    const transitionDuration = 3200;
    const speechDelay = 3600;
    const stepStarts = processSteps.map((_, index) => (
      processSteps.slice(0, index).reduce((sum, step) => sum + step.duration, 0)
    ));
    let startTime;
    let visibleSpeech = null;

    const advance = (time) => {
      if (run !== processRun || cafe.dataset.cafeState !== "making") return;
      if (startTime === undefined) startTime = time;
      const elapsed = Math.min(time - startTime, totalDuration);
      const stepIndex = Math.max(0, processSteps.findLastIndex((_, index) => elapsed >= stepStarts[index]));
      const stepElapsed = elapsed - stepStarts[stepIndex];
      const blend = smootherStep(Math.min(stepElapsed / transitionDuration, 1));
      const currentStep = processSteps[stepIndex];
      // The first preparation pose grows directly out of the open-cafe scene;
      // later poses continue from the preceding preparation step.
      const previousImage = stepIndex > 0 ? processSteps[stepIndex - 1].image : shopCanvas;

      processCanvas.setAttribute("aria-label", currentStep.label);
      drawProcessFrame(previousImage, currentStep.image, blend);

      const nextSpeech = currentStep.speech && stepElapsed >= speechDelay ? currentStep.speech : null;
      if (nextSpeech !== visibleSpeech) {
        visibleSpeech = nextSpeech;
        speechBubble.hidden = !nextSpeech;
        if (nextSpeech) {
          speechBubble.textContent = nextSpeech;
          speechBubble.style.animation = "none";
          void speechBubble.offsetWidth;
          speechBubble.style.animation = "";
        }
      }

      if (elapsed < totalDuration) {
        requestAnimationFrame(advance);
      } else {
        drawProcessFrame(null, processSteps.at(-1).image, 1);
        speechBubble.hidden = true;
      }
    };

    requestAnimationFrame(advance);
  };

  const setState = (state) => {
    const index = ["intro", "choose", "making"].indexOf(state);
    cafe.dataset.cafeState = state;
    Object.entries(steps).forEach(([name, element]) => {
      element.hidden = name !== state;
    });
    progress.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
    progressLabel.setAttribute("aria-label", `Step ${index + 1} of 3`);

    if (state === "choose") {
      playOpening();
    } else if (state === "making") {
      speechBubble.hidden = true;
      // Seed the preparation canvas with the exact final opening frame before
      // swapping canvases, preventing a blank frame or a visual scene cut.
      drawProcessFrame(null, shopCanvas, 1);
      processCanvas.hidden = false;
      shopCanvas.hidden = true;
      playMatchaProcess();
    }
  };

  cafe.querySelector(".matcha-cafe-order").addEventListener("click", () => setState("choose"));
  cafe.querySelectorAll(".matcha-cafe-card").forEach((card) => {
    card.addEventListener("click", () => setState("making"));
  });
})();
