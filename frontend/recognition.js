/*
## Metadata
name: JCI Recognition List Page
description: Dedicated recognition-list page for the rebuilt JCI seating app, supporting sample mode and roster-driven recognition matches.
*/

import { buildRecognitionEntries, buildRecognitionOnlyRoster, mapRecognitionLayerToCategory } from "./logic.js";

const APP_STATE_STORAGE_KEY = "jciProtocolDeskAppState";
const RECOGNITION_PAGE_STATE_KEY = "jciRecognitionPageState";

const state = {
  theme: "light",
  language: "en",
  sampleMode: true,
  recognitionEntries: [],
  rosterAttendees: [],
};

const themeToggle = document.getElementById("themeToggle");
const languageToggle = document.getElementById("languageToggle");
const recognitionSampleModeToggle = document.getElementById("recognitionSampleModeToggle");
const recognitionModeInlineToggle = document.getElementById("recognitionModeInlineToggle");
const recognitionModeValue = document.getElementById("recognitionModeValue");
const recognitionCountValue = document.getElementById("recognitionCountValue");
const recognitionStatus = document.getElementById("recognitionStatus");
const recognitionSourceTitleText = document.getElementById("recognitionSourceTitleText");
const recognitionSourceCopy = document.getElementById("recognitionSourceCopy");
const recognitionSummaryBoard = document.getElementById("recognitionSummaryBoard");
const recognitionSeatMap = document.getElementById("recognitionSeatMap");
const recognitionResultBody = document.getElementById("recognitionResultBody");
const metaDescription = document.querySelector('meta[name="description"]');

const TRANSLATIONS = {
  en: {
    documentTitle: "JCI Recognition List",
    documentDescription: "Recognition-list view for the rebuilt JCI protocol seating desk.",
    recognitionEyebrow: "Recognition List",
    recognitionPageTitle: "Recognition list desk",
    recognitionPanelTitle: "Recognition list",
    buttonLanguage: "繁中",
    buttonThemeDark: "Dark theme",
    buttonThemeLight: "Light theme",
    sampleModeOn: "Sample mode on",
    sampleModeOff: "Sample mode off",
    buttonBackToPlanner: "Back to planner",
    recognitionModeTitle: "Source mode",
    recognitionModeLabel: "Recognition source",
    recognitionMatchedLabel: "Recognition entries",
    recognitionSourceTitle: "Current source",
    recognitionSampleSourceTitle: "Sample recognition list",
    recognitionRosterSourceTitle: "Roster-matched recognition list",
    recognitionSampleSourceCopy: "Showing the full recognition list in ranking order for protocol review.",
    recognitionRosterSourceCopy: "Showing only recognition-list entries matched from the current Roster intake input.",
    recognitionStatusSample: "{count} recognition-list entries loaded from the full sample list.",
    recognitionStatusRoster: "{count} recognition-list entries matched from the current roster intake input.",
    recognitionStatusNoRoster: "No roster intake data was found. Turn sample mode on or return to the planner and add roster entries.",
    recognitionStatusNoMatches: "No recognition-list matches were found in the current roster intake input.",
    recognitionRank: "Recognition",
    tableName: "Name",
    tableTitle: "Title",
    tableOrganization: "Organization",
    tableCategory: "Category",
    noTitle: "No title",
    recognitionRankLabel: "Recognition {rank}",
    recognitionCardMeta: "No. {rank}",
    category: {
      jci_hk_national: "JCI HK (National)",
      jci_hk_local: "JCI HK (local Chapter)",
    },
  },
  zhHant: {
    documentTitle: "JCI 認可名單",
    documentDescription: "重新建立的 JCI 禮賓座位編排系統之認可名單頁面。",
    recognitionEyebrow: "認可名單",
    recognitionPageTitle: "認可名單工作台",
    recognitionPanelTitle: "認可名單",
    buttonLanguage: "ENG",
    buttonThemeDark: "深色主題",
    buttonThemeLight: "淺色主題",
    sampleModeOn: "範例模式開啟",
    sampleModeOff: "範例模式關閉",
    buttonBackToPlanner: "返回主頁",
    recognitionModeTitle: "來源模式",
    recognitionModeLabel: "認可名單來源",
    recognitionMatchedLabel: "認可名單人數",
    recognitionSourceTitle: "目前來源",
    recognitionSampleSourceTitle: "範例認可名單",
    recognitionRosterSourceTitle: "名單輸入配對結果",
    recognitionSampleSourceCopy: "顯示完整認可名單，按正式排名次序供禮賓檢視。",
    recognitionRosterSourceCopy: "只顯示由目前名單輸入配對到的認可名單成員。",
    recognitionStatusSample: "已載入完整認可名單，共 {count} 位。",
    recognitionStatusRoster: "已根據目前名單輸入配對到 {count} 位認可名單成員。",
    recognitionStatusNoRoster: "找不到名單輸入資料。請開啟範例模式，或返回主頁新增名單。",
    recognitionStatusNoMatches: "目前名單輸入中沒有任何認可名單配對。",
    recognitionRank: "認可排名",
    tableName: "姓名",
    tableTitle: "職銜",
    tableOrganization: "機構",
    tableCategory: "類別",
    noTitle: "無職銜",
    recognitionRankLabel: "認可排名 {rank}",
    recognitionCardMeta: "排名 {rank}",
    category: {
      jci_hk_national: "香港總會",
      jci_hk_local: "香港分會",
    },
  },
};

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
    // Ignore storage failures.
  }
}

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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getCategoryText(category) {
  return t(`category.${category}`) || category;
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
        manualLayer: "",
      };
    })
    .filter(Boolean);
}

