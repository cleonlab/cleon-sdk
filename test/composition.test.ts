import { describe, expect, it } from "vitest";
import { parseComposition } from "../src/schemas/composition.js";

const validComposition = {
  persona_id: "1234",
  skills: [
    {
      hash: "0x".padEnd(66, "a"),
      version: "1.0.0",
    },
  ],
  runtime_params: {
    model: "claude-opus-4-7",
    temperature: 0.7,
    max_tokens: 4096,
  },
};

describe("CompositionSchema", () => {
  it("accepts a valid composition", () => {
    const c = parseComposition(validComposition);
    expect(c.persona_id).toBe(1234n);
    expect(c.skills.length).toBe(1);
  });

  it("coerces persona_id to bigint", () => {
    const c = parseComposition({ ...validComposition, persona_id: 99 });
    expect(c.persona_id).toBe(99n);
  });

  it("rejects an invalid skill hash", () => {
    const bad = {
      ...validComposition,
      skills: [{ hash: "0xnotahash", version: "1.0.0" }],
    };
    expect(() => parseComposition(bad)).toThrow();
  });

  it("rejects temperature outside [0, 2]", () => {
    const bad = {
      ...validComposition,
      runtime_params: { ...validComposition.runtime_params, temperature: 3 },
    };
    expect(() => parseComposition(bad)).toThrow();
  });
});
