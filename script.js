const itemData = {
  paper: {
    name: "구겨진 종이",
    category: "종이류",
    confidence: 86,
    guidance:
      "오염되지 않은 종이는 종이류로 분리배출할 수 있습니다. 단, 물기·음식물·테이프·코팅 여부는 다시 확인해야 합니다.",
    quickGuidance:
      "오염되지 않은 종이는 종이류로 분리배출할 수 있습니다. 물기, 음식물, 테이프, 코팅이 있으면 다시 확인합니다.",
  },
  milk: {
    name: "우유갑",
    category: "종이팩",
    confidence: 82,
    guidance:
      "내용물을 비우고 헹군 뒤 말려서 종이팩 수거함에 배출합니다. 빨대와 비닐은 분리합니다.",
    quickGuidance:
      "내용물을 비우고 헹군 뒤 말려서 종이팩 수거함에 배출합니다. 빨대와 비닐은 분리합니다.",
  },
  cup: {
    name: "플라스틱컵",
    category: "플라스틱",
    confidence: 79,
    guidance:
      "내용물을 비우고 헹군 뒤 플라스틱으로 배출합니다. 오염이 심하면 학교 기준에 따라 다시 확인합니다.",
    quickGuidance:
      "내용물을 비우고 헹군 뒤 플라스틱으로 배출합니다. 오염이 심하면 학교 기준에 따라 다시 확인합니다.",
  },
  snack: {
    name: "과자봉지",
    category: "비닐류 검토",
    confidence: 72,
    guidance:
      "재질과 오염 여부를 확인합니다. 재활용이 어려운 비닐류는 학교 분리배출 기준에 따라 판단합니다.",
    quickGuidance:
      "재질과 오염 여부를 확인합니다. 재활용이 어려운 비닐류는 학교 분리배출 기준에 따라 판단합니다.",
  },
  straw: {
    name: "빨대",
    category: "학교 기준 재확인",
    confidence: 64,
    guidance:
      "작고 오염되기 쉬운 물건은 재활용이 어려울 수 있습니다. 학교 기준과 안내를 확인합니다.",
    quickGuidance:
      "작고 오염되기 쉬운 물건은 재활용이 어려울 수 있습니다. 학교 기준과 안내를 확인합니다.",
  },
};

const metricValues = {};
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let selectedFile = null;
let currentItemKey = "paper";
let resultVisible = false;
let recordFinalized = false;
let loadingTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  initializeCounters();
  bindScrollButtons();
  bindUploadDemo();
  bindResultActions();
  bindQuickApp();
});

function initializeCounters() {
  document.querySelectorAll("[data-counter]").forEach((counter) => {
    const key = counter.dataset.kpi;
    const target = Number(counter.dataset.target || 0);
    metricValues[key] = target;
    animateCounter(counter, 0, target, 1100);
  });
}

function bindScrollButtons() {
  document.querySelectorAll("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.scroll);
      if (!target) return;
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });

      if (button.dataset.scroll === "#demo-card") {
        window.setTimeout(() => document.querySelector("#imageUpload")?.focus(), 450);
      }
    });
  });
}

function bindUploadDemo() {
  const input = document.querySelector("#imageUpload");
  const startButton = document.querySelector("#startAnalysis");
  const dropZone = document.querySelector("#dropZone");

  input.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (file) handleSelectedFile(file);
  });

  startButton.addEventListener("click", () => {
    if (!selectedFile) {
      showDemoMessage("사진을 먼저 업로드하면 AI 1차 추정 시연을 시작할 수 있습니다.", true);
      return;
    }
    runMockAnalysis();
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove("is-dragging");
    });
  });

  dropZone.addEventListener("drop", (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showDemoMessage("사진 파일만 업로드할 수 있습니다.", true);
      return;
    }
    handleSelectedFile(file);
  });
}

function handleSelectedFile(file) {
  selectedFile = file;
  currentItemKey = "paper";
  resultVisible = false;
  recordFinalized = false;
  clearTimeout(loadingTimer);

  const previewWrap = document.querySelector("#previewWrap");
  const previewImage = document.querySelector("#previewImage");
  const objectUrl = URL.createObjectURL(file);

  previewImage.src = objectUrl;
  previewImage.onload = () => URL.revokeObjectURL(objectUrl);
  previewWrap.classList.remove("is-hidden");

  hideResult();
  showDemoMessage("사진이 업로드되었습니다. AI 1차 추정 시연을 시작합니다.", false);
  runMockAnalysis();
}

