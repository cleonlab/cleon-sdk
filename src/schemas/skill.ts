import { z } from "zod";
import {
  PERMISSION_SCOPES,
  RISK_CLASS_MAX,
  RISK_CLASS_MIN,
  SCHEMA_VERSIONS,
} from "../constants.js";

/**
 * Skill manifest schema (cleon/skill/v1).
 *
 * Corresponds to Section 4.2 of the Cleon Protocol whitepaper. A skill manifest
 * declares the interface, permissions, and execution requirements of a callable
 * unit. The manifest is content-addressed; its keccak256 hash uniquely
 * identifies a specific version of the skill.
 */

const HexAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "must be a 0x-prefixed 20-byte address");

const SemVer = z
  .string()
  .regex(
    /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/,
    "must be a valid SemVer string (e.g. 1.0.0 or 1.0.0-beta.1)",
  );

const Slug = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/, "must be a lowercase kebab-case slug");

const HttpsUrl = z.string().regex(/^https:\/\/.+/, "must be an https:// URL");

/**
 * JSON Schema (Draft 2020-12) is itself an open-ended object. We accept any
 * record here; runtime validation against this schema is performed at skill
 * invocation time, not at manifest-parse time.
 */
const JsonSchemaObject = z.record(z.unknown());

export const SkillErrorSchema = z.object({
  code: z.string().min(1),
  description: z.string().min(1),
});

export const SkillInterfaceSchema = z.object({
  input: JsonSchemaObject,
  output: JsonSchemaObject,
  errors: z.array(SkillErrorSchema).default([]),
});

export const SkillPermissionsSchema = z.object({
  scopes: z.array(z.enum(PERMISSION_SCOPES)).min(1),
  risk_class: z.number().int().min(RISK_CLASS_MIN).max(RISK_CLASS_MAX),
});

export const SkillExecutionSchema = z.object({
  endpoint_pattern: HttpsUrl,
  max_latency_ms: z
    .number()
    .int()
    .positive()
    .max(10 * 60 * 1000),
  deterministic: z.boolean(),
});

export const SkillMetadataSchema = z.object({
  publisher: HexAddress,
  published_at: z
    .union([z.number().int().nonnegative(), z.string().regex(/^\d+$/)])
    .transform((v) => (typeof v === "string" ? Number.parseInt(v, 10) : v)),
});

export const SkillManifestSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSIONS.skill),
  id: Slug,
  version: SemVer,
  category: z.string().min(1).max(64),
  interface: SkillInterfaceSchema,
  permissions: SkillPermissionsSchema,
  execution: SkillExecutionSchema,
  metadata: SkillMetadataSchema,
});

export type SkillManifest = z.infer<typeof SkillManifestSchema>;
export type SkillInterface = z.infer<typeof SkillInterfaceSchema>;
export type SkillPermissions = z.infer<typeof SkillPermissionsSchema>;
export type SkillExecution = z.infer<typeof SkillExecutionSchema>;
export type SkillMetadata = z.infer<typeof SkillMetadataSchema>;
export type SkillError = z.infer<typeof SkillErrorSchema>;

export function parseSkillManifest(payload: unknown): SkillManifest {
  return SkillManifestSchema.parse(payload);
}

export function safeParseSkillManifest(payload: unknown):
  | {
      ok: true;
      data: SkillManifest;
    }
  | { ok: false; issues: z.ZodIssue[] } {
  const r = SkillManifestSchema.safeParse(payload);
  return r.success ? { ok: true, data: r.data } : { ok: false, issues: r.error.issues };
}
