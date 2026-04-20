/*
## Metadata
name: JCI Seating Desk Frontend
description: Ground-up rebuilt client-side app wiring for roster intake, recognition data loading, and seat-plan rendering.
*/

import { buildCircularSeatLayout, buildDisplayPlan, buildPhotoLayout, buildRecognitionOnlyRoster, buildSeatPlan, distributeAcrossTables, ensureAnchorInRoster } from "./logic.js";

const state = {
  theme: "light",
  language: "en",
  recognitionEntries: [],
  lastPlan: null,
  lastSubmittedAttendees: [],
  scenario: "photo",
  sampleMode: true,
  anchorSelection: "auto",
  photoOrientation: "facing_audience",
};

const TABLE_SCENARIOS = new Set(["circular", "long"]);
const CIRCULAR_TABLE_CAPACITY = 12;
const MAX_TABLE_COUNT = 6;
const APP_STATE_STORAGE_KEY = "jciProtocolDeskAppState";
const RECOGNITION_PAGE_STATE_KEY = "jciRecognitionPageState";
const MANUAL_LAYER_OPTIONS = [
  { value: "", label: "Auto layer" },
  { value: "hk_gov", label: "HK Gov" },
  { value: "goh", label: "GOH" },
  { value: "sponsor", label: "Sponsor" },
  { value: "jci", label: "JCI" },
  { value: "jci_hk_national", label: "JCI HK (National)" },
  { value: "sister_chapter", label: "Sister Chapter of JCI HK (local Chapter)" },
  { value: "jci_hk_local", label: "JCI HK (local Chapter)" },
];
const MANUAL_LAYER_VALUES = new Set(MANUAL_LAYER_OPTIONS.map((option) => option.value).filter(Boolean));

const manualRows = document.getElementById("manualRows");
const textInput = document.getElementById("textInput");
const fileInput = document.getElementById("fileInput");
const inputStatus = document.getElementById("inputStatus");
const outputStatus = document.getElementById("outputStatus");
const planStatus = document.getElementById("planStatus");
const sampleModeToggle = document.getElementById("sampleModeToggle");
const clearRosterButton = document.getElementById("clearRosterButton");
const submitRosterButton = document.getElementById("submitRosterButton");
const arrangeButton = document.getElementById("arrangeButton");
const resultBody = document.getElementById("resultBody");
const seatMap = document.getElementById("seatMap");
const summaryBoard = document.getElementById("summaryBoard");
const loadRecognitionButton = document.getElementById("loadRecognitionButton");
const languageToggle = document.getElementById("languageToggle");
const themeToggle = document.getElementById("themeToggle");
const metaDescription = document.querySelector('meta[name="description"]');
const seatCountRange = document.getElementById("seatCountRange");
const seatCountValue = document.getElementById("seatCountValue");
const tableCountControl = document.getElementById("tableCountControl");
const tableCountRange = document.getElementById("tableCountRange");
const tableCountValue = document.getElementById("tableCountValue");
const tableCountLabel = document.getElementById("tableCountLabel");
const photoOrientationControl = document.getElementById("photoOrientationControl");
const photoOrientationToggle = document.getElementById("photoOrientationToggle");
const photoOrientationValue = document.getElementById("photoOrientationValue");
const anchorPersonSelect = document.getElementById("anchorPersonSelect");
const anchorPersonValue = document.getElementById("anchorPersonValue");
const centerSeatPlan = document.getElementById("centerSeatPlan");
const scenarioSelect = document.getElementById("scenarioSelect");
const scenarioValue = document.getElementById("scenarioValue");
const scenarioTitle = document.getElementById("scenarioTitle");
const scenarioCopy = document.getElementById("scenarioCopy");
const DEFAULT_AUTO_ANCHOR_ID = "jci-hk-80";
const SAMPLE_OFF_ANCHOR_IDS = ["jci-hk-80", "jci-hk-1"];

