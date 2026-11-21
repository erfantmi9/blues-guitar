import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { notesStartingAt, positionFromTick, requiredSubdivisions, sortNotes, validateExercise, type PlayConfig } from "@/lib/practice";
import rootPerBar from "./exercises/s4-root-per-bar";
import shufflePairs from "./exercises/s4-shuffle-pairs";

describe("s4-root-per-bar", () => {
  it("is valid with whole-beat subdivision", () => {
    assert.deepEqual(validateExercise(rootPerBar), []);
    assert.equal(requiredSubdivisions(rootPerBar.notes), 1);
    assert.deepEqual(
      rootPerBar.notes.map((n) => [n.beat, n.string, n.fret, n.finger, n.durationBeats]),
      [
        [0, 6, 5, 1, 4],
        [4, 4, 7, 3, 4],
        [8, 1, 5, 1, 4],
        [12, 6, 5, 1, 4],
      ],
    );
  });
});

describe("s4-shuffle-pairs", () => {
  it("has 32 notes, is valid, and needs triplet subdivision (3)", () => {
    assert.equal(shufflePairs.notes.length, 32);
    assert.deepEqual(validateExercise(shufflePairs), []);
    assert.equal(requiredSubdivisions(shufflePairs.notes), 3);
  });

  it("each beat: long (2/3) on the low fret with finger 1, short (1/3) on the high fret", () => {
    const strings = [6, 5, 4, 6];
    const frets = [[5, 8], [5, 7], [5, 7], [5, 8]];
    const notes = sortNotes(shufflePairs.notes);
    for (let b = 0; b < 4; b++) {
      for (let j = 0; j < 4; j++) {
        const long = notes[(b * 4 + j) * 2]!;
        const short = notes[(b * 4 + j) * 2 + 1]!;
        const high = frets[b]![1]!;
        assert.equal(long.beat, 4 * b + j);
        assert.equal(long.durationBeats, 2 / 3);
        assert.deepEqual([long.string, long.fret, long.finger], [strings[b], 5, 1]);
        assert.ok(Math.abs(short.beat - (4 * b + j + 2 / 3)) < 1e-12);
        assert.equal(short.durationBeats, 1 / 3);
        assert.deepEqual([short.string, short.fret, short.finger], [strings[b], high, high === 8 ? 4 : 3]);
      }
    }
  });

  it("every note starts exactly on a triplet tick during playback (no float drift)", () => {
    const c: PlayConfig = { beatsPerBar: 4, totalBeats: 16, subdivisions: 3, loop: true };
    const started: number[] = [];
    // Two passes, to include the loop boundary
    for (let tick = 0; tick < 12 + 2 * 48; tick++) {
      const pos = positionFromTick(tick, c);
      if (pos.phase !== "play") continue;
      const n = notesStartingAt(shufflePairs.notes, pos.beatPos);
      assert.ok(n.length <= 1);
      if (n.length) started.push(tick);
      // Shuffle: nothing on the middle triplet ("trip")
      if ((tick - 12) % 3 === 1) assert.equal(n.length, 0, `tick ${tick}`);
    }
    assert.equal(started.length, 64);
  });
});
