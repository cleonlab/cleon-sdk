import { z } from "zod";
import { SCHEMA_VERSIONS } from "../constants.js";

/**
 * Persona schema (cleon/persona/v1).
 *
 * Corresponds to Section 3.2 of the Cleon Protocol whitepaper. A persona payload
 * is a JSON document that encodes the durable identity of an autonomous agent.
 * The canonical encoding (RFC 8785) is hashed with keccak256 and anchored
 * on-chain in the Persona contract.
 */

const HexAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "must be a 0x-prefixed 20-byte address");

const IpfsUri = z.string().regex(/^ipfs:\/\/.+/, "must be an ipfs:// URI");

const ValueAxis = z.object({
  name: z.string().min(1),
  value: z.number().min(-1).max(1),
});

export const PersonaIdentitySchema = z.object({
  name: z.string().min(1).max(120),
  handle: z.string().min(1).max(64),
  avatar_uri: IpfsUri,
  voice_uri: IpfsUri.nullable().optional(),
});

export const PersonaValuesSchema = z.object({
  axes: z.array(ValueAxis).max(32),
});

export const PersonaRulesSchema = z.object({
  always: z.array(z.string().min(1)).default([]),
  never: z.array(z.string().min(1)).default([]),
});

export const PersonaSignatureSchema = z.object({
  patterns: z.array(z.string()).default([]),
  output_format: z.string().default("markdown"),
});

export const PersonaMetadataSchema = z.object({
  creator: HexAddress,
  minted_at: z
    .union([z.number().int().nonnegative(), z.string().regex(/^\d+$/)])
    .transform((v) => (typeof v === "string" ? Number.parseInt(v, 10) : v)),
  royalty_bps: z.number().int().min(0).max(10_000),
});

export const PersonaSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSIONS.persona),
  identity: PersonaIdentitySchema,
  backstory: z.string().max(20_000),
  values: PersonaValuesSchema,
  expertise: z.array(z.string()).max(64),
  rules: PersonaRulesSchema,
  signature: PersonaSignatureSchema,
  metadata: PersonaMetadataSchema,
});

export type Persona = z.infer<typeof PersonaSchema>;
export type PersonaIdentity = z.infer<typeof PersonaIdentitySchema>;
export type PersonaValues = z.infer<typeof PersonaValuesSchema>;
export type PersonaRules = z.infer<typeof PersonaRulesSchema>;
export type PersonaSignature = z.infer<typeof PersonaSignatureSchema>;
export type PersonaMetadata = z.infer<typeof PersonaMetadataSchema>;

/**
 * Parse and validate an unknown payload as a Persona. Throws ZodError on
 * invalid input.
 */
export function parsePersona(payload: unknown): Persona {
  return PersonaSchema.parse(payload);
}

/**
 * Non-throwing variant. Returns the parsed Persona or null with a structured
 * issue list.
 */
export function safeParsePersona(payload: unknown):
  | {
      ok: true;
      data: Persona;
    }
  | { ok: false; issues: z.ZodIssue[] } {
  const r = PersonaSchema.safeParse(payload);
  return r.success ? { ok: true, data: r.data } : { ok: false, issues: r.error.issues };
}
