import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  canonicalJson,
  canonicalize,
  fromHex,
  hashPayload,
  keccak256,
  keccak256OfString,
  toHex,
} from "../src/hashing/index.js";

const fixtureDir = resolve(import.meta.dirname, "fixtures");
const validPersona = JSON.parse(readFileSync(resolve(fixtureDir, "persona-valid.json"), "utf-8"));

describe("canonicalize (RFC 8785)", () => {
  it("sorts object keys lexicographically", () => {
    expect(canonicalize({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
  });

  it("preserves array order", () => {
    expect(canonicalize([3, 1, 2])).toBe("[3,1,2]");
  });

  it("escapes control characters with \\u escapes", () => {
    expect(canonicalize("\x01")).toBe('"\\u0001"');
  });

  it("uses minimal escapes for standard sequences", () => {
    expect(canonicalize("hello\nworld")).toBe('"hello\\nworld"');
    expect(canonicalize('she said "hi"')).toBe('"she said \\"hi\\""');
  });

  it("emits null/true/false correctly", () => {
    expect(canonicalize(null)).toBe("null");
    expect(canonicalize(true)).toBe("true");
    expect(canonicalize(false)).toBe("false");
  });

  it("recursively canonicalizes nested structures", () => {
    expect(canonicalize({ z: { y: 1, x: 2 }, a: [3, 1] })).toBe('{"a":[3,1],"z":{"x":2,"y":1}}');
  });

  it("rejects NaN and Infinity", () => {
    expect(() => canonicalize(Number.NaN)).toThrow(TypeError);
    expect(() => canonicalize(Number.POSITIVE_INFINITY)).toThrow(TypeError);
  });

  it("rejects undefined and BigInt", () => {
    expect(() => canonicalize(undefined)).toThrow(TypeError);
    expect(() => canonicalize(1n)).toThrow(TypeError);
  });

  it("is deterministic for equivalent objects with different key insertion order", () => {
    const a = { foo: 1, bar: 2, baz: { y: "y", x: "x" } };
    const b = { baz: { x: "x", y: "y" }, bar: 2, foo: 1 };
    expect(canonicalize(a)).toBe(canonicalize(b));
  });
});

describe("keccak256", () => {
  it("hashes the empty string to the known empty-string keccak digest", () => {
    expect(keccak256OfString("")).toBe(
      "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    );
  });

  it("hex round-trips via toHex/fromHex", () => {
    const original = new Uint8Array([0, 1, 2, 250, 255]);
    expect(fromHex(toHex(original))).toEqual(original);
  });
});

describe("hashPayload", () => {
  it("is stable across re-orderings of object keys", () => {
    const original = validPersona;
    const reordered = JSON.parse(JSON.stringify(validPersona));
    // Reverse the keys of the top-level object
    const flipped: Record<string, unknown> = {};
    for (const k of Object.keys(reordered).reverse()) {
      flipped[k] = reordered[k];
    }
    expect(hashPayload(original)).toBe(hashPayload(flipped));
  });

  it("produces a 32-byte hex string", () => {
    const h = hashPayload(validPersona);
    expect(h).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it("changes when a field changes", () => {
    const h1 = hashPayload(validPersona);
    const h2 = hashPayload({ ...validPersona, backstory: "different" });
    expect(h1).not.toBe(h2);
  });

  it("canonicalJson matches canonicalize", () => {
    expect(canonicalJson(validPersona)).toBe(canonicalize(validPersona));
  });

  it("hashes the canonical bytes (not the JSON.stringify output)", () => {
    const canonical = canonicalJson(validPersona);
    expect(hashPayload(validPersona)).toBe(keccak256OfString(canonical));
  });
});
