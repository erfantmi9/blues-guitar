import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import type { BackingTrack } from "@bg/shared";
import track from "@/features/practice/content/backing/a7-shuffle-vamp";
import { noteNameFromMidi } from "@/lib/music";
import { initialSchedulerState, retime, scheduleWindow, secondsPerBeat, type ScheduledBeat } from "../metronome";
import {
  backingPlayConfig,
  backingPositionFromTick,
  eventsAtTick,
  SHUFFLE_SLOTS,
  slotEvents,
  SLOTS_PER_BAR,
} from "./pattern";
import { clampToTrack, validateBackingTrack } from "./validate";

const kinds = (slot: number, bar = 0) => slotEvents(track, bar, slot).map((e) => e.kind);

/** Runs the real scheduler for `seconds` of audio clock at a fixed BPM */
function run(bpm: number, seconds: number, start = 0) {
  return scheduleWindow(initialSchedulerState(start), start + seconds, bpm, 4, 3);
}

describe("slot → events map", () => {
  it("orders kick, snare, hat, bass, chord on each slot", () => {
    assert.deepEqual(kinds(0), ["kick", "hat", "bass"]);
    assert.deepEqual(kinds(1), []);
    assert.deepEqual(kinds(2), ["hat", "bass"]);
    assert.deepEqual(kinds(3), ["snare", "hat", "bass", "chord"]);
    assert.deepEqual(kinds(4), []);
    assert.deepEqual(kinds(5), ["hat", "bass"]);
    assert.deepEqual(kinds(6), ["kick", "hat", "bass"]);
    assert.deepEqual(kinds(7), []);
    assert.deepEqual(kinds(8), ["hat", "bass"]);
    assert.deepEqual(kinds(9), ["snare", "hat", "bass", "chord"]);
    assert.deepEqual(kinds(10), []);
    assert.deepEqual(kinds(11), ["hat", "bass"]);
  });

  it("melodic events only on shuffle slots (1st and 3rd of each beat)", () => {
    for (let slot = 0; slot < SLOTS_PER_BAR; slot++) {
      const melodic = slotEvents(track, 0, slot).some((e) => e.kind === "bass" || e.kind === "chord");
      assert.equal(melodic, SHUFFLE_SLOTS.includes(slot), `slot ${slot}`);
    }
  });

  it("hi-hat is louder on the beat than on the shuffle off-beat", () => {
    const hat = (slot: number) => slotEvents(track, 0, slot).find((e) => e.kind === "hat");
    assert.ok(hat(0) && hat(2) && "velocity" in hat(0)! && "velocity" in hat(2)!);
    assert.ok((hat(0) as { velocity: number }).velocity > (hat(2) as { velocity: number }).velocity);
  });

  it("bass plays the bar's 8 notes in order, long then short", () => {
    const bass = SHUFFLE_SLOTS.map((s) => slotEvents(track, 0, s).find((e) => e.kind === "bass"));
    assert.deepEqual(
      bass.map((b) => (b?.kind === "bass" ? b.midi : null)),
      [45, 49, 52, 54, 55, 54, 52, 49],
    );
    assert.deepEqual(
      bass.map((b) => (b?.kind === "bass" ? b.durationSlots : null)),
      [2, 1, 2, 1, 2, 1, 2, 1],
    );
  });

  it("count-in bar: only hi-hat on the 4 beats", () => {
    const config = backingPlayConfig(track.bars.length, true);
    for (let tick = 0; tick < SLOTS_PER_BAR; tick++) {
      const ev = eventsAtTick(track, tick, config).map((e) => e.kind);
      assert.deepEqual(ev, tick % 3 === 0 ? ["hat"] : [], `tick ${tick}`);
    }
    // First tick after the count-in is bar 1, slot 0
    assert.deepEqual(eventsAtTick(track, SLOTS_PER_BAR, config).map((e) => e.kind), ["kick", "hat", "bass"]);
  });

  it("without count-in, tick 0 is bar 1 beat 1", () => {
    const pos = backingPositionFromTick(0, backingPlayConfig(4, false));
    assert.deepEqual(pos, { phase: "play", bar: 0, beat: 0, slot: 0, loopIndex: 0 });
  });
});

describe("shuffle timing", () => {
  it("slot 1→3 is twice as long as slot 3→next beat", () => {
    for (const bpm of [50, 70, 97, 120]) {
      const { beats } = run(bpm, 8 * secondsPerBeat(bpm)); // two bars
      const t = (tick: number) => beats.find((b) => b.tick === tick)!.time;
      for (const beatStart of [0, 3, 6, 9]) {
        const long = t(beatStart + 2) - t(beatStart);
        const short = t(beatStart + 3) - t(beatStart + 2);
        assert.ok(Math.abs(long - 2 * short) < 1e-9, `bpm ${bpm}: ${long} vs 2×${short}`);
        assert.ok(Math.abs(long + short - secondsPerBeat(bpm)) < 1e-9);
      }
    }
  });
});

