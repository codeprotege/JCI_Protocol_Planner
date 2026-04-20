/*
## Metadata
name: JCI Seating Shared Logic
description: Standalone protocol logic used by the rebuilt webapp to classify attendees and assign ceremonial seats client-side.
*/

export const HIGH_RANKING_TITLES = [
  "Chief Executive",
  "Chief Secretary",
  "Financial Secretary",
  "Secretary of Justice",
];

export const LOCAL_KEYWORDS = ["Hong Kong", "HK", "HKSAR"];
export const GOVERNMENT_KEYWORDS = [
  "government",
  "bureau",
  "department",
  "legislative council",
  "executive council",
  "policy bureau",
  "secretariat",
  "office",
];
export const PRIMARY_SEAT_PATTERN = [1, 3, 2, 5, 4, 6, 7];
export const CATEGORY_ORDER = [
  "hk_gov",
  "goh",
  "sponsor",
  "jci",
  "jci_hk_national",
  "sister_chapter",
  "jci_hk_local",
  "needs_layer",
];

export const JCI_HK_LOCAL_CHAPTERS = [
  "jci victoria",
  "jci kowloon",
  "jci island",
  "jci peninsula",
  "jci hong kong jayceettes",
  "jci lion rock",
  "jci harbour",
  "jci yuen long",
  "jci tai ping shan",
  "jci bauhinia",
  "jci dragon",
  "jci east kowloon",
  "jci city",
  "jci queensway",
  "jci north district",
  "jci ocean",
  "jci sha tin",
  "jci apex",
  "jci city lady",
  "jci tsuen wan",
  "jci lantau",
];

export function normalizePersonName(name = "", options = {}) {
  const stripHonorific = options.stripHonorific ?? false;
  let normalized = String(name)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim();

  if (stripHonorific) {
    normalized = normalized.replace(/^senator\s+/i, "").trim();
  }

  return normalized;
}

export function isLocalOfficial(title = "", organization = "") {
  const haystack = `${title} ${organization}`.toLowerCase();
  const hasLocalMarker = LOCAL_KEYWORDS.some((keyword) => haystack.includes(keyword.toLowerCase()));
  const hasGovernmentMarker = GOVERNMENT_KEYWORDS.some((keyword) => haystack.includes(keyword));

  return hasLocalMarker && hasGovernmentMarker;
}

export function isHighRanking(title = "") {
  return HIGH_RANKING_TITLES.some((item) => title.includes(item));
}

export function isJciMember(organization = "") {
  return organization.includes("JCI");
}

export function isJciHkMember(organization = "") {
  const normalized = organization.replaceAll(",", " ").trim().toLowerCase();
  return normalized.includes("jci hk") || normalized.includes("jci hong kong");
}

export function isJciHkNationalRole(title = "") {
  const normalized = String(title).toLowerCase();
  return !isJciHkLocalChapterRole(title, "") && (
    normalized.includes("national") ||
    normalized.includes("inaugural ceremony") ||
    normalized.includes("national convention") ||
    normalized.includes("jci president")
  );
}

export function isJciHkLocalChapterRole(title = "", organization = "") {
  const haystack = `${title} ${organization}`.toLowerCase().replaceAll(",", " ");
  return JCI_HK_LOCAL_CHAPTERS.some((chapter) => haystack.includes(chapter));
}

export function isOverseasDelegate(organization = "") {
  return isJciMember(organization) && !isJciHkMember(organization) && !isLocalOfficial("", organization);
}

export function isSponsor(attendee = {}) {
  const haystack = `${attendee.title || ""} ${attendee.organization || ""}`.toLowerCase();
  return haystack.includes("sponsor");
}

export function isSisterChapter(attendee = {}) {
  const haystack = `${attendee.title || ""} ${attendee.organization || ""}`.toLowerCase();
  return haystack.includes("sister chapter") || haystack.includes("twinning chapter");
}

export function mapRecognitionLayerToCategory(layer) {
  if (layer === "local_chapter") {
    return "jci_hk_local";
  }
  if (layer === "national") {
    return "jci_hk_national";
  }
  return null;
}

export function getCategoryLabel(category) {
  return {
    hk_gov: "HK Gov",
    goh: "GOH",
    sponsor: "Sponsor",
    jci: "JCI",
    jci_hk_national: "JCI HK (National)",
    sister_chapter: "Sister Chapter of JCI HK (local Chapter)",
    jci_hk_local: "JCI HK (local Chapter)",
    needs_layer: "Needs layer selection",
  }[category];
}