const TRANSLATIONS = {
  en: {
    documentTitle: "JCI Protocol Seating Desk",
    documentDescription: "Ground-up rebuilt JCI protocol seating desk for roster intake, priority review, and ceremonial seat planning.",
    heroTitle: "JCI Protocol Seating Desk",
    buttonLanguage: "繁中",
    buttonThemeDark: "Dark theme",
    buttonThemeLight: "Light theme",
    buttonRecognitionOnly: "Recognition only",
    buttonSampleRoster: "Sample roster",
    buttonPreviewSamplePlan: "Preview sample plan",
    buttonClearRoster: "Clear roster",
    buttonSubmitRoster: "Submit roster",
    buttonAddRow: "Add row",
    buttonAuto: "Auto",
    buttonRemove: "Remove",
    sampleModeOn: "Sample mode on",
    sampleModeOff: "Sample mode off",
    sectionTop: "Top Section",
    currentSeatingPlan: "Current seating plan",
    planControls: "Plan controls",
    controlScenario: "Scenario",
    controlAnchorPerson: "Anchor person",
    controlPhotoView: "Photo view",
    controlSeatsInPlan: "Seats in plan",
    controlTablesRound: "Round tables",
    controlTablesLong: "Long tables",
    squareLegend: "Square legend",
    legendHeadSeat: "Head seat",
    legendSeated: "Seated",
    visualPlan: "Visual Plan",
    inputSection: "Input",
    rosterIntake: "Roster intake",
    manualRows: "Manual rows",
    importSection: "Import",
    uploadCsvJson: "Upload CSV or JSON",
    pasteCsvJson: "Paste CSV or JSON",
    rosterPlaceholder: "name,title,organization\nChan Tai Man,Guest,JCI Hong Kong",
    priorityStack: "Priority stack",
    outputSection: "Output",
    detailedOrder: "Detailed order",
    tableSeat: "Seat",
    tableName: "Name",
    tableTitle: "Title",
    tableOrganization: "Organization",
    tableCategory: "Category",
    fieldName: "Name",
    fieldTitle: "Title",
    fieldOrganization: "Organization",
    fieldGuestLayer: "Guest layer",
    noTitle: "No title",
    open: "Open",
    openSlot: "Open slot",
    awaitingHeadAssignment: "Awaiting head assignment",
    awaitingAssignment: "Awaiting assignment",
    stage: "Stage",
    stageDirectionTop: "Top of section",
    roundProtocolTable: "Round protocol table",
    longTableAxis: "Long table axis",
    headSeatTitle: "Head seat",
    sampleModeOnStatus: "Sample mode is on. Submit roster from the Roster intake section to replace this preview with a real seating plan.",
    recognitionOnlyNeedsRoster: "Add roster rows or paste a roster before using recognition only.",
    recognitionOnlyNoMatches: "No recognition matches were found in the current roster intake.",
    recognitionOnlyShown: "{count} recognition-list matches shown from the current roster intake.",
    sampleLoaded: "{count} sample attendees loaded.",
    rosterClearedInput: "Roster intake cleared. Add rows, paste data, or import a file to build a new plan.",
    rosterClearedOutput: "Current roster plan cleared. Submit a new roster to regenerate the seating order.",
    sampleModeOffCopy: "Sample mode is off. Build the seating plan from the roster intake section to populate this view.",
    sampleModeOffStatus: "Sample mode is off. Use the roster intake section to generate the current seating plan.",
    tableScenarioShown: "{copy} {count} {tableNoun} table{plural} shown.",
    sampleTableStatus: "Recognition-list sample shown: {count} seats across {tableCount} {tableNoun} table{plural}. Build a real seat plan to replace it.",
    realTableStatus: "{count} seats shown across {tableCount} {tableNoun} table{plural} from the current priority order.",
    circularCapacityNotice: "Auto-expanded to keep each round table within {capacity} seats.",
    samplePlanStatus: "Recognition-list sample shown: {count} seats. Build a real seat plan to replace it.",
    realPlanStatus: "{count} seats shown from the current priority order.",
    submittedPlanStatusWithAnchor: "{count} seats generated from the submitted roster and anchor person.",
    submittedPlanStatusWithoutAnchor: "{count} seats generated from the submitted roster only.",
    headRank1: "Head / Rank 1",
    rankLabel: "Rank {rank}",
    seatDetail: "Seat {seat} / {detail}",
    seatLabel: "Seat {seat}",
    standingLabel: "Standing {count}",
    tableLabel: "Table {count}",
    roundTableLabel: "Round table {count}",
    longTableLabel: "Long table {count}",
    seatsCount: "{count} seat{plural}",
    tableNounRound: "round",
    tableNounLong: "long",
    addAttendeeBeforePlan: "Add at least one attendee before building the seat plan.",
    themeDark: "Dark theme",
    themeLight: "Light theme",
    fileLoaded: "{count} attendees loaded from file.",
    recognitionSampleUpdated: "Recognition-list sample updated with the current anchor selection.",
    category: {
      hk_gov: "HK Gov",
      goh: "GOH",
      sponsor: "Sponsor",
      jci: "JCI",
      jci_hk_national: "JCI HK (National)",
      sister_chapter: "Sister Chapter of JCI HK (local Chapter)",
      jci_hk_local: "JCI HK (local Chapter)",
      needs_layer: "Needs layer selection",
    },
    manualLayerOptions: {
      "": "Auto layer",
      hk_gov: "HK Gov",
      goh: "GOH",
      sponsor: "Sponsor",
      jci: "JCI",
      jci_hk_national: "JCI HK (National)",
      sister_chapter: "Sister Chapter of JCI HK (local Chapter)",
      jci_hk_local: "JCI HK (local Chapter)",
    },
    scenarioMeta: {
      photo: {
        label: "Photo taking",
        title: "Centered photo lineup",
        copy: "The head stays fixed in the center, then ranks expand to the right and left in alternating order.",
      },
      circular: {
        label: "Circular table",
        title: "Circular table diagram",
        copy: "The ordered plan wraps around a circular table so the highest-priority guests sit across the top arc first.",
      },
      long: {
        label: "Long table",
        title: "Long table diagram",
        copy: "The ordered plan runs along a long ceremonial table with the head seat centered and flanks distributed left and right.",
      },
    },
    photoOrientationMeta: {
      facing_audience: {
        label: "Facing audience",
        description: "Shown in stage-facing order, with the lineup facing the audience.",
      },
      from_audience: {
        label: "From audience",
        description: "Mirrored as viewed from the audience side while facing the stage.",
      },
    },
  },
  zhHant: {
    documentTitle: "JCI 禮賓座位編排系統",
    documentDescription: "重新建立的 JCI 禮賓座位編排系統，用於名單輸入、排序檢視及典禮座位規劃。",
    heroTitle: "JCI 禮賓座位編排系統",
    buttonLanguage: "ENG",
    buttonThemeDark: "深色主題",
    buttonThemeLight: "淺色主題",
    buttonRecognitionOnly: "只顯示認可名單",
    buttonSampleRoster: "範例名單",
    buttonPreviewSamplePlan: "預覽範例座位表",
    buttonClearRoster: "清空名單",
    buttonSubmitRoster: "提交名單",
    buttonAddRow: "新增一列",
    buttonAuto: "自動",
    buttonRemove: "移除",
    sampleModeOn: "範例模式開啟",
    sampleModeOff: "範例模式關閉",
    sectionTop: "頂部區域",
    currentSeatingPlan: "目前座位安排",
    planControls: "座位圖控制",
    controlScenario: "情境",
    controlAnchorPerson: "錨點人物",
    controlPhotoView: "合照視角",
    controlSeatsInPlan: "顯示座位數",
    controlTablesRound: "圓桌數量",
    controlTablesLong: "長桌數量",
    squareLegend: "方格圖例",
    legendHeadSeat: "主位",
    legendSeated: "已入座",
    visualPlan: "視覺座位圖",
    inputSection: "輸入",
    rosterIntake: "名單輸入",
    manualRows: "手動輸入列",
    importSection: "匯入",
    uploadCsvJson: "上載 CSV 或 JSON",
    pasteCsvJson: "貼上 CSV 或 JSON",
    rosterPlaceholder: "name,title,organization\nChan Tai Man,Guest,JCI Hong Kong",
    priorityStack: "排序層級",
    outputSection: "輸出",
    detailedOrder: "詳細次序",
    tableSeat: "座位",
    tableName: "姓名",
    tableTitle: "職銜",
    tableOrganization: "機構",
    tableCategory: "類別",
    fieldName: "姓名",
    fieldTitle: "職銜",
    fieldOrganization: "機構",
    fieldGuestLayer: "賓客層級",
    noTitle: "無職銜",
    open: "留空",
    openSlot: "空位",
    awaitingHeadAssignment: "等待主位安排",
    awaitingAssignment: "等待安排",
    stage: "舞台",
    stageDirectionTop: "區域上方",
    roundProtocolTable: "圓桌禮賓座位",
    longTableAxis: "長桌中軸",
    headSeatTitle: "主位",
    sampleModeOnStatus: "範例模式已開啟。請在名單輸入區提交名單，以真實座位表取代此預覽。",
    recognitionOnlyNeedsRoster: "請先輸入名單或貼上名單，才可使用只顯示認可名單。",
    recognitionOnlyNoMatches: "目前名單輸入中沒有任何認可名單配對。",
    recognitionOnlyShown: "已根據目前名單輸入顯示 {count} 位認可名單配對。",
    sampleLoaded: "已載入 {count} 位範例出席者。",
    rosterClearedInput: "名單輸入已清空。請重新新增列、貼上資料或匯入檔案。",
    rosterClearedOutput: "目前座位表已清空。請提交新名單以重新生成座位排序。",
    sampleModeOffCopy: "範例模式已關閉。請在名單輸入區建立座位表以顯示此視圖。",
    sampleModeOffStatus: "範例模式已關閉。請使用名單輸入區產生目前座位安排。",
    tableScenarioShown: "{copy} 已顯示 {count} 張{tableNoun}。",
    sampleTableStatus: "已顯示認可名單範例：{count} 個座位，分佈於 {tableCount} 張{tableNoun}。請建立真實座位表以取代此畫面。",
    realTableStatus: "已根據目前優先次序顯示 {count} 個座位，分佈於 {tableCount} 張{tableNoun}。",
    circularCapacityNotice: "已自動擴展，確保每張圓桌不超過 {capacity} 個座位。",
    samplePlanStatus: "已顯示認可名單範例：{count} 個座位。請建立真實座位表以取代此畫面。",
    realPlanStatus: "已根據目前優先次序顯示 {count} 個座位。",
    submittedPlanStatusWithAnchor: "已根據已提交名單及錨點人物生成 {count} 個座位。",
    submittedPlanStatusWithoutAnchor: "已根據已提交名單生成 {count} 個座位。",
    headRank1: "主位 / 排名 1",
    rankLabel: "排名 {rank}",
    seatDetail: "座位 {seat} / {detail}",
    seatLabel: "座位 {seat}",
    standingLabel: "站位 {count}",
    tableLabel: "桌 {count}",
    roundTableLabel: "第 {count} 張圓桌",
    longTableLabel: "第 {count} 張長桌",
    seatsCount: "{count} 個座位",
    tableNounRound: "圓桌",
    tableNounLong: "長桌",
    addAttendeeBeforePlan: "請先加入至少一位出席者，再建立座位表。",
    themeDark: "深色主題",
    themeLight: "淺色主題",
    fileLoaded: "已從檔案載入 {count} 位出席者。",
    recognitionSampleUpdated: "已按目前錨點人物設定更新認可名單範例。",
    category: {
      hk_gov: "香港政府",
      goh: "主禮嘉賓",
      sponsor: "贊助機構",
      jci: "JCI",
      jci_hk_national: "香港總會",
      sister_chapter: "香港分會姊妹會",
      jci_hk_local: "香港分會",
      needs_layer: "需要選擇層級",
    },
    manualLayerOptions: {
      "": "自動判斷",
      hk_gov: "香港政府",
      goh: "主禮嘉賓",
      sponsor: "贊助機構",
      jci: "JCI",
      jci_hk_national: "香港總會",
      sister_chapter: "香港分會姊妹會",
      jci_hk_local: "香港分會",
    },
    scenarioMeta: {
      photo: {
        label: "合照排位",
        title: "置中合照隊形",
        copy: "主位固定在正中間，其餘賓客按排名向右、向左交替延伸排列。",
      },
      circular: {
        label: "圓桌",
        title: "圓桌座位圖",
        copy: "座位次序沿圓桌展開，最高優先次序賓客由主位開始安排。",
      },
      long: {
        label: "長桌",
        title: "長桌座位圖",
        copy: "座位次序沿長桌展開，主位在中間，兩側按次序分配。",
      },
    },
    photoOrientationMeta: {
      facing_audience: {
        label: "面向觀眾",
        description: "以隊伍面向觀眾的視角顯示左右次序。",
      },
      from_audience: {
        label: "觀眾視角",
        description: "以觀眾望向舞台的視角鏡像顯示隊形。",
      },
    },
  },
};

