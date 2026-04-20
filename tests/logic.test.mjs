import assert from "node:assert/strict";

import { buildCircularSeatLayout, buildPhotoLayout, buildRecognitionOnlyRoster, buildSeatPlan, distributeAcrossTables, ensureAnchorInRoster, getRank, isHighRanking, isJciHkLocalChapterRole, isJciHkNationalRole, isJciMember, isLocalOfficial, isOverseasDelegate } from "../frontend/logic.js";
import recognitionList from "../frontend/data/recognition-list.json" with { type: "json" };

assert.equal(isLocalOfficial("title", "Government of Hong Kong"), true);
assert.equal(isLocalOfficial("title", "Government of USA"), false);
assert.equal(isHighRanking("Chief Executive of HKSAR"), true);
assert.equal(isJciHkNationalRole("National President"), true);
assert.equal(isJciHkNationalRole("JCI Victoria President"), false);
assert.equal(isJciHkLocalChapterRole("JCI Victoria President", "JCI Hong Kong"), true);
assert.equal(isJciMember("JCI Hong Kong"), true);
assert.equal(isOverseasDelegate("JCI Japan"), true);
assert.equal(isOverseasDelegate("JCI Hong Kong"), false);

const attendees = [
  { name: "HK Official", title: "Chief Executive", organization: "Government of Hong Kong" },
  { name: "Guest of Honour", title: "GOH", organization: "Government of USA" },
  { name: "Sponsor Lead", title: "Title Sponsor", organization: "Event Sponsor Council" },
  { name: "JCI Member", title: "Delegate", organization: "JCI Japan" },
  { name: "Local Chapter Guest", title: "Guest", organization: "Some Local Company", manualLayer: "jci_hk_local" },
];

const plan = buildSeatPlan(attendees, recognitionList.entries);
const rosterOnlyPlan = buildSeatPlan(attendees, recognitionList.entries, { includeRecognitionList: false });
const rankedRosterOnlyPlan = [...rosterOnlyPlan.seats].sort((left, right) => left.rankOrder - right.rankOrder);

assert.equal(plan.seats[0].seat, 1);
assert.equal(plan.meta.anchorId, "jci-hk-80");
assert.equal(plan.seats[0].name, "Vincent Pang");
assert.equal(plan.seats.some((entry) => entry.source === "recognition_list"), true);
assert.deepEqual(rankedRosterOnlyPlan.map((entry) => entry.name).slice(0, 5), [
  "HK Official",
  "Guest of Honour",
  "Sponsor Lead",
  "JCI Member",
  "Local Chapter Guest",
]);
assert.equal(rosterOnlyPlan.meta.outputCount, attendees.length);
assert.equal(rosterOnlyPlan.seats.some((entry) => entry.source === "recognition_list"), false);

const matchedRecognitionPlan = buildSeatPlan(
  [{ name: "Senator Daryl Lin", title: "Guest", organization: "JCI Hong Kong" }],
  recognitionList.entries,
  { includeRecognitionList: false },
);

assert.equal(matchedRecognitionPlan.seats[0].category, "jci_hk_national");
assert.equal(matchedRecognitionPlan.seats[0].number, 1);

const matchedLocalChapterPlan = buildSeatPlan(
  [{ name: "Zico Sit", title: "Guest", organization: "JCI Hong Kong" }],
  recognitionList.entries,
  { includeRecognitionList: false },
);

assert.equal(matchedLocalChapterPlan.seats[0].category, "jci_hk_local");
assert.equal(matchedLocalChapterPlan.seats[0].number, 65);

const unmatchedJciHongKongPlan = buildSeatPlan(
  [{ name: "Unknown HK Member", title: "Guest", organization: "JCI Hong Kong" }],
  recognitionList.entries,
  { includeRecognitionList: false },
);

assert.equal(unmatchedJciHongKongPlan.seats[0].category, "needs_layer");
assert.equal(getRank(unmatchedJciHongKongPlan.seats[0]), 999);

const localChapterHeuristicPlan = buildSeatPlan(
  [{ name: "Temp Chapter Lead", title: "JCI Victoria President", organization: "JCI Hong Kong" }],
  recognitionList.entries,
  { includeRecognitionList: false },
);

assert.equal(localChapterHeuristicPlan.seats[0].category, "jci_hk_local");

