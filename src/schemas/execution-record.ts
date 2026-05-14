import { z } from "zod";

/**
 * Execution record schema (cleon/execution-record/v1).
 *
 * Corresponds to Section 6.4 of the whitepaper. An execution record is the
 * structured output of a single composition invocation. In Cloud Mode the
 * record is signed by the runtime operator's key. In Verifiable Mode it
 * carries an additional attestation.
 */

const Hex32 = z.string().regex(/^0x[a-fA-F0-9]{64}$/, "must be a 0x-prefixed 32-byte hash");

const HexBytes = z.string().regex(/^0x[a-fA-F0-9]*$/, "must be 0x-prefixed hex bytes");

const Uint256 = z.union([z.bigint(), z.string().regex(/^\d+$/), z.number().int().nonnegative()]);

export const ExecutionToolCallSchema = z.object({
  skill_hash: Hex32,
  input_hash: Hex32,
  output_hash: Hex32,
  latency_ms: z.number().int().nonnegative(),
});

export const ExecutionCompositionRefSchema = z.object({
  persona: Uint256,
  persona_hash: Hex32,
  skills: z.array(
    z.object({
      hash: Hex32,
      version: z.string().min(1),
    }),
  ),
  runtime_params_hash: Hex32,
});

export const ExecutionModeSchema = z.enum(["cloud", "tee", "zk"]);

export const ExecutionRecordSchema = z.object({
  execution_id: Hex32,
  composition: ExecutionCompositionRefSchema,
  input_hash: Hex32,
  output_hash: Hex32,
  tool_calls: z.array(ExecutionToolCallSchema).default([]),
  mode: ExecutionModeSchema,
  attestation: HexBytes.nullable().default(null),
  timestamp: z.number().int().nonnegative(),
  runtime_signature: HexBytes,
});

export type ExecutionRecord = z.infer<typeof ExecutionRecordSchema>;
export type ExecutionToolCall = z.infer<typeof ExecutionToolCallSchema>;
export type ExecutionCompositionRef = z.infer<typeof ExecutionCompositionRefSchema>;
export type ExecutionMode = z.infer<typeof ExecutionModeSchema>;

export function parseExecutionRecord(payload: unknown): ExecutionRecord {
  return ExecutionRecordSchema.parse(payload);
}