describe("loop", () => {
  it("wraps from the last slot of bar 4 to bar 1 with no gap and no repeated beat", () => {
    const config = backingPlayConfig(track.bars.length, true);
    const { beats } = run(70, 60); // ~ 17 bars at 70 BPM
    const step = secondsPerBeat(70) / 3;
    let prev: { bar: number; slot: number; loop: number } | null = null;
    let wraps = 0;
    beats.forEach((b, i) => {
      if (i > 0) assert.ok(Math.abs(b.time - beats[i - 1]!.time - step) < 1e-9, "even spacing");
      const pos = backingPositionFromTick(b.tick, config);
      if (pos.phase !== "play") return;
      if (prev) {
        const expectedSlot = (prev.slot + 1) % SLOTS_PER_BAR;
        const expectedBar = expectedSlot === 0 ? (prev.bar + 1) % 4 : prev.bar;
        assert.equal(pos.slot, expectedSlot, `tick ${b.tick}`);
        assert.equal(pos.bar, expectedBar, `tick ${b.tick}`);
        if (expectedSlot === 0 && expectedBar === 0) {
          assert.equal(pos.loopIndex, prev.loop + 1);
          wraps++;
        }
      }
      prev = { bar: pos.bar, slot: pos.slot, loop: pos.loopIndex };
    });
    assert.ok(wraps >= 3, `looped ${wraps} times`);
  });
});

describe("tempo change mid-play", () => {
  it("next slot uses the new spacing, with no skipped or repeated slot", () => {
    const config = backingPlayConfig(4, false);
    const first = run(60, 2.5); // a bit over 2 beats at 60 BPM
    const last: ScheduledBeat = first.beats.at(-1)!;
    const now = last.time - 0.05;
    const state = retime(first.state, last.time, 90, now, 3);
    const second = scheduleWindow(state, last.time + 3, 90, 4, 3);
    const nextBeat = second.beats[0]!;

    assert.equal(nextBeat.tick, last.tick + 1, "continues from the next tick");
    assert.ok(Math.abs(nextBeat.time - last.time - secondsPerBeat(90) / 3) < 1e-9, "new spacing right away");
    for (let i = 1; i < second.beats.length; i++) {
      assert.ok(Math.abs(second.beats[i]!.time - second.beats[i - 1]!.time - secondsPerBeat(90) / 3) < 1e-9);
    }
    const a = backingPositionFromTick(last.tick, config);
    const b = backingPositionFromTick(nextBeat.tick, config);
    assert.ok(a.phase === "play" && b.phase === "play");
    assert.equal(b.slot, (a.slot + 1) % SLOTS_PER_BAR);
  });
});

describe("a7-shuffle-vamp content", () => {
  it("bass and chord use only A, C#, E, F#, G", () => {
    const allowed = new Set(["A", "C#", "E", "F#", "G"]);
    for (const bar of track.bars) {
      for (const m of [...bar.chord.midi, ...bar.bass]) {
        if (m === null) continue;
        assert.ok(allowed.has(noteNameFromMidi(m)), `${m} = ${noteNameFromMidi(m)}`);
      }
    }
  });

  it("matches the spec", () => {
    assert.equal(track.id, "a7-shuffle-vamp");
    assert.equal(track.bars.length, 4);
    assert.deepEqual([track.bpmDefault, track.bpmMin, track.bpmMax], [70, 50, 120]);
    for (const bar of track.bars) {
      assert.deepEqual(bar.chord, { name: "A7", midi: [57, 61, 64, 67] });
      assert.deepEqual(bar.bass, [45, 49, 52, 54, 55, 54, 52, 49]);
    }
  });
});

describe("validation", () => {
  const clone = (): BackingTrack => structuredClone(track);

  it("the shipped track is valid", () => {
    assert.deepEqual(validateBackingTrack(track), []);
  });

  it("rejects a bar with the wrong number of bass notes", () => {
    const t = clone();
    t.bars[1]!.bass = [45, 49, 52];
    assert.match(validateBackingTrack(t).join("\n"), /bar 2: bass must have 8 notes/);
  });

  it("allows null (silence) but rejects invalid MIDI numbers", () => {
    const t = clone();
    t.bars[0]!.bass[3] = null;
    assert.deepEqual(validateBackingTrack(t), []);
    t.bars[0]!.bass[4] = 128;
    t.bars[0]!.chord.midi = [57, 61.5];
    const p = validateBackingTrack(t).join("\n");
    assert.match(p, /bass note 4 is not a valid MIDI/);
    assert.match(p, /chord note 1 is not a valid MIDI/);
  });

  it("rejects BPM outside the range", () => {
    const t = clone();
    t.bpmDefault = 130;
    assert.match(validateBackingTrack(t).join("\n"), /bpmDefault must be in \[bpmMin, bpmMax\]/);
    t.bpmMin = 30;
    assert.match(validateBackingTrack(t).join("\n"), /bpmMin must be/);
  });

  it("rejects an empty track", () => {
    const t = clone();
    t.bars = [];
    assert.match(validateBackingTrack(t).join("\n"), /no bars/);
  });

  it("clamps BPM to the track range", () => {
    assert.equal(clampToTrack(track, 10), 50);
    assert.equal(clampToTrack(track, 300), 120);
    assert.equal(clampToTrack(track, 70.4), 70);
  });
});