function parseInputText(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return [];
  }
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      return parsed.map((entry, index) => ({
        id: entry.id || `json-${index + 1}`,
        name: (entry.name || "").trim(),
        title: (entry.title || "").trim(),
        organization: (entry.organization || "").trim(),
        manualLayer: entry.manualLayer || entry.guestLayer || "",
      })).filter((entry) => entry.name);
    } catch {
      return [];
    }
  }
  return parseLooseCsv(trimmed);
}

function hydrateStateFromStorage() {
  const appState = readStorageJson(APP_STATE_STORAGE_KEY) || {};
  const recognitionPageState = readStorageJson(RECOGNITION_PAGE_STATE_KEY) || {};

  if (appState.theme === "light" || appState.theme === "dark") {
    state.theme = appState.theme;
  }
  if (appState.language === "en" || appState.language === "zhHant") {
    state.language = appState.language;
  }
  if (typeof recognitionPageState.sampleMode === "boolean") {
    state.sampleMode = recognitionPageState.sampleMode;
  } else if (typeof appState.sampleMode === "boolean") {
    state.sampleMode = appState.sampleMode;
  }

  const draftRows = Array.isArray(appState.rows)
    ? appState.rows.filter((entry) => (entry.name || "").trim())
    : [];
  const draftTextAttendees = draftRows.length ? [] : parseInputText(appState.textInput || "");

  state.rosterAttendees = draftRows.length
    ? draftRows
    : draftTextAttendees.length
      ? draftTextAttendees
      : Array.isArray(appState.lastSubmittedAttendees) && appState.lastSubmittedAttendees.length
        ? appState.lastSubmittedAttendees
        : [];

  document.documentElement.dataset.theme = state.theme;
}

async function loadRecognitionEntries() {
  const response = await fetch("./data/recognition-list.json");
  const payload = await response.json();
  state.recognitionEntries = payload.entries || [];
}

function getRecognitionPageEntries() {
  if (state.sampleMode) {
    return buildRecognitionEntries(state.recognitionEntries).map((entry) => ({
      ...entry,
      category: mapRecognitionLayerToCategory(entry.layer) || "jci_hk_national",
    }));
  }

  return buildRecognitionOnlyRoster(state.rosterAttendees, state.recognitionEntries).map((entry) => ({
    ...entry,
    category: mapRecognitionLayerToCategory(entry.layer) || "jci_hk_national",
  }));
}

function renderRecognitionSummary(entries) {
  recognitionSummaryBoard.innerHTML = "";
  const summary = new Map();

  entries.forEach((entry) => {
    const category = entry.category || "jci_hk_national";
    summary.set(category, (summary.get(category) || 0) + 1);
  });

  [...summary.entries()].forEach(([category, count]) => {
    const card = document.createElement("article");
    card.className = "summary-card";
    card.innerHTML = `
      <span class="summary-count">${count}</span>
      <strong>${escapeHtml(getCategoryText(category))}</strong>
      <small>${escapeHtml(t("recognitionRankLabel", { rank: count }))}</small>
    `;
    recognitionSummaryBoard.append(card);
  });
}

