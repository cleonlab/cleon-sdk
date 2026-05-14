import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parsePersona, safeParsePersona } from "../src/schemas/persona.js";

const fixtureDir = resolve(import.meta.dirname, "fixtures");
const validPersona = JSON.parse(readFileSync(resolve(fixtureDir, "persona-valid.json"), "utf-8"));

describe("PersonaSchema", () => {
  it("accepts a valid persona payload", () => {
    const persona = parsePersona(validPersona);
    expect(persona.identity.name).toBe("Cassandra");
    expect(persona.metadata.royalty_bps).toBe(250);
  });

  it("rejects an unknown schema_version", () => {
    const bad = { ...validPersona, schema_version: "cleon/persona/v2" };
    expect(() => parsePersona(bad)).toThrow();
  });

  it("rejects an invalid creator address", () => {
    const bad = {
      ...validPersona,
      metadata: { ...validPersona.metadata, creator: "0xnotanaddress" },
    };
    expect(() => parsePersona(bad)).toThrow();
  });

  it("rejects a value axis outside [-1, 1]", () => {
    const bad = {
      ...validPersona,
      values: { axes: [{ name: "risk", value: 1.5 }] },
    };
    expect(() => parsePersona(bad)).toThrow();
  });

  it("rejects royalty_bps over 10000", () => {
    const bad = {
      ...validPersona,
      metadata: { ...validPersona.metadata, royalty_bps: 12000 },
    };
    expect(() => parsePersona(bad)).toThrow();
  });

  it("returns structured issues via safeParsePersona", () => {
    const result = safeParsePersona({ schema_version: "wrong" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });

  it("accepts a numeric-string minted_at and coerces to number", () => {
    const variant = {
      ...validPersona,
      metadata: { ...validPersona.metadata, minted_at: "1714521600" },
    };
    const persona = parsePersona(variant);
    expect(persona.metadata.minted_at).toBe(1714521600);
  });
});