function getLocale() {
  return TRANSLATIONS[state.language] || TRANSLATIONS.en;
}

function t(path, replacements = {}) {
  const locale = getLocale();
  const fallback = TRANSLATIONS.en;
  const segments = path.split(".");
  let value = locale;

  for (const segment of segments) {
    value = value?.[segment];
  }

  if (value == null) {
    value = fallback;
    for (const segment of segments) {
      value = value?.[segment];
    }
  }

  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\{(\w+)\}/g, (_, key) => String(replacements[key] ?? ""));
}

function pluralSuffix(count) {
  return state.language === "en" && Number(count) !== 1 ? "s" : "";
}

function getCategoryText(category, fallback = "") {
  return category ? t(`category.${category}`) || fallback : fallback;
}

function getScenarioMeta(scenario = state.scenario) {
  return getLocale().scenarioMeta[scenario] || TRANSLATIONS.en.scenarioMeta[scenario];
}

function getPhotoOrientationMeta(orientation = state.photoOrientation) {
  return getLocale().photoOrientationMeta[orientation] || TRANSLATIONS.en.photoOrientationMeta[orientation];
}

function readStorageJson(key) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeStorageJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
}

function setLocalizedStatus(node, key = "", replacements = {}) {
  if (!node) {
    return;
  }

  if (!key) {
    delete node.dataset.i18nStatusKey;
    delete node.dataset.i18nStatusArgs;
    node.textContent = "";
    return;
  }

  node.dataset.i18nStatusKey = key;
  node.dataset.i18nStatusArgs = JSON.stringify(replacements);
  node.textContent = t(key, replacements);
}

function refreshStoredStatuses() {
  [inputStatus, outputStatus].forEach((node) => {
    const key = node?.dataset.i18nStatusKey;
    if (!key) {
      return;
    }

    let replacements = {};
    try {
      replacements = JSON.parse(node.dataset.i18nStatusArgs || "{}");
    } catch {
      replacements = {};
    }

    node.textContent = t(key, replacements);
  });
}

function updateManualRowTranslations() {
  manualRows.querySelectorAll(".manual-row").forEach((row) => {
    const nameInput = row.querySelector('[data-field="name"]');
    const titleInput = row.querySelector('[data-field="title"]');
    const organizationInput = row.querySelector('[data-field="organization"]');
    const manualLayerSelect = row.querySelector('[data-field="manualLayer"]');
    const removeButton = row.querySelector(".row-remove");

    if (nameInput) {
      nameInput.setAttribute("placeholder", t("fieldName"));
    }
    if (titleInput) {
      titleInput.setAttribute("placeholder", t("fieldTitle"));
    }
    if (organizationInput) {
      organizationInput.setAttribute("placeholder", t("fieldOrganization"));
    }
    if (manualLayerSelect) {
      manualLayerSelect.setAttribute("aria-label", t("fieldGuestLayer"));
      manualLayerSelect.innerHTML = renderLayerOptions(manualLayerSelect.value);
    }
    if (removeButton) {
      removeButton.textContent = t("buttonRemove");
    }
  });
}

function updateStaticTranslations() {
  document.documentElement.lang = state.language === "zhHant" ? "zh-Hant" : "en";
  document.title = t("documentTitle");
  if (metaDescription) {
    metaDescription.setAttribute("content", t("documentDescription"));
  }
  languageToggle.textContent = t("buttonLanguage");
  themeToggle.textContent = state.theme === "light" ? t("buttonThemeDark") : t("buttonThemeLight");
  sampleModeToggle.textContent = state.sampleMode ? t("sampleModeOn") : t("sampleModeOff");

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (!key) {
      return;
    }
    node.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.getAttribute("data-i18n-placeholder");
    if (!key) {
      return;
    }
    node.setAttribute("placeholder", t(key));
  });

  [...scenarioSelect.options].forEach((option) => {
    option.textContent = t(`scenarioMeta.${option.value}.label`);
  });
}

function collectDraftRows() {
  return [...manualRows.querySelectorAll(".manual-row")].map((row, index) => ({
    id: `draft-${index + 1}`,
    name: row.querySelector('[data-field="name"]').value.trim(),
    title: row.querySelector('[data-field="title"]').value.trim(),
    organization: row.querySelector('[data-field="organization"]').value.trim(),
    manualLayer: row.querySelector('[data-field="manualLayer"]').value || "",
  }));
}

function persistRecognitionPageState(sampleMode) {
  writeStorageJson(RECOGNITION_PAGE_STATE_KEY, { sampleMode });
}

function persistAppState() {
  writeStorageJson(APP_STATE_STORAGE_KEY, {
    theme: state.theme,
    language: state.language,
    scenario: state.scenario,
    sampleMode: state.sampleMode,
    anchorSelection: state.anchorSelection,
    photoOrientation: state.photoOrientation,
    seatCount: Number(seatCountRange.value) || 1,
    tableCount: Number(tableCountRange.value) || 1,
    rows: collectDraftRows(),
    textInput: textInput.value,
    lastSubmittedAttendees: state.lastSubmittedAttendees,
  });
}

