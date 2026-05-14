import { keccak_256 } from "@noble/hashes/sha3";

/**
 * keccak256 wrappers. Cleon uses keccak256 (the variant baked into Ethereum,
 * not the NIST-standardized SHA3-256) for all content addressing.
 */

const HEX = "0123456789abcdef";

export function toHex(bytes: Uint8Array): `0x${string}` {
  let s = "0x";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]!;
    s += HEX[b >> 4]! + HEX[b & 0x0f]!;
  }
  return s as `0x${string}`;
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error(`fromHex: odd-length hex string (length ${clean.length})`);
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

/**
 * keccak256 of a byte array. Returns a 0x-prefixed hex string.
 */
export function keccak256(input: Uint8Array): `0x${string}` {
  return toHex(keccak_256(input));
}

/**
 * keccak256 of a UTF-8 string. Convenience wrapper.
 */
export function keccak256OfString(input: string): `0x${string}` {
  return keccak256(new TextEncoder().encode(input));
}