export function normalizeAttendee(attendee, fallbackIndex = 1) {
  return {
    id: attendee.id || `attendee-${fallbackIndex}`,
    name: (attendee.name || "").trim(),
    title: (attendee.title || "").trim(),
    organization: (attendee.organization || "").trim(),
    layer: attendee.layer,
    manualLayer: attendee.manualLayer || attendee.guestLayer,
    number: attendee.number,
    source: attendee.source || "user",
  };
}

export function buildRecognitionIndex(recognitionEntries = []) {
  const exact = new Map();
  const alias = new Map();

  recognitionEntries.forEach((entry, position) => {
    const normalized = normalizeAttendee(entry, position + 1);
    if (!normalized.name) {
      return;
    }

    const exactKey = normalizePersonName(normalized.name);
    const aliasKey = normalizePersonName(normalized.name, { stripHonorific: true });
    if (!exactKey) {
      return;
    }

    const currentRank = Number(normalized.number || position + 1);
    const existingExact = exact.get(exactKey);
    if (!existingExact || currentRank < Number(existingExact.number || Number.POSITIVE_INFINITY)) {
      exact.set(exactKey, normalized);
    }

    if (aliasKey) {
      const aliasEntries = alias.get(aliasKey) || [];
      aliasEntries.push(normalized);
      alias.set(aliasKey, aliasEntries);
    }
  });

  return { exact, alias };
}

export function findRecognitionMatch(attendee, recognitionIndex = { exact: new Map(), alias: new Map() }) {
  const exactKey = normalizePersonName(attendee.name || "");
  const exactMatch = recognitionIndex.exact.get(exactKey);
  if (exactMatch) {
    return exactMatch;
  }

  const aliasKey = normalizePersonName(attendee.name || "", { stripHonorific: true });
  const aliasMatches = recognitionIndex.alias.get(aliasKey) || [];
  if (aliasMatches.length === 1) {
    return aliasMatches[0];
  }

  return null;
}

export function getCategory(attendee, recognitionIndex = { exact: new Map(), alias: new Map() }) {
  const title = attendee.title || "";
  const organization = attendee.organization || "";
  const recognizedEntry = findRecognitionMatch(attendee, recognitionIndex);
  const explicitCategory = attendee.manualLayer || attendee.guestLayer;
  const recognitionCategory = mapRecognitionLayerToCategory(recognizedEntry?.layer);

  if (CATEGORY_ORDER.includes(explicitCategory)) {
    return explicitCategory;
  }

  if (isLocalOfficial(title, organization)) {
    return "hk_gov";
  }
  if (title.includes("GOH")) {
    return "goh";
  }
  if (isSponsor(attendee)) {
    return "sponsor";
  }
  if (recognitionCategory) {
    return recognitionCategory;
  }
  if (isSisterChapter(attendee)) {
    return "sister_chapter";
  }
  if (isJciHkMember(organization) && isJciHkNationalRole(title)) {
    return "jci_hk_national";
  }
  if (isJciHkMember(organization) && isJciHkLocalChapterRole(title, organization)) {
    return "jci_hk_local";
  }
  if (isJciHkMember(organization)) {
    return "needs_layer";
  }
  if (isOverseasDelegate(organization)) {
    return "jci";
  }
  if (isJciMember(organization)) {
    return "jci";
  }
  return "needs_layer";
}

export function getRank(attendee) {
  if (attendee.source === "recognition_list" || attendee.recognitionMatched) {
    return Number(attendee.number || 999);
  }
  if ((attendee.title || "").includes("GOH")) {
    return isHighRanking(attendee.title || "") ? 0 : 1;
  }
  return 999;
}

function isDefaultAnchorEntry(entry) {
  const normalizedName = normalizePersonName(entry.name || "");
  const roleText = `${entry.recognitionTitle || ""} ${entry.title || ""} ${entry.organization || ""}`.toLowerCase();

  return (
    entry.id === "jci-hk-80" ||
    normalizedName === "vincent pang" && roleText.includes("jci ocean president")
  );
}

function isLocalChapterPresidentEntry(entry) {
  const roleText = `${entry.recognitionTitle || ""} ${entry.title || ""}`.toLowerCase();
  return entry.category === "jci_hk_local" && roleText.includes("president");
}

function resolveAutoAnchorEntry(entries = [], options = {}) {
  const defaultAnchorId = options.defaultAnchorId || "jci-hk-80";
  const byDefaultId = entries.find((entry) => entry.id === defaultAnchorId || entry.recognitionId === defaultAnchorId);
  if (byDefaultId) {
    return byDefaultId;
  }

  const defaultEntry = entries.find((entry) => isDefaultAnchorEntry(entry));
  if (defaultEntry) {
    return defaultEntry;
  }

  const localChapterPresident = entries.find((entry) => isLocalChapterPresidentEntry(entry));
  if (localChapterPresident) {
    return localChapterPresident;
  }

  return entries[0] || null;
}

