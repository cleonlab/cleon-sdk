import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { describe, expect, it } from "vitest";
import {
  buildSessionGrant,
  buildSkillAuth,
  signSessionGrant,
  signSkillAuth,
  verifySessionGrant,
  verifySkillAuth,
} from "../src/signatures/eip712.js";

const TEST_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const account = privateKeyToAccount(TEST_KEY);
const wallet = createWalletClient({
  account,
  chain: base,
  transport: http("https://example.invalid"),
});

const VERIFYING = "0x000000000000000000000000000000000000c130" as const;
const COMP = "0x".padEnd(66, "1") as `0x${string}`;
const SKILL = "0x".padEnd(66, "2") as `0x${string}`;
const INPUT = "0x".padEnd(66, "3") as `0x${string}`;

describe("buildSkillAuth", () => {
  it("constructs typed data with the Cleon domain", () => {
    const typed = buildSkillAuth({
      chainId: 8453,
      verifyingContract: VERIFYING,
      message: {
        composition: COMP,
        skill_hash: SKILL,
        input_hash: INPUT,
        scope: "external_api",
        expires_at: 9999999999n,
        nonce: 1n,
      },
    });
    expect(typed.domain.name).toBe("Cleon");
    expect(typed.domain.chainId).toBe(8453);
    expect(typed.primaryType).toBe("SkillAuth");
  });
});

describe("SkillAuth sign + verify round trip", () => {
  it("produces a signature recoverable to the signer", async () => {
    const params = {
      chainId: 8453,
      verifyingContract: VERIFYING,
      message: {
        composition: COMP,
        skill_hash: SKILL,
        input_hash: INPUT,
        scope: "external_api",
        expires_at: 9999999999n,
        nonce: 42n,
      },
    };
    const sig = await signSkillAuth(wallet, account, params);
    const ok = await verifySkillAuth(account.address, sig, params);
    expect(ok).toBe(true);
  });

  it("fails verification when the message is tampered with", async () => {
    const params = {
      chainId: 8453,
      verifyingContract: VERIFYING,
      message: {
        composition: COMP,
        skill_hash: SKILL,
        input_hash: INPUT,
        scope: "external_api",
        expires_at: 9999999999n,
        nonce: 1n,
      },
    };
    const sig = await signSkillAuth(wallet, account, params);
    const tampered = {
      ...params,
      message: { ...params.message, nonce: 999n },
    };
    const ok = await verifySkillAuth(account.address, sig, tampered);
    expect(ok).toBe(false);
  });
});

describe("SessionGrant sign + verify round trip", () => {
  it("produces a signature recoverable to the signer", async () => {
    const params = {
      chainId: 8453,
      verifyingContract: VERIFYING,
      message: {
        session_key: "0x000000000000000000000000000000000000beef" as `0x${string}`,
        composition: COMP,
        scopes: "external_api,onchain_read",
        expires_at: 9999999999n,
        nonce: 7n,
      },
    };
    const sig = await signSessionGrant(wallet, account, params);
    const ok = await verifySessionGrant(account.address, sig, params);
    expect(ok).toBe(true);
  });
});

describe("buildSessionGrant", () => {
  it("constructs typed data with SessionGrant as primary type", () => {
    const typed = buildSessionGrant({
      chainId: 8453,
      verifyingContract: VERIFYING,
      message: {
        session_key: "0x000000000000000000000000000000000000beef" as `0x${string}`,
        composition: COMP,
        scopes: "external_api",
        expires_at: 9999999999n,
        nonce: 1n,
      },
    });
    expect(typed.primaryType).toBe("SessionGrant");
  });
});
