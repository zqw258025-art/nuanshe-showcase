import {
  CASES,
  DEFAULT_STATE,
  DESIGN_STYLES,
  GENERATION_STAGES,
  INPUT_TYPES,
  LIGHTING_TIMES,
  PHOTOGRAPHIC_STYLES,
  RESULT_OPTIONS,
  SPACES,
  promptFor,
} from "./demo-config.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  ...DEFAULT_STATE,
  localImage: "images/sample-input.jpg",
  localImageName: "暖舍真实输入样片",
  localImageIsSample: true,
  generating: false,
  generated: false,
  stageIndex: -1,
  compareValue: 50,
  compareMode: "slider",
  resultOptions: [...RESULT_OPTIONS],
};

let localObjectUrl = null;
let generationTimers = [];

const elements = {
  landingView: $('[data-view="landing"]'),
  workspaceView: $('[data-view="workspace"]'),
  caseGrid: $("#case-grid"),
  fileInput: $("#file-input"),
  uploadButton: $("#upload-button"),
  uploadStatus: $("#upload-status"),
  localPreview: $("#local-preview"),
  localPreviewCaption: $("#local-preview-caption"),
  styleGrid: $("#style-grid"),
  spaceSelect: $("#space-select"),
  photoSelect: $("#photo-select"),
  lightingSelect: $("#lighting-select"),
  peopleToggle: $("#people-toggle"),
  peopleField: $("#people-field"),
  peopleSelect: $("#people-select"),
  materialInput: $("#material-input"),
  promptOutput: $("#prompt-output"),
  generateButton: $("#generate-button"),
  resetButton: $("#reset-button"),
  stageTitle: $("#stage-title"),
  stageStatusText: $("#stage-status-text"),
  stageStatusDot: $("#stage-status-dot"),
  progressTrack: $("#progress-track"),
  stageList: $("#stage-list"),
  resultPreview: $("#result-preview"),
  resultPreviewTitle: $("#result-preview-title"),
  compareSection: $("#compare-section"),
  compareSlider: $("#compare-slider"),
  compareSide: $("#compare-side"),
  compareViewport: $("#compare-viewport"),
  compareOverlay: $("#compare-overlay"),
  compareHandle: $("#compare-handle"),
  compareRange: $("#compare-range"),
  resultsSection: $("#results-section"),
  resultGrid: $("#result-grid"),
  resultCount: $("#result-count"),
};

function initSelect(select, items) {
  select.innerHTML = items
    .map((item) => `<option value="${item.id}">${item.label}</option>`)
    .join("");
}

function initOptions() {
  initSelect(elements.spaceSelect, SPACES);
  initSelect(elements.photoSelect, PHOTOGRAPHIC_STYLES);
  initSelect(elements.lightingSelect, LIGHTING_TIMES);

  elements.styleGrid.innerHTML = DESIGN_STYLES.map(
    (style) => `
      <label class="style-option">
        <input type="radio" name="design-style" value="${style.id}" />
        <span>${style.label}</span>
      </label>
    `,
  ).join("");
}

function renderCases() {
  elements.caseGrid.innerHTML = CASES.map(
    (item) => `
      <article class="case-study">
        <div class="case-study__images">
          <figure>
            <img src="./${item.before}" alt="${item.title}原始输入" loading="lazy" />
            <figcaption>Original</figcaption>
          </figure>
          <figure>
            <img src="./${item.after}" alt="${item.title}真实 AI 优化结果" loading="lazy" />
            <figcaption>AI Enhanced</figcaption>
          </figure>
        </div>
        <div class="case-study__meta">
          <span>${item.index}</span>
          <div>
            <h3>${item.title}</h3>
            <p>${item.meta}</p>
          </div>
        </div>
      </article>
    `,
  ).join("");
}

function renderStages() {
  elements.stageList.innerHTML = GENERATION_STAGES.map(
    (stage, index) => `
      <li data-stage-index="${index}">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <div>
          <strong>${stage.label}</strong>
          <small>${stage.detail}</small>
        </div>
      </li>
    `,
  ).join("");
}

function syncControls() {
  const inputType = $(`input[name="input-type"][value="${state.inputType}"]`);
  const resolution = $(`input[name="resolution"][value="${state.resolution}"]`);
  const style = $(`input[name="design-style"][value="${state.style}"]`);
  if (inputType) inputType.checked = true;
  if (resolution) resolution.checked = true;
  if (style) style.checked = true;
  elements.spaceSelect.value = state.space;
  elements.photoSelect.value = state.photography;
  elements.lightingSelect.value = state.lighting;
  elements.materialInput.value = state.material;
  elements.peopleToggle.checked = state.includePeople;
  elements.peopleSelect.value = state.peopleScene;
  elements.peopleField.hidden = !state.includePeople;
  elements.promptOutput.value = promptFor(state);
}