function resolveAnchorSelection(entries = [], options = {}) {
  const requestedAnchorId = options.anchorId;
  const requestedEntry = requestedAnchorId
    ? entries.find((entry) => entry.id === requestedAnchorId || entry.recognitionId === requestedAnchorId)
    : null;

  if (requestedEntry) {
    return {
      anchorEntry: requestedEntry,
      anchorMode: "manual",
    };
  }

  return {
    anchorEntry: resolveAutoAnchorEntry(entries, options),
    anchorMode: "auto",
  };
}

export function buildRecognitionEntries(recognitionEntries = []) {
  return recognitionEntries
    .map((entry, index) => normalizeAttendee(entry, index + 1))
    .filter((entry) => entry.name)
    .sort((left, right) => getRank(left) - getRank(right) || left.name.localeCompare(right.name));
}

export function buildRecognitionOnlyRoster(attendees = [], recognitionEntries = []) {
  const recognitionIndex = buildRecognitionIndex(recognitionEntries);
  const seen = new Set();
  const matchedEntries = [];

  attendees.forEach((attendee, index) => {
    const normalized = normalizeAttendee(attendee, index + 1);
    if (!normalized.name) {
      return;
    }

    const matchedEntry = findRecognitionMatch(normalized, recognitionIndex);
    if (!matchedEntry || seen.has(matchedEntry.id)) {
      return;
    }

    seen.add(matchedEntry.id);
    matchedEntries.push({
      ...matchedEntry,
      recognitionId: matchedEntry.id,
      source: "recognition_list",
    });
  });

  return matchedEntries;
}

export function ensureAnchorInRoster(attendees = [], recognitionEntries = [], anchorId) {
  if (!anchorId) {
    return attendees;
  }

  const recognitionEntry = recognitionEntries.find((entry) => entry.id === anchorId);
  if (!recognitionEntry) {
    return attendees;
  }

  const recognitionIndex = buildRecognitionIndex(recognitionEntries);
  const alreadyPresent = attendees.some((attendee, index) => {
    const normalized = normalizeAttendee(attendee, index + 1);
    if (normalized.id === anchorId) {
      return true;
    }

    const matchedEntry = findRecognitionMatch(normalized, recognitionIndex);
    return matchedEntry?.id === anchorId;
  });

  if (alreadyPresent) {
    return attendees;
  }

  return [
    {
      ...recognitionEntry,
      recognitionId: recognitionEntry.id,
      source: "recognition_list",
    },
    ...attendees,
  ];
}

export function classifyAttendees(attendees = [], recognitionEntries = [], options = {}) {
  const includeRecognitionList = options.includeRecognitionList ?? true;
  const recognitionIndex = buildRecognitionIndex(recognitionEntries);
  const categories = {
    hk_gov: [],
    goh: [],
    sponsor: [],
    jci: [],
    jci_hk_national: [],
    sister_chapter: [],
    jci_hk_local: [],
    needs_layer: [],
  };

  attendees.forEach((attendee, index) => {
    const normalized = normalizeAttendee(attendee, index + 1);
    if (!normalized.name) {
      return;
    }
    const recognizedEntry = findRecognitionMatch(normalized, recognitionIndex);
    const enriched = recognizedEntry
      ? {
          ...normalized,
          number: recognizedEntry.number,
          recognitionMatched: true,
          recognitionId: recognizedEntry.id,
          recognitionTitle: recognizedEntry.title,
        }
      : normalized;
    const category = getCategory(enriched, recognitionIndex);
    categories[category].push(enriched);
  });

  if (includeRecognitionList) {
    recognitionEntries.forEach((entry, index) => {
      const normalized = normalizeAttendee(entry, index + 1);
      if (!normalized.name) {
        return;
      }
      const targetCategory = mapRecognitionLayerToCategory(normalized.layer) || "jci_hk_national";
      categories[targetCategory].push({
        ...normalized,
        recognitionMatched: true,
        recognitionId: normalized.id,
        recognitionTitle: normalized.title,
      });
    });
  }

  for (const category of CATEGORY_ORDER) {
    categories[category].sort((left, right) => getRank(left) - getRank(right) || left.name.localeCompare(right.name));
  }

  return categories;
}

