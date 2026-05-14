import type { PublicClient, WalletClient } from "viem";
import { attestationRegistryAbi } from "./abis/attestation-registry.js";

export interface AttestationRegistryContext {
  address: `0x${string}`;
  client: PublicClient;
}

export interface AttestationRegistryWriteContext {
  address: `0x${string}`;
  wallet: WalletClient;
  account: `0x${string}`;
}

export interface RuntimeMeasurement {
  measurementType: string;
  attestationRoot: `0x${string}`;
  registeredAt: bigint;
}

export async function isRegistered(
  ctx: AttestationRegistryContext,
  runtimeMeasurement: `0x${string}`,
): Promise<boolean> {
  return (await ctx.client.readContract({
    address: ctx.address,
    abi: attestationRegistryAbi,
    functionName: "isRegistered",
    args: [runtimeMeasurement],
  })) as boolean;
}

export async function readMeasurement(
  ctx: AttestationRegistryContext,
  runtimeMeasurement: `0x${string}`,
): Promise<RuntimeMeasurement> {
  const [measurementType, attestationRoot, registeredAt] = (await ctx.client.readContract({
    address: ctx.address,
    abi: attestationRegistryAbi,
    functionName: "measurement",
    args: [runtimeMeasurement],
  })) as readonly [string, `0x${string}`, bigint];

  return { measurementType, attestationRoot, registeredAt };
}

export async function registerMeasurement(
  ctx: AttestationRegistryWriteContext,
  params: {
    runtimeMeasurement: `0x${string}`;
    measurementType: string;
    attestationRoot: `0x${string}`;
  },
): Promise<`0x${string}`> {
  return ctx.wallet.writeContract({
    address: ctx.address,
    abi: attestationRegistryAbi,
    functionName: "register",
    args: [params.runtimeMeasurement, params.measurementType, params.attestationRoot],
    account: ctx.account,
    chain: null,
  });
}