function setLocalPreview(src, name, isSample) {
  if (localObjectUrl && localObjectUrl !== src) {
    URL.revokeObjectURL(localObjectUrl);
    localObjectUrl = null;
  }
  state.localImage = src;
  state.localImageName = name;
  state.localImageIsSample = isSample;
  elements.localPreview.src = src;
  elements.localPreviewCaption.textContent = name;
  elements.uploadStatus.textContent = isSample
    ? "当前使用暖舍真实输入样片。"
    : "图片已在本机浏览器中预览，未上传。";
}

function resetGeneratedState() {
  state.generated = false;
  state.generating = false;
  state.stageIndex = -1;
  clearGenerationTimers();
  elements.compareSection.hidden = true;
  elements.resultsSection.hidden = true;
  elements.stageTitle.textContent = "准备生成";
  elements.stageStatusText.textContent = "Ready";
  elements.stageStatusDot.classList.remove("is-running", "is-complete");
  elements.progressTrack.style.setProperty("--progress", "0%");
  $$("#stage-list li").forEach((item) => item.classList.remove("is-active", "is-complete"));
}

function clearGenerationTimers() {
  generationTimers.forEach((timer) => window.clearTimeout(timer));
  generationTimers = [];
}

function setProgress(index) {
  state.stageIndex = index;
  const percent = ((index + 1) / GENERATION_STAGES.length) * 100;
  elements.progressTrack.style.setProperty("--progress", `${percent}%`);
  elements.stageTitle.textContent = GENERATION_STAGES[index].label.replace("...", "");
  elements.stageStatusText.textContent = index === GENERATION_STAGES.length - 1 ? "Complete" : "Generating";
  elements.stageStatusDot.classList.toggle("is-running", index < GENERATION_STAGES.length - 1);
  elements.stageStatusDot.classList.toggle("is-complete", index === GENERATION_STAGES.length - 1);
  $$("#stage-list li").forEach((item, itemIndex) => {
    item.classList.toggle("is-active", itemIndex === index);
    item.classList.toggle("is-complete", itemIndex < index);
  });
}

function getResultOptions() {
  if (state.includePeople) return state.resultOptions;
  return state.resultOptions.filter((item) => item.id !== "people");
}

function selectResult(id) {
  const options = getResultOptions();
  const selected = options.find((item) => item.id === id) || options[0];
  if (!selected) return;
  state.selectedResult = selected.id;
  elements.resultPreview.src = `./${selected.src}`;
  elements.resultPreview.alt = selected.alt;
  elements.resultPreviewTitle.textContent = selected.title;
  const afterImages = $$(".compare-after-image");
  afterImages.forEach((image) => {
    image.src = `./${selected.src}`;
    image.alt = selected.alt;
  });
  $$(".result-card").forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.resultId === selected.id);
  });
}

function renderResults() {
  const options = getResultOptions();
  if (!options.some((item) => item.id === state.selectedResult)) {
    state.selectedResult = options[0].id;
  }

  elements.resultGrid.innerHTML = options
    .map(
      (item) => `
        <button class="result-card" type="button" data-result-id="${item.id}">
          <span class="result-card__media">
            <img src="./${item.src}" alt="${item.alt}" loading="lazy" />
          </span>
          <span class="result-card__body">
            <span>
              <strong>${item.title}</strong>
              <small>${item.tag}</small>
            </span>
            <span class="result-card__arrow" aria-hidden="true">↗</span>
          </span>
        </button>
      `,
    )
    .join("");

  elements.resultCount.textContent = `${options.length} versions`;
  $$(".result-card", elements.resultGrid).forEach((card) => {
    card.addEventListener("click", () => selectResult(card.dataset.resultId));
  });
  selectResult(state.selectedResult);
}