const manualLayerOverridePlan = buildSeatPlan(
  [{ name: "Vincent Pang", title: "Guest", organization: "JCI Hong Kong", manualLayer: "sponsor" }],
  recognitionList.entries,
  { includeRecognitionList: false },
);

assert.equal(manualLayerOverridePlan.seats[0].category, "sponsor");
assert.equal(manualLayerOverridePlan.seats[0].number, 80);

const sisterChapterPlan = buildSeatPlan(
  [{ name: "Chapter Twin", title: "Sister Chapter Delegate", organization: "JCI Osaka" }],
  recognitionList.entries,
  { includeRecognitionList: false },
);

assert.equal(sisterChapterPlan.seats[0].category, "sister_chapter");

const duplicateVincentPlan = buildSeatPlan(
  [
    { name: "Senator Vincent Pang", title: "Guest", organization: "JCI Hong Kong" },
    { name: "Vincent Pang", title: "Guest", organization: "JCI Hong Kong" },
  ],
  recognitionList.entries,
  { includeRecognitionList: false },
);

const rankedVincent = [...duplicateVincentPlan.seats].sort((left, right) => left.rankOrder - right.rankOrder);
assert.equal(rankedVincent[0].name, "Vincent Pang");
assert.equal(rankedVincent[0].number, 80);
assert.equal(rankedVincent[0].category, "jci_hk_local");
assert.equal(rankedVincent[0].isAnchor, true);
assert.equal(rankedVincent[1].name, "Senator Vincent Pang");
assert.equal(rankedVincent[1].number, 61);
assert.equal(rankedVincent[1].category, "jci_hk_national");

const autoAnchorSamplePlan = buildSeatPlan([], recognitionList.entries, {
  includeRecognitionList: true,
  defaultAnchorId: "jci-hk-80",
});
const rankedAutoAnchorSample = [...autoAnchorSamplePlan.seats].sort((left, right) => left.rankOrder - right.rankOrder);

assert.equal(autoAnchorSamplePlan.meta.anchorMode, "auto");
assert.equal(autoAnchorSamplePlan.meta.anchorId, "jci-hk-80");
assert.equal(autoAnchorSamplePlan.meta.anchorName, "Vincent Pang");
assert.equal(rankedAutoAnchorSample[0].id, "jci-hk-80");
assert.equal(rankedAutoAnchorSample[0].isAnchor, true);
assert.equal(rankedAutoAnchorSample[0].seat, 1);

const manualAnchorPlan = buildSeatPlan(
  [
    { id: "manual-1", name: "Anchor Guest", title: "Delegate", organization: "JCI Japan" },
    { id: "manual-2", name: "Second Guest", title: "GOH", organization: "Government of USA" },
  ],
  recognitionList.entries,
  {
    includeRecognitionList: false,
    anchorId: "manual-1",
    defaultAnchorId: "jci-hk-80",
  },
);
const rankedManualAnchor = [...manualAnchorPlan.seats].sort((left, right) => left.rankOrder - right.rankOrder);

assert.equal(manualAnchorPlan.meta.anchorMode, "manual");
assert.equal(manualAnchorPlan.meta.anchorId, "manual-1");
assert.equal(rankedManualAnchor[0].id, "manual-1");
assert.equal(rankedManualAnchor[0].isAnchor, true);
assert.equal(rankedManualAnchor[0].seat, 1);
assert.equal(rankedManualAnchor[1].id, "manual-2");

const rosterWithoutDefaultAnchor = [
  { id: "manual-3", name: "Second Guest", title: "GOH", organization: "Government of USA" },
  { id: "manual-4", name: "Overseas Delegate", title: "Delegate", organization: "JCI Japan" },
];
const rosterWithInjectedDefaultAnchor = ensureAnchorInRoster(
  rosterWithoutDefaultAnchor,
  recognitionList.entries,
  "jci-hk-80",
);
const injectedDefaultAnchorPlan = buildSeatPlan(
  rosterWithInjectedDefaultAnchor,
  recognitionList.entries,
  {
    includeRecognitionList: false,
    defaultAnchorId: "jci-hk-80",
  },
);
const rankedInjectedDefaultAnchor = [...injectedDefaultAnchorPlan.seats].sort((left, right) => left.rankOrder - right.rankOrder);

assert.equal(rosterWithInjectedDefaultAnchor.length, rosterWithoutDefaultAnchor.length + 1);
assert.equal(rankedInjectedDefaultAnchor[0].id, "jci-hk-80");
assert.equal(rankedInjectedDefaultAnchor[0].isAnchor, true);
assert.equal(rankedInjectedDefaultAnchor[0].seat, 1);