function applyStoredAppState() {
  const stored = readStorageJson(APP_STATE_STORAGE_KEY);
  if (!stored) {
    return false;
  }

  if (stored.theme === "light" || stored.theme === "dark") {
    state.theme = stored.theme;
  }
  if (stored.language === "en" || stored.language === "zhHant") {
    state.language = stored.language;
  }
  if (["photo", "circular", "long"].includes(stored.scenario)) {
    state.scenario = stored.scenario;
  }
  if (typeof stored.sampleMode === "boolean") {
    state.sampleMode = stored.sampleMode;
  }
  if (typeof stored.anchorSelection === "string" && stored.anchorSelection) {
    state.anchorSelection = stored.anchorSelection;
  }
  if (["facing_audience", "from_audience"].includes(stored.photoOrientation)) {
    state.photoOrientation = stored.photoOrientation;
  }

  const storedSeatCount = Math.max(1, Math.min(Number(seatCountRange.max) || 200, Number(stored.seatCount) || 1));
  const storedTableCount = Math.max(1, Math.min(MAX_TABLE_COUNT, Number(stored.tableCount) || 1));
  seatCountRange.value = String(storedSeatCount);
  seatCountValue.textContent = String(storedSeatCount);
  tableCountRange.value = String(storedTableCount);
  tableCountValue.textContent = String(storedTableCount);
  scenarioSelect.value = state.scenario;

  const storedRows = Array.isArray(stored.rows)
    ? stored.rows.map((row, index) => ({
        id: row.id || `draft-${index + 1}`,
        name: row.name || "",
        title: row.title || "",
        organization: row.organization || "",
        manualLayer: row.manualLayer || "",
      }))
    : [];
  resetRows(storedRows);
  textInput.value = typeof stored.textInput === "string" ? stored.textInput : "";

  state.lastSubmittedAttendees = Array.isArray(stored.lastSubmittedAttendees) ? stored.lastSubmittedAttendees : [];
  state.lastPlan = state.lastSubmittedAttendees.length
    ? buildPlanFromState(state.lastSubmittedAttendees, { sampleMode: false })
    : null;

  document.documentElement.dataset.theme = state.theme;
  return true;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getRowLayerValue(attendee = {}) {
  if (attendee.manualLayer && MANUAL_LAYER_VALUES.has(attendee.manualLayer)) {
    return attendee.manualLayer;
  }
  if (attendee.guestLayer && MANUAL_LAYER_VALUES.has(attendee.guestLayer)) {
    return attendee.guestLayer;
  }
  if (attendee.layer && MANUAL_LAYER_VALUES.has(attendee.layer)) {
    return attendee.layer;
  }
  return "";
}

function renderLayerOptions(selectedValue = "") {
  return MANUAL_LAYER_OPTIONS.map((option) => {
    const selected = option.value === selectedValue ? " selected" : "";
    return `<option value="${escapeHtml(option.value)}"${selected}>${escapeHtml(t(`manualLayerOptions.${option.value}`))}</option>`;
  }).join("");
}

function createRow(attendee = { name: "", title: "", organization: "", manualLayer: "" }) {
  const selectedLayer = getRowLayerValue(attendee);
  const row = document.createElement("div");
  row.className = "manual-row";
  row.innerHTML = `
    <input class="row-input" data-field="name" placeholder="${escapeHtml(t("fieldName"))}" value="${escapeHtml(attendee.name || "")}" />
    <input class="row-input" data-field="title" placeholder="${escapeHtml(t("fieldTitle"))}" value="${escapeHtml(attendee.title || "")}" />
    <input class="row-input" data-field="organization" placeholder="${escapeHtml(t("fieldOrganization"))}" value="${escapeHtml(attendee.organization || "")}" />
    <select class="row-select" data-field="manualLayer" aria-label="${escapeHtml(t("fieldGuestLayer"))}">
      ${renderLayerOptions(selectedLayer)}
    </select>
    <button class="row-remove" type="button">${escapeHtml(t("buttonRemove"))}</button>
  `;
  manualRows.append(row);
}

function resetRows(attendees = []) {
  manualRows.replaceChildren();
  if (!attendees.length) {
    createRow();
    createRow();
    createRow();
    return;
  }
  attendees.forEach((attendee) => createRow(attendee));
}

function collectRows() {
  return [...manualRows.querySelectorAll(".manual-row")]
    .map((row, index) => ({
      id: `manual-${index + 1}`,
      name: row.querySelector('[data-field="name"]').value.trim(),
      title: row.querySelector('[data-field="title"]').value.trim(),
      organization: row.querySelector('[data-field="organization"]').value.trim(),
      manualLayer: row.querySelector('[data-field="manualLayer"]').value || undefined,
      source: "manual",
    }))
    .filter((entry) => entry.name);
}

function parseLooseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const rows = lines.map((line) => line.split(",").map((part) => part.trim()));
  const hasHeader = rows[0][0]?.toLowerCase() === "name";
  const body = hasHeader ? rows.slice(1) : rows;

  return body
    .map((parts, index) => {
      if (parts.length < 2) {
        return null;
      }
      return {
        id: `csv-${index + 1}`,
        name: parts[0] || "",
        title: parts.slice(1, parts.length - 1).join(", ").trim(),
        organization: parts[parts.length - 1] || "",
        source: "csv",
      };
    })
    .filter(Boolean);
}

function parseInputText(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }
  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    return parsed.map((entry, index) => ({
      id: `json-${index + 1}`,
      name: (entry.name || "").trim(),
      title: (entry.title || "").trim(),
      organization: (entry.organization || "").trim(),
      manualLayer: getRowLayerValue(entry) || undefined,
      source: "json",
    }));
  }
  return parseLooseCsv(trimmed);
}

async function loadRecognitionEntries() {
  const response = await fetch("./data/recognition-list.json");
  const payload = await response.json();
  state.recognitionEntries = payload.entries || [];
}

async function loadSampleAttendees() {
  const response = await fetch("../test_attendees.csv");
  const text = await response.text();
  const attendees = parseLooseCsv(text);
  resetRows(attendees);
  textInput.value = "";
  setLocalizedStatus(inputStatus, "sampleLoaded", { count: attendees.length });
  persistAppState();
}

function getCurrentRosterIntake() {
  let attendees = collectRows();
  if (!attendees.length && textInput.value.trim()) {
    attendees = parseInputText(textInput.value);
    resetRows(attendees);
  }
  return attendees;
}

function renderSummary(plan) {
  summaryBoard.innerHTML = "";
  plan.summary
    .filter((item) => item.count > 0)
    .forEach((item) => {
      const categoryText = getCategoryText(item.category, item.label);
      const card = document.createElement("article");
      card.className = "summary-card";
      card.innerHTML = `
        <span class="summary-count">${item.count}</span>
        <strong>${escapeHtml(categoryText)}</strong>
        <small>${escapeHtml(t("seatsCount", { count: item.count, plural: pluralSuffix(item.count) }))}</small>
      `;
      summaryBoard.append(card);
    });
}

function seatClass(seat) {
  if (seat === 1) {
    return "seat-card seat-card--anchor";
  }
  if (seat <= 7) {
    return "seat-card seat-card--core";
  }
  return "seat-card";
}

function renderSeats(plan) {
  seatMap.innerHTML = "";
  plan.seats.forEach((entry) => {
    const card = document.createElement("article");
    card.className = seatClass(entry.seat);
    card.innerHTML = `
      <div class="seat-number">${escapeHtml(t("seatLabel", { seat: entry.seat }))}</div>
      <strong>${escapeHtml(entry.name)}</strong>
      <span>${escapeHtml(entry.title || t("noTitle"))}</span>
      <small>${escapeHtml(getCategoryText(entry.category, entry.categoryLabel))}</small>
    `;
    seatMap.append(card);
  });
}

