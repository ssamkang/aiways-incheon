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
const hotspotData = {
  school: {
    title: "우리학교 자원순환 관찰 데이터",
    summary: "오늘 관찰 312건 / 판단 보류 21건 / 참여 반 14개",
    message: "학교 단위 관찰 데이터를 5학년 1반 활동과 비교합니다.",
  },
  class: {
    title: "5학년 1반 Dashboard",
    summary: "오늘 관찰 128건 / AI 1차 분류 37건 / 학생 재확인 18건",
    message: "첫 화면의 중심 데이터는 5학년 1반입니다.",
  },
  landfill: {
    title: "수도권매립지 모니터",
    summary: "생활폐기물 반입량 18,420t / 총량 대비 반입률 63.4%",
    message: "DEMO · 공식 관리 지표 구조 참고 기반의 수업용 프로토타입입니다.",
  },
  bridge: {
    title: "인천대교 데이터 라인",
    summary: "교실 관찰 데이터가 지역 자원순환 경로로 확장되는 흐름",
    message: "실제 교통·지도 API가 아닌 발표용 추상 관제 표현입니다.",
  },
  airport: {
    title: "인천공항 확장 노드",
    summary: "인천의 이동성과 순환 데이터를 상징하는 보조 지표",
    message: "데이터 흐름의 확장 가능성을 보여주는 더미 노드입니다.",
  },
  gu: {
    title: "우리구 비교 지표",
    summary: "구 단위 참여 순위 12위 / 관찰 데이터 확산 중",
    message: "우리반 데이터의 확장 범위를 보여주는 보조 지표입니다.",
  },
  dong: {
    title: "우리동 비교 지표",
    summary: "동 단위 참여 순위 7위 / 학교 주변 배출 혼선 관찰",
    message: "학교 밖 생활권으로 연결되는 수업용 비교 노드입니다.",
  },
};

const rankData = {
  class: "5학년 1반 · 학년 내 1위",
  grade: "5학년 전체 · 학교 내 2위",
  school: "우리학교 · 동 단위 7위",
  dong: "우리동 · 구 단위 12위",
  gu: "우리구 · 인천 단위 48위",
  incheon: "인천 전체 · 참여 데이터 확산 중",
};

let selectedFile = null;
let currentItemKey = "paper";
let resultVisible = false;
let recordFinalized = false;
let loadingTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  initializeCounters();
  bindScrollButtons();
  bindAnchorNavigation();
  bindSectionScroller();
  bindControlHotspots();
  bindMapSearch();
  bindRankingFilters();
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
      const targetSelector = button.dataset.scroll === "#demo-card" ? "#project" : button.dataset.scroll;
      smoothScrollToTarget(targetSelector);

      if (button.dataset.scroll === "#demo-card") {
        highlightDemoCard();
        window.setTimeout(() => document.querySelector("#imageUpload")?.focus(), 760);
      }
    });
  });
}

function highlightDemoCard() {
  const card = document.querySelector("#demo-card");
  if (!card) return;
  card.classList.remove("is-highlighted");
  void card.offsetWidth;
  card.classList.add("is-highlighted");
  window.setTimeout(() => card.classList.remove("is-highlighted"), 1300);
}

function bindAnchorNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      smoothScrollToTarget(href);
    });
  });
}

function smoothScrollToTarget(selector) {
  const target = document.querySelector(selector);
  if (!target) return;

  if (prefersReducedMotion || window.innerWidth < 900) {
    target.scrollIntoView({ behavior: "auto", block: "start" });
    return;
  }

  animateScrollTo(window.scrollY + target.getBoundingClientRect().top, 980);
}

function animateScrollTo(targetY, duration) {
  const startY = window.scrollY;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const destination = Math.max(0, Math.min(targetY, maxY));
  const distance = destination - startY;
  const startTime = performance.now();

  document.body.classList.add("is-section-scrolling");

  function ease(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * ease(progress));

    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }

    window.scrollTo(0, destination);
    window.setTimeout(() => document.body.classList.remove("is-section-scrolling"), 160);
  }

  requestAnimationFrame(step);
}