function renderRecognitionCards(entries) {
  recognitionSeatMap.innerHTML = "";

  entries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = `seat-card${entry.number === 1 ? " seat-card--anchor" : ""}`;
    card.innerHTML = `
      <div class="seat-number">${escapeHtml(t("recognitionCardMeta", { rank: entry.number }))}</div>
      <strong>${escapeHtml(entry.name)}</strong>
      <span>${escapeHtml(entry.title || t("noTitle"))}</span>
      <small>${escapeHtml(getCategoryText(entry.category))}</small>
    `;
    recognitionSeatMap.append(card);
  });
}

function renderRecognitionTable(entries) {
  recognitionResultBody.innerHTML = "";

  entries.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(String(entry.number || ""))}</td>
      <td>${escapeHtml(entry.name)}</td>
      <td>${escapeHtml(entry.title || "")}</td>
      <td>${escapeHtml(entry.organization || "")}</td>
      <td>${escapeHtml(getCategoryText(entry.category))}</td>
    `;
    recognitionResultBody.append(row);
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
  recognitionSampleModeToggle.textContent = state.sampleMode ? t("sampleModeOn") : t("sampleModeOff");
  recognitionModeInlineToggle.textContent = state.sampleMode ? t("sampleModeOn") : t("sampleModeOff");
  recognitionModeValue.textContent = state.sampleMode ? t("sampleModeOn") : t("sampleModeOff");

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (key) {
      node.textContent = t(key);
    }
  });
}

function persistRecognitionPageState() {
  writeStorageJson(RECOGNITION_PAGE_STATE_KEY, { sampleMode: state.sampleMode });
}

function renderRecognitionPage() {
  updateStaticTranslations();
  const entries = getRecognitionPageEntries();
  recognitionCountValue.textContent = String(entries.length);

  if (state.sampleMode) {
    recognitionSourceTitleText.textContent = t("recognitionSampleSourceTitle");
    recognitionSourceCopy.textContent = t("recognitionSampleSourceCopy");
    recognitionStatus.textContent = t("recognitionStatusSample", { count: entries.length });
  } else if (!state.rosterAttendees.length) {
    recognitionSourceTitleText.textContent = t("recognitionRosterSourceTitle");
    recognitionSourceCopy.textContent = t("recognitionRosterSourceCopy");
    recognitionStatus.textContent = t("recognitionStatusNoRoster");
  } else if (!entries.length) {
    recognitionSourceTitleText.textContent = t("recognitionRosterSourceTitle");
    recognitionSourceCopy.textContent = t("recognitionRosterSourceCopy");
    recognitionStatus.textContent = t("recognitionStatusNoMatches");
  } else {
    recognitionSourceTitleText.textContent = t("recognitionRosterSourceTitle");
    recognitionSourceCopy.textContent = t("recognitionRosterSourceCopy");
    recognitionStatus.textContent = t("recognitionStatusRoster", { count: entries.length });
  }

  renderRecognitionSummary(entries);
  renderRecognitionCards(entries);
  renderRecognitionTable(entries);
}

function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = state.theme;

  const appState = readStorageJson(APP_STATE_STORAGE_KEY) || {};
  appState.theme = state.theme;
  writeStorageJson(APP_STATE_STORAGE_KEY, appState);

  renderRecognitionPage();
}

function toggleLanguage() {
  state.language = state.language === "en" ? "zhHant" : "en";

  const appState = readStorageJson(APP_STATE_STORAGE_KEY) || {};
  appState.language = state.language;
  writeStorageJson(APP_STATE_STORAGE_KEY, appState);

  renderRecognitionPage();
}

function toggleSampleMode() {
  state.sampleMode = !state.sampleMode;
  persistRecognitionPageState();
  renderRecognitionPage();
}

themeToggle.addEventListener("click", toggleTheme);
languageToggle.addEventListener("click", toggleLanguage);
recognitionSampleModeToggle.addEventListener("click", toggleSampleMode);
recognitionModeInlineToggle.addEventListener("click", toggleSampleMode);

hydrateStateFromStorage();
await loadRecognitionEntries();
persistRecognitionPageState();
renderRecognitionPage();