export function buildSeatPlan(attendees = [], recognitionEntries = [], options = {}) {
  const categories = classifyAttendees(attendees, recognitionEntries, options);
  const baseOrder = CATEGORY_ORDER.flatMap((category) => categories[category].map((entry) => ({ ...entry, category })));
  const { anchorEntry, anchorMode } = resolveAnchorSelection(baseOrder, options);
  const finalOrder = anchorEntry
    ? [anchorEntry, ...baseOrder.filter((entry) => entry !== anchorEntry)]
    : baseOrder;

  const seats = finalOrder.map((entry, index) => ({
    ...entry,
    rankOrder: index + 1,
    categoryLabel: getCategoryLabel(entry.category),
    isAnchor: index === 0,
    seat: index < PRIMARY_SEAT_PATTERN.length ? PRIMARY_SEAT_PATTERN[index] : index + 1,
  }));

  seats.sort((left, right) => left.seat - right.seat);

  return {
    meta: {
      inputCount: attendees.filter((entry) => entry.name).length,
      outputCount: seats.length,
      seatPattern: PRIMARY_SEAT_PATTERN,
      anchorId: anchorEntry?.id || null,
      anchorName: anchorEntry?.name || null,
      anchorTitle: anchorEntry?.recognitionTitle || anchorEntry?.title || null,
      anchorMode,
    },
    summary: CATEGORY_ORDER.map((category) => ({
      category,
      label: getCategoryLabel(category),
      count: categories[category].length,
    })),
    seats,
  };
}

export function buildPhotoLayout(seatedEntries = [], pairsPerRow = 2) {
  const normalizedPairsPerRow = Math.max(1, Math.floor(Number(pairsPerRow) || 1));
  const head = seatedEntries[0] || null;
  const left = [];
  const right = [];

  seatedEntries.slice(1).forEach((entry, index) => {
    if (index % 2 === 0) {
      right.push(entry);
      return;
    }
    left.push(entry);
  });

  const rows = [];
  const flankLength = Math.max(left.length, right.length);

  for (let index = 0; index < flankLength; index += normalizedPairsPerRow) {
    rows.push({
      left: left.slice(index, index + normalizedPairsPerRow),
      right: right.slice(index, index + normalizedPairsPerRow),
    });
  }

  return { head, rows };
}

export function buildCircularSeatLayout(seatedEntries = []) {
  const entries = seatedEntries.filter(Boolean);
  const totalEntries = entries.length;

  if (!totalEntries) {
    return [];
  }

  const angleStep = 360 / totalEntries;

  return entries.map((entry, index) => {
    if (index === 0) {
      return {
        entry,
        angle: 180,
        seatNumber: 1,
      };
    }

    const offset = Math.ceil(index / 2);
    const direction = index % 2 === 1 ? -1 : 1;
    const angle = (180 + direction * offset * angleStep + 360) % 360;

    return {
      entry,
      angle,
      seatNumber: index + 1,
    };
  });
}

export function distributeAcrossTables(entries = [], tableCount = 1, maxPerTable = Number.POSITIVE_INFINITY) {
  const requestedTableCount = Math.max(1, Math.floor(Number(tableCount) || 1));
  const totalEntries = entries.length;

  if (!totalEntries) {
    return {
      requestedTableCount,
      effectiveTableCount: 0,
      groups: [],
      capacityTriggered: false,
    };
  }

  const normalizedCapacity = Number.isFinite(maxPerTable) && maxPerTable > 0
    ? Math.max(1, Math.floor(maxPerTable))
    : Number.POSITIVE_INFINITY;
  const requiredTableCount = Number.isFinite(normalizedCapacity)
    ? Math.ceil(totalEntries / normalizedCapacity)
    : 1;
  const effectiveTableCount = Math.min(totalEntries, Math.max(requestedTableCount, requiredTableCount));
  const groups = [];

  let cursor = 0;
  for (let index = 0; index < effectiveTableCount; index += 1) {
    const remainingEntries = totalEntries - cursor;
    const remainingTables = effectiveTableCount - index;
    const targetSize = Number.isFinite(normalizedCapacity)
      ? Math.min(normalizedCapacity, remainingEntries)
      : Math.ceil(remainingEntries / remainingTables);
    const groupSize = Math.max(1, targetSize);
    groups.push(entries.slice(cursor, cursor + groupSize));
    cursor += groupSize;
  }

  return {
    requestedTableCount,
    effectiveTableCount,
    groups,
    capacityTriggered: effectiveTableCount > requestedTableCount,
  };
}

export function buildDisplayPlan(plan, seatCount = 7) {
  const normalizedSeatCount = Math.max(1, Math.floor(Number(seatCount) || 1));

  const rankedSeats = [...plan.seats].sort((left, right) => (left.rankOrder || 999) - (right.rankOrder || 999));
  const seated = rankedSeats.slice(0, normalizedSeatCount).map((entry, index) => ({
    ...entry,
    displayRole: "seat",
    displayIndex: index + 1,
  }));

  return {
    seated,
    controls: {
      seatCount: normalizedSeatCount,
    },
  };
}