function renderTable(plan) {
  resultBody.innerHTML = "";
  plan.seats.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.seat}</td>
      <td>${escapeHtml(entry.name)}</td>
      <td>${escapeHtml(entry.title || "")}</td>
      <td>${escapeHtml(entry.organization || "")}</td>
      <td>${escapeHtml(getCategoryText(entry.category, entry.categoryLabel))}</td>
    `;
    resultBody.append(row);
  });
}

function getMockSamplePlan() {
  if (state.recognitionEntries.length) {
    return buildSeatPlan([], state.recognitionEntries);
  }

  return {
    meta: {
      inputCount: 0,
      outputCount: 0,
      seatPattern: [1, 3, 2, 5, 4, 6, 7],
    },
    seats: [],
    summary: [],
  };
}

function isTableScenario(scenario = state.scenario) {
  return TABLE_SCENARIOS.has(scenario);
}

function getTableLabel(scenario = state.scenario) {
  return scenario === "circular" ? t("controlTablesRound") : t("controlTablesLong");
}

function getTableNoun(scenario = state.scenario) {
  return scenario === "circular" ? t("tableNounRound") : t("tableNounLong");
}

function updateSampleModeButton() {
  sampleModeToggle.textContent = state.sampleMode ? t("sampleModeOn") : t("sampleModeOff");
}

function showSamplePlanFromTopBar() {
  state.sampleMode = true;
  updateSampleModeButton();
  renderCurrentPlan(state.lastPlan);
  planStatus.textContent = t("sampleModeOnStatus");
  persistAppState();
}

function openRecognitionPage() {
  const attendees = getCurrentRosterIntake();
  persistRecognitionPageState(attendees.length === 0);
  persistAppState();
  window.location.href = loadRecognitionButton.getAttribute("href") || "./recognition.html";
}

function clearPlanOutputs() {
  summaryBoard.innerHTML = "";
  seatMap.innerHTML = "";
  resultBody.innerHTML = "";
}

function compareAnchorEntries(left, right) {
  const leftNumber = Number(left.number || Number.POSITIVE_INFINITY);
  const rightNumber = Number(right.number || Number.POSITIVE_INFINITY);
  return leftNumber - rightNumber || String(left.name || "").localeCompare(String(right.name || ""));
}

function getResolvedAnchorLabel(plan) {
  if (!plan?.meta?.anchorName) {
    return t("buttonAuto");
  }
  if (state.anchorSelection === "auto") {
    return `${t("buttonAuto")}: ${plan.meta.anchorName}`;
  }
  return plan.meta.anchorName;
}

function buildAnchorSourceEntries(plan) {
  return [...(plan?.seats || [])]
    .sort(compareAnchorEntries)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      title: entry.recognitionTitle || entry.title || "",
      categoryLabel: getCategoryText(entry.category, entry.categoryLabel),
      number: entry.number,
    }));
}

function buildPinnedAnchorEntries() {
  return SAMPLE_OFF_ANCHOR_IDS.map((id) => {
    const recognitionEntry = state.recognitionEntries.find((entry) => entry.id === id);
    if (!recognitionEntry) {
      return null;
    }

    return {
      id: recognitionEntry.id,
      name: recognitionEntry.name,
      title: recognitionEntry.title || "",
      categoryLabel: recognitionEntry.layer === "local_chapter" ? t("category.jci_hk_local") : t("category.jci_hk_national"),
      number: recognitionEntry.number,
    };
  }).filter(Boolean);
}

function syncAnchorOptions(plan) {
  const currentValue = state.anchorSelection || "auto";
  const sourceEntries = buildAnchorSourceEntries(plan);
  const pinnedEntries = state.sampleMode ? [] : buildPinnedAnchorEntries();
  const mergedEntries = [...pinnedEntries];

  sourceEntries.forEach((entry) => {
    if (!mergedEntries.some((item) => item.id === entry.id)) {
      mergedEntries.push(entry);
    }
  });

  mergedEntries.sort(compareAnchorEntries);
  anchorPersonSelect.innerHTML = "";

  const autoOption = document.createElement("option");
  autoOption.value = "auto";
  autoOption.textContent = t("buttonAuto");
  anchorPersonSelect.append(autoOption);

  mergedEntries.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.id;
    const descriptor = [entry.title, entry.categoryLabel].filter(Boolean).join(" / ");
    option.textContent = descriptor ? `${entry.name} (${descriptor})` : entry.name;
    anchorPersonSelect.append(option);
  });

  const selectedValue = mergedEntries.some((entry) => entry.id === currentValue) ? currentValue : "auto";
  state.anchorSelection = selectedValue;
  anchorPersonSelect.value = selectedValue;
  anchorPersonValue.textContent = plan ? getResolvedAnchorLabel(plan) : (anchorPersonSelect.selectedOptions[0]?.textContent || t("buttonAuto"));
}

function getEffectiveAnchorId() {
  return state.anchorSelection === "auto" ? DEFAULT_AUTO_ANCHOR_ID : state.anchorSelection;
}

function getPlanOptions(sampleMode = state.sampleMode) {
  return {
    includeRecognitionList: sampleMode,
    anchorId: state.anchorSelection === "auto" ? undefined : state.anchorSelection,
    defaultAnchorId: DEFAULT_AUTO_ANCHOR_ID,
  };
}

function buildPlanFromState(attendees = state.lastSubmittedAttendees, options = {}) {
  const sampleMode = options.sampleMode ?? state.sampleMode;
  const baseAttendees = Array.isArray(attendees) ? attendees : [];
  const shouldInjectAnchor = !sampleMode && baseAttendees.length > 0;
  const plannedAttendees = shouldInjectAnchor
    ? ensureAnchorInRoster(baseAttendees, state.recognitionEntries, getEffectiveAnchorId())
    : baseAttendees;
  const plan = buildSeatPlan(plannedAttendees, state.recognitionEntries, getPlanOptions(sampleMode));

  return {
    ...plan,
    meta: {
      ...plan.meta,
      anchorInjected: shouldInjectAnchor && plannedAttendees.length > baseAttendees.length,
    },
  };
}

function setSubmittedPlanStatus(plan) {
  setLocalizedStatus(
    outputStatus,
    plan?.meta?.anchorInjected ? "submittedPlanStatusWithAnchor" : "submittedPlanStatusWithoutAnchor",
    { count: plan?.meta?.outputCount || 0 },
  );
}

function syncSeatControlToPlan(plan) {
  const totalSeats = Math.max(1, Math.min(Number(seatCountRange.max) || 24, plan?.meta?.outputCount || 1));
  seatCountRange.value = String(totalSeats);
  seatCountValue.textContent = String(totalSeats);
}

function syncPhotoOrientationControl() {
  const orientation = getPhotoOrientationMeta();
  const visible = state.scenario === "photo";
  photoOrientationControl.hidden = !visible;
  photoOrientationToggle.textContent = orientation.label;
  photoOrientationValue.textContent = orientation.label;
}

function clearCurrentRosterState() {
  resetRows([]);
  textInput.value = "";
  fileInput.value = "";
  state.lastPlan = null;
  state.lastSubmittedAttendees = [];
  state.sampleMode = false;
  state.anchorSelection = "auto";
  updateSampleModeButton();
  syncAnchorOptions(null);
  clearPlanOutputs();
  renderCurrentPlan(null);
  setLocalizedStatus(inputStatus, "rosterClearedInput");
  setLocalizedStatus(outputStatus, "rosterClearedOutput");
  persistAppState();
}

function renderCurrentPlan(plan) {
  const activePlan = state.sampleMode ? getMockSamplePlan() : plan;
  const isMock = state.sampleMode;

  if (!activePlan) {
    centerSeatPlan.innerHTML = "";
    const emptyScenarioMeta = getScenarioMeta();
    scenarioValue.textContent = emptyScenarioMeta.label;
    scenarioTitle.textContent = emptyScenarioMeta.title;
    scenarioCopy.textContent = t("sampleModeOffCopy");
    seatCountValue.textContent = seatCountRange.value;
    tableCountControl.hidden = !isTableScenario();
    syncPhotoOrientationControl();
    tableCountLabel.textContent = getTableLabel();
    tableCountValue.textContent = tableCountRange.value;
    syncAnchorOptions(null);
    planStatus.textContent = t("sampleModeOffStatus");
    return;
  }

  syncAnchorOptions(activePlan);

  const displayPlan = buildDisplayPlan(activePlan, seatCountRange.value);
  const scenarioMeta = getScenarioMeta();
  const tableScenario = isTableScenario();
  const maxTableCount = Math.max(1, Math.min(MAX_TABLE_COUNT, displayPlan.seated.length || 1));

  seatCountValue.textContent = String(displayPlan.controls.seatCount);
  tableCountControl.hidden = !tableScenario;
  syncPhotoOrientationControl();
  tableCountRange.max = String(maxTableCount);
  if (Number(tableCountRange.value) > maxTableCount) {
    tableCountRange.value = String(maxTableCount);
  }
  tableCountLabel.textContent = getTableLabel();
  tableCountValue.textContent = tableCountRange.value;
  scenarioValue.textContent = scenarioMeta.label;
  scenarioTitle.textContent = scenarioMeta.title;

  centerSeatPlan.innerHTML = "";
  let overflowSeats = [];
  let tablePlan = null;

  if (state.scenario === "photo") {
    renderPhotoScenario(displayPlan.seated, isMock);
  } else if (state.scenario === "circular") {
    tablePlan = distributeAcrossTables(displayPlan.seated, tableCountRange.value, CIRCULAR_TABLE_CAPACITY);
    renderCircularScenario(tablePlan, isMock);
  } else {
    tablePlan = distributeAcrossTables(displayPlan.seated, tableCountRange.value);
    renderLongTableScenario(tablePlan, isMock);
  }

  if (state.scenario === "photo") {
    const orientation = getPhotoOrientationMeta();
    scenarioCopy.textContent = `${scenarioMeta.copy} ${orientation.description}`;
  } else {
    scenarioCopy.textContent = tablePlan?.effectiveTableCount
      ? t("tableScenarioShown", {
        copy: scenarioMeta.copy,
        count: tablePlan.effectiveTableCount,
        tableNoun: getTableNoun(),
        plural: pluralSuffix(tablePlan.effectiveTableCount),
      })
      : scenarioMeta.copy;
  }

  if (overflowSeats.length) {
    const overflowGrid = document.createElement("div");
    overflowGrid.className = "overflow-seat-grid";
    overflowSeats.forEach((entry) => {
      const card = document.createElement("article");
      card.className = `plan-seat-card${isMock ? " plan-seat-card--mock" : ""}`;
      card.innerHTML = `
        <span class="plan-seat-card-label">${escapeHtml(t("seatLabel", { seat: entry.seat }))}</span>
        <strong>${escapeHtml(entry.name)}</strong>
        <small>${escapeHtml(entry.title || getCategoryText(entry.category, entry.categoryLabel))}</small>
      `;
      overflowGrid.append(card);
    });
    centerSeatPlan.append(overflowGrid);
  }

  if (tablePlan?.effectiveTableCount) {
    const baseStatus = isMock
      ? t("sampleTableStatus", {
        count: displayPlan.seated.length,
        tableCount: tablePlan.effectiveTableCount,
        tableNoun: getTableNoun(),
        plural: pluralSuffix(tablePlan.effectiveTableCount),
      })
      : t("realTableStatus", {
        count: displayPlan.seated.length,
        tableCount: tablePlan.effectiveTableCount,
        tableNoun: getTableNoun(),
        plural: pluralSuffix(tablePlan.effectiveTableCount),
      });
    planStatus.textContent = tablePlan.capacityTriggered && state.scenario === "circular"
      ? `${baseStatus} ${t("circularCapacityNotice", { capacity: CIRCULAR_TABLE_CAPACITY })}`
      : baseStatus;
    return;
  }

  planStatus.textContent = isMock
    ? t("samplePlanStatus", { count: displayPlan.seated.length })
    : t("realPlanStatus", { count: displayPlan.seated.length });
}

function createPhotoCardMarkup(entry, isHead = false) {
  if (!entry) {
    return `
      <span class="plan-seat-card-label">${isHead ? t("headRank1") : t("openSlot")}</span>
      <strong>${t("open")}</strong>
      <small>${isHead ? t("awaitingHeadAssignment") : t("awaitingAssignment")}</small>
    `;
  }

  const label = isHead ? t("headRank1") : t("rankLabel", { rank: entry.rankOrder });
  const detail = t("seatDetail", {
    seat: entry.seat,
    detail: entry.title || getCategoryText(entry.category, entry.categoryLabel),
  });
  return `
    <span class="plan-seat-card-label">${escapeHtml(label)}</span>
    <strong>${escapeHtml(entry.name)}</strong>
    <small>${escapeHtml(detail)}</small>
  `;
}

function createPhotoCard(entry, isMock, isHead = false) {
  const card = document.createElement("article");
  card.className = `plan-seat-square photo-seat${isHead ? " plan-seat-square--anchor" : ""}${entry ? "" : " plan-seat-square--empty"}${isMock && entry ? " plan-seat-square--mock" : ""}`;
  card.innerHTML = createPhotoCardMarkup(entry, isHead);
  return card;
}

function createPhotoSpacer(kind = "side") {
  const spacer = document.createElement("div");
  spacer.className = kind === "axis" ? "photo-axis-slot" : "photo-spacer";
  return spacer;
}

function createTableClusterLabel(label, seatCount) {
  const chip = document.createElement("div");
  chip.className = "table-cluster-label";
  chip.innerHTML = `
    <span>${escapeHtml(label)}</span>
    <strong>${escapeHtml(t("seatsCount", { count: seatCount, plural: pluralSuffix(seatCount) }))}</strong>
  `;
  return chip;
}

function createStageDirectionBadge(copy = t("stageDirectionTop")) {
  const badge = document.createElement("div");
  badge.className = "table-stage-badge";
  badge.innerHTML = `
    <span class="table-stage-badge-arrow">${escapeHtml(t("stage"))}</span>
    <strong>${escapeHtml(copy)}</strong>
  `;
  return badge;
}

function applyTableLayoutMetrics(layout, tablePlan) {
  const tableCount = Math.max(1, tablePlan.effectiveTableCount || 1);
  const maxSeatsPerTable = Math.max(1, ...tablePlan.groups.map((group) => group.length));

  layout.style.setProperty("--table-count", String(tableCount));
  layout.style.setProperty("--table-seat-count", String(maxSeatsPerTable));
  layout.style.setProperty("--table-cluster-min-height", `clamp(18rem, ${Math.max(28, 48 - tableCount * 3)}vw, ${Math.max(13, 24 - tableCount)}rem)`);
  layout.style.setProperty("--table-seat-scale", `clamp(${Math.max(2.15, 3.05 - maxSeatsPerTable * 0.08).toFixed(2)}rem, ${Math.max(2.8, 6.2 - tableCount * 0.35 - maxSeatsPerTable * 0.16).toFixed(2)}vw, ${Math.max(2.8, 4.95 - tableCount * 0.18 - maxSeatsPerTable * 0.12).toFixed(2)}rem)`);
  layout.style.setProperty("--table-gap-scale", `clamp(0.65rem, ${Math.max(1.4, 2.5 - tableCount * 0.12).toFixed(2)}vw, 1.15rem)`);
}

function applyCircularTableMetrics(circle, seatCount) {
  const normalizedSeatCount = Math.max(1, seatCount);
  circle.style.setProperty("--circle-seat-count", String(normalizedSeatCount));
  circle.style.setProperty("--circle-seat-size", `clamp(${Math.max(2.05, 2.95 - normalizedSeatCount * 0.08).toFixed(2)}rem, ${Math.max(2.5, 5.2 - normalizedSeatCount * 0.22).toFixed(2)}vw, ${Math.max(2.8, 4.7 - normalizedSeatCount * 0.15).toFixed(2)}rem)`);
  circle.style.setProperty("--circle-radius", `clamp(${Math.max(4.45, 5.5 - normalizedSeatCount * 0.08).toFixed(2)}rem, ${Math.max(5.5, 9.8 + normalizedSeatCount * 0.18).toFixed(2)}vw, ${Math.max(6, 8.5 - normalizedSeatCount * 0.04).toFixed(2)}rem)`);
  circle.style.setProperty("--circle-core-size", `clamp(${Math.max(4.2, 5.4 - normalizedSeatCount * 0.08).toFixed(2)}rem, ${Math.max(4.8, 7.1 - normalizedSeatCount * 0.12).toFixed(2)}vw, ${Math.max(5.3, 6.9 - normalizedSeatCount * 0.07).toFixed(2)}rem)`);
}

function renderPhotoScenario(seatedEntries, isMock) {
  const photoLayout = buildPhotoLayout(seatedEntries, Math.max(1, seatedEntries.length));
  const leftEntries = photoLayout.rows.flatMap((row) => row.left);
  const rightEntries = photoLayout.rows.flatMap((row) => row.right);
  const flankSlots = Math.max(leftEntries.length, rightEntries.length, 1);
  const totalColumns = flankSlots * 2 + 1;
  const board = document.createElement("section");
  board.className = "photo-board";
  const mirrored = state.photoOrientation === "from_audience";
  const orientation = getPhotoOrientationMeta();
  const orientationBadge = document.createElement("div");
  orientationBadge.className = "photo-orientation-badge";
  orientationBadge.textContent = orientation.label;
  const lineRow = document.createElement("div");
  const stageFacingLeftCells = [...Array(Math.max(flankSlots - leftEntries.length, 0)).fill(null), ...[...leftEntries].reverse()];
  const stageFacingRightCells = [...rightEntries, ...Array(Math.max(flankSlots - rightEntries.length, 0)).fill(null)];
  const audienceFacingLeftCells = [...Array(Math.max(flankSlots - rightEntries.length, 0)).fill(null), ...[...rightEntries].reverse()];
  const audienceFacingRightCells = [...leftEntries, ...Array(Math.max(flankSlots - leftEntries.length, 0)).fill(null)];
  const leftCells = mirrored ? audienceFacingLeftCells : stageFacingLeftCells;
  const rightCells = mirrored ? audienceFacingRightCells : stageFacingRightCells;

  lineRow.className = "photo-row photo-row--single-line";
  lineRow.style.setProperty("--photo-columns", String(totalColumns));

  leftCells.forEach((entry) => {
    lineRow.append(entry ? createPhotoCard(entry, isMock) : createPhotoSpacer());
  });

  lineRow.append(photoLayout.head ? createPhotoCard(photoLayout.head, isMock, true) : createPhotoSpacer("axis"));

  rightCells.forEach((entry) => {
    lineRow.append(entry ? createPhotoCard(entry, isMock) : createPhotoSpacer());
  });

  board.append(orientationBadge, lineRow);
  centerSeatPlan.append(board);
}

function renderCircularScenario(tablePlan, isMock) {
  const layout = document.createElement("section");
  layout.className = "table-layout table-layout--circular";
  applyTableLayoutMetrics(layout, tablePlan);

  tablePlan.groups.forEach((group, index) => {
    const cluster = document.createElement("article");
    cluster.className = "table-cluster";
    cluster.append(createStageDirectionBadge());
    cluster.append(createTableClusterLabel(t("roundTableLabel", { count: index + 1 }), group.length));

    const circle = document.createElement("div");
    circle.className = "circular-board";
    applyCircularTableMetrics(circle, group.length);

    buildCircularSeatLayout(group).forEach(({ entry, angle, seatNumber }) => {
      const node = document.createElement("article");
      node.className = `circular-seat${seatNumber === 1 ? " circular-seat--anchor" : ""}${isMock ? " circular-seat--mock" : ""}`;
      node.style.setProperty("--seat-angle", `${angle}deg`);
      node.innerHTML = `
        <span class="plan-seat-card-label">${escapeHtml(t("seatLabel", { seat: seatNumber }))}</span>
        <strong>${escapeHtml(entry.name)}</strong>
      `;
      circle.append(node);
    });

    const tableCore = document.createElement("div");
    tableCore.className = "circular-table-core";
    tableCore.innerHTML = `
      <span class="plan-seat-card-label">${escapeHtml(t("tableLabel", { count: index + 1 }))}</span>
      <strong>${escapeHtml(t("roundProtocolTable"))}</strong>
      <small>${escapeHtml(t("seatsCount", { count: group.length, plural: pluralSuffix(group.length) }))}</small>
    `;
    circle.append(tableCore);
    cluster.append(circle);
    layout.append(cluster);
  });

  centerSeatPlan.append(layout);
}

function createLongTableBoard(seatedEntries, isMock) {
  const table = document.createElement("div");
  table.className = "long-table-board";
  table.style.setProperty("--long-table-seat-count", String(Math.max(1, seatedEntries.length)));

  const headSeat = seatedEntries[0] || null;
  const flankSeats = seatedEntries.slice(1);
  const leftSeats = flankSeats.filter((_, index) => index % 2 === 0);
  const rightSeats = flankSeats.filter((_, index) => index % 2 === 1);

  const leftColumn = document.createElement("div");
  leftColumn.className = "long-table-column";
  leftSeats.forEach((entry) => {
    const card = document.createElement("article");
    card.className = `long-table-seat${isMock ? " long-table-seat--mock" : ""}`;
    card.innerHTML = `
      <span class="plan-seat-card-label">${escapeHtml(t("seatLabel", { seat: entry.seat }))}</span>
      <strong>${escapeHtml(entry.name)}</strong>
    `;
    leftColumn.append(card);
  });

  const centerColumn = document.createElement("div");
  centerColumn.className = "long-table-center";
  centerColumn.innerHTML = `
    <article class="long-table-head${headSeat?.seat === 1 ? " long-table-head--anchor" : ""}${isMock ? " long-table-head--mock" : ""}">
      <span class="plan-seat-card-label">${escapeHtml(t("seatLabel", { seat: headSeat?.seat ?? 1 }))}</span>
      <strong>${escapeHtml(headSeat?.name || t("open"))}</strong>
      <small>${escapeHtml(headSeat?.title || t("headSeatTitle"))}</small>
    </article>
    <div class="long-table-surface">${escapeHtml(t("longTableAxis"))}</div>
  `;

  const rightColumn = document.createElement("div");
  rightColumn.className = "long-table-column";
  rightSeats.forEach((entry) => {
    const card = document.createElement("article");
    card.className = `long-table-seat${isMock ? " long-table-seat--mock" : ""}`;
    card.innerHTML = `
      <span class="plan-seat-card-label">${escapeHtml(t("seatLabel", { seat: entry.seat }))}</span>
      <strong>${escapeHtml(entry.name)}</strong>
    `;
    rightColumn.append(card);
  });

  table.append(leftColumn, centerColumn, rightColumn);
  return table;
}

function renderLongTableScenario(tablePlan, isMock) {
  const layout = document.createElement("section");
  layout.className = "table-layout table-layout--long";
  applyTableLayoutMetrics(layout, tablePlan);

  tablePlan.groups.forEach((group, index) => {
    const cluster = document.createElement("article");
    cluster.className = "table-cluster table-cluster--long";
    cluster.append(createStageDirectionBadge());
    cluster.append(createTableClusterLabel(t("longTableLabel", { count: index + 1 }), group.length));
    cluster.append(createLongTableBoard(group, isMock));
    layout.append(cluster);
  });

  centerSeatPlan.append(layout);
}

function arrangeFromCurrentInput() {
  let attendees = collectRows();
  if (!attendees.length && textInput.value.trim()) {
    attendees = parseInputText(textInput.value);
    resetRows(attendees);
  }
  if (!attendees.length) {
    setLocalizedStatus(outputStatus, "addAttendeeBeforePlan");
    return;
  }

  state.lastSubmittedAttendees = attendees;
  state.sampleMode = false;
  const plan = buildPlanFromState(attendees, { sampleMode: false });
  state.lastPlan = plan;
  updateSampleModeButton();
  syncSeatControlToPlan(plan);
  renderSummary(plan);
  renderCurrentPlan(plan);
  renderSeats(plan);
  renderTable(plan);
  setSubmittedPlanStatus(plan);
  persistAppState();
}

function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = state.theme;
  themeToggle.textContent = state.theme === "light" ? t("buttonThemeDark") : t("buttonThemeLight");
  persistAppState();
}

function rerenderLocalizedSurfaces() {
  updateStaticTranslations();
  updateManualRowTranslations();
  refreshStoredStatuses();

  if (state.lastPlan) {
    renderSummary(state.lastPlan);
    renderSeats(state.lastPlan);
    renderTable(state.lastPlan);
  }

  renderCurrentPlan(state.lastPlan);
}

function toggleLanguage() {
  state.language = state.language === "en" ? "zhHant" : "en";
  rerenderLocalizedSurfaces();
  persistAppState();
}

document.getElementById("addRowButton").addEventListener("click", () => {
  createRow();
});

arrangeButton.addEventListener("click", showSamplePlanFromTopBar);
submitRosterButton.addEventListener("click", arrangeFromCurrentInput);

document.getElementById("loadSampleButton").addEventListener("click", async () => {
  await loadSampleAttendees();
});

loadRecognitionButton.addEventListener("click", (event) => {
  event.preventDefault();
  openRecognitionPage();
});

themeToggle.addEventListener("click", toggleTheme);
languageToggle.addEventListener("click", toggleLanguage);
clearRosterButton.addEventListener("click", clearCurrentRosterState);

sampleModeToggle.addEventListener("click", () => {
  state.sampleMode = !state.sampleMode;
  updateSampleModeButton();

  if (state.sampleMode) {
    renderCurrentPlan(null);
    return;
  }

  if (!state.lastPlan) {
    planStatus.textContent = t("sampleModeOffStatus");
    renderCurrentPlan(null);
    persistAppState();
    return;
  }

  state.lastPlan = buildPlanFromState();
  syncSeatControlToPlan(state.lastPlan);
  renderSummary(state.lastPlan);
  renderCurrentPlan(state.lastPlan);
  renderSeats(state.lastPlan);
  renderTable(state.lastPlan);
  persistAppState();
});

manualRows.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".row-remove");
  if (!removeButton) {
    return;
  }
  removeButton.closest(".manual-row")?.remove();
  if (!manualRows.querySelector(".manual-row")) {
    createRow();
  }
  persistAppState();
});

manualRows.addEventListener("input", persistAppState);
manualRows.addEventListener("change", persistAppState);
textInput.addEventListener("input", persistAppState);
textInput.addEventListener("change", persistAppState);

fileInput.addEventListener("change", async () => {
  const [file] = fileInput.files;
  if (!file) {
    return;
  }
  const text = await file.text();
  const attendees = parseInputText(text);
  resetRows(attendees);
  textInput.value = "";
  setLocalizedStatus(inputStatus, "fileLoaded", { count: attendees.length });
  persistAppState();
});

seatCountRange.addEventListener("input", () => {
  seatCountValue.textContent = seatCountRange.value;
  renderCurrentPlan(state.lastPlan);
  persistAppState();
});

tableCountRange.addEventListener("input", () => {
  tableCountValue.textContent = tableCountRange.value;
  renderCurrentPlan(state.lastPlan);
  persistAppState();
});

scenarioSelect.addEventListener("change", () => {
  state.scenario = scenarioSelect.value;
  renderCurrentPlan(state.lastPlan);
  persistAppState();
});

photoOrientationToggle.addEventListener("click", () => {
  state.photoOrientation = state.photoOrientation === "facing_audience" ? "from_audience" : "facing_audience";
  syncPhotoOrientationControl();
  renderCurrentPlan(state.lastPlan);
  persistAppState();
});

anchorPersonSelect.addEventListener("change", () => {
  state.anchorSelection = anchorPersonSelect.value;
  const nextPlan = buildPlanFromState();

  if (!state.sampleMode && !state.lastSubmittedAttendees.length) {
    anchorPersonValue.textContent = anchorPersonSelect.selectedOptions[0]?.textContent || t("buttonAuto");
    persistAppState();
    return;
  }

  state.lastPlan = nextPlan;
  syncSeatControlToPlan(nextPlan);
  renderSummary(nextPlan);
  renderCurrentPlan(nextPlan);
  renderSeats(nextPlan);
  renderTable(nextPlan);
  if (state.sampleMode) {
    setLocalizedStatus(outputStatus, "recognitionSampleUpdated");
    persistAppState();
    return;
  }

  setSubmittedPlanStatus(nextPlan);
  persistAppState();
});

await loadRecognitionEntries();
const hydrated = applyStoredAppState();
if (state.lastSubmittedAttendees.length) {
  state.lastPlan = buildPlanFromState(state.lastSubmittedAttendees, { sampleMode: false });
}
updateStaticTranslations();
updateSampleModeButton();
if (!hydrated) {
  document.documentElement.dataset.theme = state.theme;
  resetRows([]);
}
if (state.lastPlan) {
  renderSummary(state.lastPlan);
  renderSeats(state.lastPlan);
  renderTable(state.lastPlan);
}
syncAnchorOptions(state.lastPlan);
syncPhotoOrientationControl();
renderCurrentPlan(state.lastPlan);
persistAppState();
