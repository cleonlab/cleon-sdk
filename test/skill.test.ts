import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSkillManifest, safeParseSkillManifest } from "../src/schemas/skill.js";

const fixtureDir = resolve(import.meta.dirname, "fixtures");
const validSkill = JSON.parse(readFileSync(resolve(fixtureDir, "skill-valid.json"), "utf-8"));

describe("SkillManifestSchema", () => {
  it("accepts a valid skill manifest", () => {
    const skill = parseSkillManifest(validSkill);
    expect(skill.id).toBe("web-search");
    expect(skill.permissions.risk_class).toBe(1);
  });

  it("rejects an invalid SemVer", () => {
    const bad = { ...validSkill, version: "1.0" };
    expect(() => parseSkillManifest(bad)).toThrow();
  });

  it("rejects an invalid id slug", () => {
    const bad = { ...validSkill, id: "Web Search!" };
    expect(() => parseSkillManifest(bad)).toThrow();
  });

  it("rejects an unknown permission scope", () => {
    const bad = {
      ...validSkill,
      permissions: { ...validSkill.permissions, scopes: ["root_access"] },
    };
    expect(() => parseSkillManifest(bad)).toThrow();
  });

  it("rejects risk_class above 5", () => {
    const bad = {
      ...validSkill,
      permissions: { ...validSkill.permissions, risk_class: 9 },
    };
    expect(() => parseSkillManifest(bad)).toThrow();
  });

  it("rejects non-HTTPS endpoint_pattern", () => {
    const bad = {
      ...validSkill,
      execution: {
        ...validSkill.execution,
        endpoint_pattern: "http://insecure.example.com",
      },
    };
    expect(() => parseSkillManifest(bad)).toThrow();
  });

  it("returns issues via safeParseSkillManifest", () => {
    const result = safeParseSkillManifest({ schema_version: "wrong" });
    expect(result.ok).toBe(false);
  });
});
