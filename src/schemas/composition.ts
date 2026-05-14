import { z } from "zod";

/**
 * Composition schema (cleon/composition/v1).
 *
 * Corresponds to Section 5.1 of the whitepaper. A composition is the
 * runtime-bound association of a persona with a set of skills and runtime
 * parameters. Compositions may be ephemeral (per-call) or persisted as
 * Composition NFTs.
 */

const Hex32 = z.string().regex(/^0x[a-fA-F0-9]{64}$/, "must be a 0x-prefixed 32-byte hash");

const Uint256 = z
  .union([z.bigint(), z.string().regex(/^\d+$/), z.number().int().nonnegative()])
  .transform((v) => (typeof v === "bigint" ? v : BigInt(v as number | string)));

export const CompositionSkillRefSchema = z.object({
  /** keccak256 of the skill manifest, registered in the Skill Registry. */
  hash: Hex32,
  /** SemVer of the manifest version, mirrored for client convenience. */
  version: z.string().min(1),
});

export const RuntimeParamsSchema = z.object({
  model: z.string().min(1),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().positive().optional(),
  top_p: z.number().min(0).max(1).optional(),
  /** Implementation-specific extensions. Opaque to the protocol. */
  extras: z.record(z.unknown()).optional(),
});

export const CompositionSchema = z.object({
  /** Persona token ID on the Persona ERC-721 contract. */
  persona_id: Uint256,
  /** Skills to equip, in author order. Order is significant: see Section 5.4. */
  skills: z.array(CompositionSkillRefSchema).min(0).max(64),
  runtime_params: RuntimeParamsSchema,
});

export type Composition = z.infer<typeof CompositionSchema>;
export type CompositionSkillRef = z.infer<typeof CompositionSkillRefSchema>;
export type RuntimeParams = z.infer<typeof RuntimeParamsSchema>;

export function parseComposition(payload: unknown): Composition {
  return CompositionSchema.parse(payload);
}
