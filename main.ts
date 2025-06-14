const bgWrapper = document.querySelector(".bg-wrapper")!;

const PERCENT_PER_SECOND = 5;
const PERCENT_PER_MS = PERCENT_PER_SECOND / 1000;
const MOVEMENT_INTERVAL_MS = 5;
const CYCLE_TIME_SECONDS = 100 / PERCENT_PER_SECOND;

function setScrollAnimation(element: HTMLElement, order: number = 0) {
  let yMovement = 0;

  for (const child of element.children) {
    randomizeBg(child as HTMLElement);
  }

  function reset() {
    yMovement -= 300;
    for (const child of element.children) {
      randomizeBg(child as HTMLElement);
    }
  }

  let resetInterval = 0;

  const resetTimeout = setTimeout(() => {
    reset();
    resetInterval = setInterval(() => {
      reset();
    }, CYCLE_TIME_SECONDS * 1000 * 3);
  }, CYCLE_TIME_SECONDS * 1000 * (order + 1));

  let movementInterval = setInterval(() => {
    yMovement += PERCENT_PER_MS * MOVEMENT_INTERVAL_MS;
    const movementProperty = `translateY(${yMovement * -1}%)`;
    element.style.transform = movementProperty;
  }, MOVEMENT_INTERVAL_MS);

  window.addEventListener("blur", () => {
    clearInterval(movementInterval);
    clearInterval(resetInterval);
    clearTimeout(resetTimeout);
  });
}

let isBlur = false;

window.addEventListener("blur", () => {
  isBlur = true;
});

function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderBg(xAmount: number) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const elementSize = width / xAmount;
  const yAmount = Math.ceil(height / elementSize);
  const totalElements = xAmount * yAmount;
  for (let i = 0; i < 3; i++) {
    const bgPlane = document.createElement("div");
    bgPlane.classList.add("bg");
    bgPlane.style.setProperty("--x", xAmount.toString());
    bgPlane.style.setProperty("--y", yAmount.toString());
    for (let j = 0; j < totalElements; j++) {
      const bgEl = document.createElement("div");
      bgEl.classList.add("bg-el");
      bgPlane.appendChild(bgEl);
    }
    bgWrapper.appendChild(bgPlane);

    window.addEventListener("focus", () => {
      if (!isBlur) return;
      setScrollAnimation(bgPlane, i);
    });
    setScrollAnimation(bgPlane, i);
  }
}

const x = window.innerWidth > window.innerHeight ? 12 : 4;

renderBg(x);

function randomizeBg(element: HTMLElement) {
  const BGdata = [
    { chance: 100, data: "coal_ore.png" },
    { chance: 50, data: "copper_ore.png" },
    { chance: 25, data: "gold_ore.png" },
  ];
  const bgUrl = computeChance(BGdata, "stone.png");

  element.style.backgroundImage = `url(./img/${bgUrl})`;
}

type Entity<T> = {
  chance: number;
  data: T;
};

function computeChance<T>(
  entities: Entity<T>[],
  standard: T,
  base: number = 1000
): T {
  const totalPercentage = entities.reduce((acc, x) => acc + x.chance, 0);
  if (totalPercentage > base) throw Error(`Percentage exceeds 100%`);
  const fixedPercentages: Entity<T>[] = [];
  let acc = 0;
  entities.forEach((el) => {
    fixedPercentages.push({ chance: acc + el.chance, data: el.data });
    acc += el.chance;
  });

  let returned: null | T = null;

  const random = randomRange(0, base);
  fixedPercentages.forEach((el) => {
    if (random < el.chance) {
      if (!returned) {
        returned = el.data;
      }
    }
  });

  if (!returned) {
    returned = standard;
  }

  return returned;
}