function finishGeneration() {
  state.generating = false;
  state.generated = true;
  elements.generateButton.disabled = false;
  elements.generateButton.textContent = "生成另一版体验";
  elements.compareSection.hidden = false;
  elements.resultsSection.hidden = false;
  renderResults();
  window.setTimeout(() => {
    elements.compareSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 180);
}

function startGeneration() {
  clearGenerationTimers();
  state.generating = true;
  state.generated = false;
  state.stageIndex = -1;
  elements.generateButton.disabled = true;
  elements.generateButton.textContent = "生成中...";
  elements.compareSection.hidden = true;
  elements.resultsSection.hidden = true;
  elements.progressTrack.style.setProperty("--progress", "0%");

  GENERATION_STAGES.forEach((_, index) => {
    const timer = window.setTimeout(() => {
      setProgress(index);
      if (index === GENERATION_STAGES.length - 1) {
        finishGeneration();
      }
    }, 720 * index + 120);
    generationTimers.push(timer);
  });
}

function setCompareValue(value) {
  const nextValue = Math.max(0, Math.min(100, Number(value)));
  state.compareValue = nextValue;
  elements.compareRange.value = String(nextValue);
  elements.compareOverlay.style.clipPath = `inset(0 ${100 - nextValue}% 0 0)`;
  elements.compareHandle.style.left = `${nextValue}%`;
}

function initCompareDrag() {
  let dragging = false;

  const updateFromPointer = (event) => {
    const rect = elements.compareViewport.getBoundingClientRect();
    const value = ((event.clientX - rect.left) / rect.width) * 100;
    setCompareValue(value);
  };

  elements.compareViewport.addEventListener("pointerdown", (event) => {
    dragging = true;
    elements.compareViewport.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  });

  elements.compareViewport.addEventListener("pointermove", (event) => {
    if (dragging) updateFromPointer(event);
  });

  elements.compareViewport.addEventListener("pointerup", (event) => {
    dragging = false;
    elements.compareViewport.releasePointerCapture(event.pointerId);
  });

  elements.compareViewport.addEventListener("pointercancel", () => {
    dragging = false;
  });

  elements.compareRange.addEventListener("input", (event) => setCompareValue(event.target.value));
}

function handleFile(file) {
  if (!file) return;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    elements.uploadStatus.textContent = "仅支持 PNG、JPG 或 WebP 图片。";
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    elements.uploadStatus.textContent = "请选择小于 20 MB 的图片。";
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  localObjectUrl = objectUrl;
  setLocalPreview(objectUrl, file.name, false);
  resetGeneratedState();
}

function resetWorkspace() {
  Object.assign(state, DEFAULT_STATE, {
    localImage: "images/sample-input.jpg",
    localImageName: "暖舍真实输入样片",
    localImageIsSample: true,
    generating: false,
    generated: false,
    stageIndex: -1,
    compareValue: 50,
    compareMode: "slider",
    resultOptions: [...RESULT_OPTIONS],
  });

  if (localObjectUrl) {
    URL.revokeObjectURL(localObjectUrl);
    localObjectUrl = null;
  }
  elements.fileInput.value = "";
  setLocalPreview("images/sample-input.jpg", "暖舍真实输入样片", true);
  elements.generateButton.disabled = false;
  elements.generateButton.textContent = "生成体验结果";
  resetGeneratedState();
  syncControls();
  setCompareValue(50);
  setCompareMode("slider");
}

function setCompareMode(mode) {
  state.compareMode = mode;
  elements.compareSlider.hidden = mode !== "slider";
  elements.compareSide.hidden = mode !== "side";
  $$(".view-switch__button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.compareMode === mode);
  });
}

function renderRoute() {
  const isWorkspace = window.location.hash === "#workspace";
  elements.landingView.hidden = isWorkspace;
  elements.workspaceView.hidden = !isWorkspace;

  if (isWorkspace) {
    document.title = "AI 精修工作台 · 暖舍";
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }

  document.title = "NUANSHE 暖舍 · AI Interior Rendering Workflow";
  const anchor = window.location.hash;
  if (["#workflow", "#examples"].includes(anchor)) {
    window.setTimeout(() => $(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }
}

function bindEvents() {
  elements.uploadButton.addEventListener("click", () => elements.fileInput.click());
  elements.fileInput.addEventListener("change", (event) => handleFile(event.target.files?.[0]));

  $("#input-type-control").addEventListener("change", (event) => {
    state.inputType = event.target.value;
    elements.promptOutput.value = promptFor(state);
    resetGeneratedState();
  });

  $("#resolution-control").addEventListener("change", (event) => {
    state.resolution = event.target.value;
    elements.promptOutput.value = promptFor(state);
    resetGeneratedState();
  });

  elements.styleGrid.addEventListener("change", (event) => {
    state.style = event.target.value;
    elements.promptOutput.value = promptFor(state);
    resetGeneratedState();
  });

  elements.spaceSelect.addEventListener("change", (event) => {
    state.space = event.target.value;
    elements.promptOutput.value = promptFor(state);
  });

  elements.photoSelect.addEventListener("change", (event) => {
    state.photography = event.target.value;
    elements.promptOutput.value = promptFor(state);
  });

  elements.lightingSelect.addEventListener("change", (event) => {
    state.lighting = event.target.value;
    elements.promptOutput.value = promptFor(state);
  });

  elements.materialInput.addEventListener("input", (event) => {
    state.material = event.target.value;
    elements.promptOutput.value = promptFor(state);
  });

  elements.peopleToggle.addEventListener("change", (event) => {
    state.includePeople = event.target.checked;
    elements.peopleField.hidden = !state.includePeople;
    elements.promptOutput.value = promptFor(state);
  });

  elements.peopleSelect.addEventListener("change", (event) => {
    state.peopleScene = event.target.value;
    elements.promptOutput.value = promptFor(state);
  });

  elements.generateButton.addEventListener("click", startGeneration);
  elements.resetButton.addEventListener("click", resetWorkspace);

  $$(".view-switch__button").forEach((button) => {
    button.addEventListener("click", () => setCompareMode(button.dataset.compareMode));
  });

  window.addEventListener("hashchange", renderRoute);
  window.addEventListener("beforeunload", () => {
    if (localObjectUrl) URL.revokeObjectURL(localObjectUrl);
  });
  initCompareDrag();
}

function init() {
  initOptions();
  renderCases();
  renderStages();
  syncControls();
  renderResults();
  setCompareValue(50);
  setCompareMode("slider");
  bindEvents();
  renderRoute();
}

init();