function runMockAnalysis() {
  if (!selectedFile) {
    showDemoMessage("사진을 먼저 업로드하면 AI 1차 추정 시연을 시작할 수 있습니다.", true);
    return;
  }

  clearTimeout(loadingTimer);
  hideResult();
  resultVisible = false;
  recordFinalized = false;
  currentItemKey = "paper";

  document.querySelector("#loadingState").classList.remove("is-hidden");
  showDemoMessage("AI가 최종 정답을 확정하지 않고 1차 분류만 제안합니다.", false);

  loadingTimer = window.setTimeout(() => {
    document.querySelector("#loadingState").classList.add("is-hidden");
    renderResult("paper");
    resultVisible = true;
    const resultCard = document.querySelector("#resultCard");
    resultCard.classList.remove("is-hidden");
    resultCard.classList.add("is-visible");
  }, 1500);
}

function bindResultActions() {
  document.querySelector("#confirmResult").addEventListener("click", () => {
    if (!ensureResultReady()) return;
    if (recordFinalized) {
      setResultStatus("이미 대시보드에 반영된 기록입니다. 새 사진을 올리면 다시 시연할 수 있습니다.");
      return;
    }

    updateMetric("moments", 1);
    updateMetric("requests", 1);
    updateMetric("paper", 1);
    updateMetric("confirmed", 1);
    recordFinalized = true;
    setResultStatus("대시보드 반영 완료");
  });

  document.querySelector("#reselectItem").addEventListener("click", () => {
    if (!ensureResultReady()) return;
    document.querySelector("#itemChooser").classList.toggle("is-hidden");
    setResultStatus("헷갈리는 물건을 직접 선택해 안내를 다시 확인합니다.");
  });

  document.querySelector("#holdResult").addEventListener("click", () => {
    if (!ensureResultReady()) return;
    if (!recordFinalized) {
      updateMetric("held", 1);
      recordFinalized = true;
    }
    setResultStatus(
      "모르는 물건을 아무 데나 버리지 않는 것도 자원순환 역량입니다. 판단 보류 사례로 기록되었습니다."
    );
  });

  document.querySelectorAll("[data-result-item]").forEach((button) => {
    button.addEventListener("click", () => {
      renderResult(button.dataset.resultItem);
      setResultStatus("선택한 물건 기준으로 안내 카드가 변경되었습니다.");
    });
  });
}

function bindQuickApp() {
  const quickCategory = document.querySelector("#quickCategory");
  const quickGuidance = document.querySelector("#quickGuidance");

  document.querySelectorAll("[data-quick-item]").forEach((button) => {
    button.addEventListener("click", () => {
      const data = itemData[button.dataset.quickItem];
      if (!data) return;

      document
        .querySelectorAll("[data-quick-item]")
        .forEach((itemButton) => itemButton.classList.remove("is-active"));
      button.classList.add("is-active");

      quickCategory.textContent = `AI 1차 제안: ${data.category}`;
      quickGuidance.textContent = data.quickGuidance;
    });
  });
}

function renderResult(itemKey) {
  const data = itemData[itemKey] || itemData.paper;
  currentItemKey = itemKey;

  document.querySelector("#detectedItem").textContent = data.name;
  document.querySelector("#categorySuggestion").textContent = data.category;
  document.querySelector("#confidencePill").textContent = `신뢰도 ${data.confidence}%`;
  document.querySelector("#resultGuidance").textContent = data.guidance;
}

function ensureResultReady() {
  if (!selectedFile) {
    showDemoMessage("사진을 먼저 업로드하면 결과 처리 버튼을 사용할 수 있습니다.", true);
    return false;
  }
  if (!resultVisible) {
    showDemoMessage("AI 1차 추정이 끝난 뒤 결과를 처리할 수 있습니다.", true);
    return false;
  }
  return true;
}

function updateMetric(key, amount) {
  const counter = document.querySelector(`[data-counter][data-kpi="${key}"]`);
  const card = document.querySelector(`[data-kpi-card="${key}"]`);
  if (!counter || !card) return;

  const previous = metricValues[key] ?? Number(counter.textContent || 0);
  const next = previous + amount;
  metricValues[key] = next;

  animateCounter(counter, previous, next, 520);
  card.classList.remove("is-pulsing");
  void card.offsetWidth;
  card.classList.add("is-pulsing");

  window.setTimeout(() => card.classList.remove("is-pulsing"), 980);
}

function animateCounter(element, from, to, duration) {
  if (prefersReducedMotion) {
    element.textContent = String(to);
    return;
  }

  const startTime = performance.now();
  const difference = to - from;

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(from + difference * eased));

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function hideResult() {
  document.querySelector("#loadingState").classList.add("is-hidden");
  document.querySelector("#resultCard").classList.add("is-hidden");
  document.querySelector("#resultCard").classList.remove("is-visible");
  document.querySelector("#itemChooser").classList.add("is-hidden");
  setResultStatus("");
}

function showDemoMessage(message, isWarning) {
  const demoMessage = document.querySelector("#demoMessage");
  demoMessage.textContent = message;
  demoMessage.classList.toggle("is-warning", Boolean(isWarning));
}

function setResultStatus(message) {
  document.querySelector("#resultStatus").textContent = message;
}