const rosterWithoutNationalAnchor = [
  { id: "manual-5", name: "Local Guest", title: "Sponsor", organization: "Event Sponsor Council" },
];
const rosterWithInjectedNationalAnchor = ensureAnchorInRoster(
  rosterWithoutNationalAnchor,
  recognitionList.entries,
  "jci-hk-1",
);
const injectedNationalAnchorPlan = buildSeatPlan(
  rosterWithInjectedNationalAnchor,
  recognitionList.entries,
  {
    includeRecognitionList: false,
    anchorId: "jci-hk-1",
    defaultAnchorId: "jci-hk-80",
  },
);
const rankedInjectedNationalAnchor = [...injectedNationalAnchorPlan.seats].sort((left, right) => left.rankOrder - right.rankOrder);

assert.equal(rosterWithInjectedNationalAnchor.length, rosterWithoutNationalAnchor.length + 1);
assert.equal(rankedInjectedNationalAnchor[0].id, "jci-hk-1");
assert.equal(rankedInjectedNationalAnchor[0].isAnchor, true);
assert.equal(rankedInjectedNationalAnchor[0].seat, 1);

const existingAnchorRoster = [
  { id: "manual-6", name: "Vincent Pang", title: "Guest", organization: "JCI Hong Kong" },
];
const existingAnchorResult = ensureAnchorInRoster(
  existingAnchorRoster,
  recognitionList.entries,
  "jci-hk-80",
);

assert.equal(existingAnchorResult.length, existingAnchorRoster.length);

const recognitionOnlyRoster = buildRecognitionOnlyRoster(
  [
    { name: "Senator Daryl Lin", title: "Guest", organization: "JCI Hong Kong" },
    { name: "Vincent Pang", title: "Guest", organization: "JCI Hong Kong" },
    { name: "Unknown Guest", title: "Guest", organization: "JCI Hong Kong" },
    { name: "Vincent Pang", title: "Guest", organization: "JCI Hong Kong" },
  ],
  recognitionList.entries,
);

assert.deepEqual(recognitionOnlyRoster.map((entry) => entry.id), ["jci-hk-1", "jci-hk-80"]);

const photoEntries = Array.from({ length: 8 }, (_, index) => ({
  name: `Rank ${index + 1}`,
  rankOrder: index + 1,
}));
const photoLayout = buildPhotoLayout(photoEntries, 2);

assert.equal(photoLayout.head?.rankOrder, 1);
assert.deepEqual(photoLayout.rows.map((row) => row.right.map((entry) => entry.rankOrder)), [[2, 4], [6, 8]]);
assert.deepEqual(photoLayout.rows.map((row) => row.left.map((entry) => entry.rankOrder)), [[3, 5], [7]]);

const circularTables = distributeAcrossTables(photoEntries, 2, 3);

assert.equal(circularTables.requestedTableCount, 2);
assert.equal(circularTables.effectiveTableCount, 3);
assert.equal(circularTables.capacityTriggered, true);
assert.deepEqual(circularTables.groups.map((group) => group.map((entry) => entry.rankOrder)), [[1, 2, 3], [4, 5, 6], [7, 8]]);

const frontLoadedTables = distributeAcrossTables(photoEntries, 2, 4);

assert.equal(frontLoadedTables.requestedTableCount, 2);
assert.equal(frontLoadedTables.effectiveTableCount, 2);
assert.equal(frontLoadedTables.capacityTriggered, false);
assert.deepEqual(frontLoadedTables.groups.map((group) => group.map((entry) => entry.rankOrder)), [[1, 2, 3, 4], [5, 6, 7, 8]]);

const circularSeatLayout = buildCircularSeatLayout(photoEntries.slice(0, 6));

assert.deepEqual(
  circularSeatLayout.map(({ entry, angle, seatNumber }) => ({ rank: entry.rankOrder, angle, seatNumber })),
  [
    { rank: 1, angle: 180, seatNumber: 1 },
    { rank: 2, angle: 120, seatNumber: 2 },
    { rank: 3, angle: 240, seatNumber: 3 },
    { rank: 4, angle: 60, seatNumber: 4 },
    { rank: 5, angle: 300, seatNumber: 5 },
    { rank: 6, angle: 0, seatNumber: 6 },
  ],
);

console.log("logic ok");
