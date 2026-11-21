import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import terms0 from "../content/glossary/terms-l0";
import { defaultViewOf, getView, headStringPin, instrumentHref, mapPartIds, renderedWidth, SWITCH_POSITIONS, VIEWS } from "./parts";

const level0 = terms0.map((t) => t.id);
const count = (view: string, part: string) => getView(view)!.hotspots.filter((h) => h.part === part).length;

describe("instrument map", () => {
  it("every hotspot is a level-0 term", () => {
    for (const v of VIEWS) for (const h of v.hotspots) assert.ok(level0.includes(h.part), `${v.id}: ${h.part}`);
  });

  it("shows every level-0 part; not truss-rod, effects-pedal or the two sounds (clean-tone, distortion)", () => {
    const missing = level0.filter((id) => !mapPartIds.includes(id));
    assert.deepEqual(missing.sort(), ["clean-tone", "distortion", "effects-pedal", "truss-rod"]);
  });

  it("has the requested number of each repeated part", () => {
    assert.equal(count("head", "tuning-peg"), 6);
    assert.equal(count("head", "string"), 6);
    assert.equal(count("body", "pickup"), 3);
    assert.equal(count("body", "tone-knob"), 2);
    assert.equal(count("amp", "eq"), 3);
    for (const part of ["gain", "amp-volume", "amp-input", "speaker", "cable", "amp"]) assert.equal(count("amp", part), 1, part);
  });

  it("touch areas (44×44 px) never overlap at 390 px wide (358 px content) on an 844 px tall screen", () => {
    for (const v of VIEWS) {
      const scale = renderedWidth(v, 358, 844) / v.w;
      const hs = v.hotspots;
      for (let i = 0; i < hs.length; i++)
        for (let j = i + 1; j < hs.length; j++) {
          const gap = Math.max(Math.abs(hs[i]!.x - hs[j]!.x), Math.abs(hs[i]!.y - hs[j]!.y)) * scale;
          assert.ok(gap >= 44, `${v.id}: ${hs[i]!.part}#${hs[i]!.instance ?? ""} and ${hs[j]!.part}#${hs[j]!.instance ?? ""} are ${gap.toFixed(1)}px apart`);
        }
    }
  });

  it("the full guitar stays at most 320 px wide and its touch areas still fit at its narrowest (200 px)", () => {
    const full = getView("full")!;
    assert.ok(renderedWidth(full, 1000, 2000) <= 320);
    const scale = 200 / full.w;
    for (const a of full.hotspots)
      for (const b of full.hotspots)
        if (a !== b) assert.ok(Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) * scale >= 44, `${a.part} / ${b.part}`);
  });

  it("hotspots stay inside their view (a little overhang for edge parts is fine)", () => {
    for (const v of VIEWS)
      for (const h of v.hotspots) assert.ok(h.x >= 0 && h.x <= v.w && h.y >= 0 && h.y <= v.h, `${v.id}: ${h.part}`);
  });

  it("string pins lie on their strings and are staggered", () => {
    const ys = ([6, 5, 4, 3, 2, 1] as const).map((s) => headStringPin(s).y);
    assert.equal(new Set(ys).size, 6);
  });

  it("five-way switch: 1 = bridge, 3 = middle, 5 = neck", () => {
    assert.deepEqual(SWITCH_POSITIONS[1], ["bridge"]);
    assert.deepEqual(SWITCH_POSITIONS[2], ["bridge", "middle"]);
    assert.deepEqual(SWITCH_POSITIONS[3], ["middle"]);
    assert.deepEqual(SWITCH_POSITIONS[4], ["middle", "neck"]);
    assert.deepEqual(SWITCH_POSITIONS[5], ["neck"]);
  });

  it("opens each part in a view that shows it", () => {
    assert.equal(defaultViewOf("string"), "head");
    assert.equal(defaultViewOf("pickup"), "body");
    assert.equal(defaultViewOf("gain"), "amp");
    assert.equal(instrumentHref("tuning-peg"), "/glossary/instrument?view=head&part=tuning-peg");
  });
});