function bindSectionScroller() {
  if (prefersReducedMotion) return;

  const sections = [...document.querySelectorAll("main > .section-shell")];
  if (!sections.length) return;

  let isLocked = false;
  let wheelDelta = 0;

  function currentSectionIndex() {
    const pivot = window.scrollY + window.innerHeight * 0.48;
    return sections.reduce((closestIndex, section, index) => {
      const sectionTop = section.offsetTop;
      const closestTop = sections[closestIndex].offsetTop;
      return Math.abs(sectionTop - pivot) < Math.abs(closestTop - pivot)
        ? index
        : closestIndex;
    }, 0);
  }

  window.addEventListener(
    "wheel",
    (event) => {
      if (window.innerWidth < 1180 || event.ctrlKey) return;
      if (event.target.closest("input, textarea, select")) return;

      if (isLocked) {
        event.preventDefault();
        return;
      }

      wheelDelta += event.deltaY;
      if (Math.abs(wheelDelta) < 100) return;

      event.preventDefault();
      const direction = wheelDelta > 0 ? 1 : -1;
      wheelDelta = 0;

      const nextIndex = Math.max(0, Math.min(sections.length - 1, currentSectionIndex() + direction));
      isLocked = true;
      animateScrollTo(sections[nextIndex].offsetTop, 1080);
      window.setTimeout(() => {
        isLocked = false;
      }, 1180);
    },
    { passive: false }
  );

  window.addEventListener("keydown", (event) => {
    if (window.innerWidth < 1180 || event.target.closest("input, textarea, select")) return;
    const keyMap = { PageDown: 1, ArrowDown: 1, PageUp: -1, ArrowUp: -1 };
    if (event.key === "Home") {
      event.preventDefault();
      smoothScrollToTarget(`#${sections[0].id}`);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      smoothScrollToTarget(`#${sections[sections.length - 1].id}`);
      return;
    }
    if (!(event.key in keyMap) || isLocked) return;
    event.preventDefault();
    const nextIndex = Math.max(0, Math.min(sections.length - 1, currentSectionIndex() + keyMap[event.key]));
    isLocked = true;
    animateScrollTo(sections[nextIndex].offsetTop, 1040);
    window.setTimeout(() => {
      isLocked = false;
    }, 1140);
  });
}

function bindControlHotspots() {
  const buttons = document.querySelectorAll("[data-hotspot]");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    const activate = () => activateHotspot(button.dataset.hotspot);
    button.addEventListener("mouseenter", activate);
    button.addEventListener("focus", activate);
    button.addEventListener("click", activate);
  });
}

function activateHotspot(key, messageOverride) {
  const data = hotspotData[key] || hotspotData.school;
  const detail = document.querySelector("#hotspotDetail");
  const title = document.querySelector("#hotspotTitle");
  const summary = document.querySelector("#hotspotSummary");
  const message = document.querySelector("#searchMessage");

  document
    .querySelectorAll("[data-hotspot]")
    .forEach((button) => button.classList.toggle("is-active", button.dataset.hotspot === key));

  if (title) title.textContent = data.title;
  if (summary) summary.textContent = data.summary;
  if (message) message.textContent = messageOverride || data.message;

  if (detail) {
    detail.classList.remove("is-floating");
    void detail.offsetWidth;
    detail.classList.add("is-floating");
  }
}

function bindMapSearch() {
  const form = document.querySelector("#mapSearch");
  const input = document.querySelector("#mapSearchInput");
  if (!form || !input) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.replace(/\s/g, "");
    let key = "";

    if (query.includes("우리학교") || query.includes("학교")) key = "school";
    if (query.includes("5학년1반") || query.includes("1반")) key = "class";
    if (query.includes("수도권매립지") || query.includes("매립지")) key = "landfill";

    if (key) {
      activateHotspot(key, "검색 결과를 관제 지도에서 강조했습니다.");
      return;
    }

    const message = document.querySelector("#searchMessage");
    if (message) {
      message.textContent = "현재 데모에서는 우리학교, 5학년 1반, 수도권매립지를 확인할 수 있습니다.";
    }
  });
}

function bindRankingFilters() {
  const headline = document.querySelector("#rankHeadline");
  const meta = document.querySelector("#rankMeta");
  const buttons = document.querySelectorAll("[data-rank-scope]");
  if (!headline || !buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((scopeButton) => scopeButton.classList.remove("is-active"));
      button.classList.add("is-active");
      headline.textContent = rankData[button.dataset.rankScope] || rankData.class;
      if (meta) meta.textContent = "DEMO RANKING · 수업용 순위 시뮬레이션";
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
    updateMetric("confirmed", 1);
    updateMetric("converted", 1);
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
