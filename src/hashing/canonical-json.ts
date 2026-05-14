/**
 * RFC 8785 JSON Canonicalization Scheme (JCS).
 *
 * Produces a deterministic, byte-identical encoding of a JSON value across
 * implementations. The encoding is then hashed (typically with keccak256) to
 * produce the on-chain anchor for persona and skill payloads.
 *
 * Conformance notes:
 *   - Object keys are sorted in ascending order by their UTF-16 code unit
 *     sequence. JavaScript's default `Array.prototype.sort` orders strings
 *     by UTF-16 code units, which matches the JCS requirement.
 *   - Strings are escaped per RFC 8259 with the minimum number of \\u escapes.
 *   - Numbers are formatted per ECMA-262 ToString applied to a Number, which
 *     matches the JCS-mandated output for IEEE 754 double-precision values.
 *   - `undefined`, functions, and symbols are not valid JSON; passing them
 *     throws a TypeError.
 *   - BigInt is not part of JSON; pass numeric strings explicitly if you need
 *     arbitrary-precision integers in a payload.
 *
 * This implementation is sufficient for all persona, skill, composition, and
 * execution record payloads defined in the protocol. For payloads with exotic
 * numeric shapes (e.g. integers above 2^53), prefer string encoding upstream.
 */

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

/**
 * Encode a JSON value as a canonical UTF-8 string per RFC 8785.
 *
 * @throws TypeError if the value contains non-JSON types (undefined, BigInt,
 *   function, symbol, NaN, or Infinity).
 */
export function canonicalize(value: unknown): string {
  return encode(value);
}

/**
 * Encode and return as a UTF-8 byte array (Uint8Array). Suitable as direct
 * input to a hash function.
 */
export function canonicalizeBytes(value: unknown): Uint8Array {
  return new TextEncoder().encode(canonicalize(value));
}

function encode(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return encodeString(value);
  if (typeof value === "number") return encodeNumber(value);
  if (Array.isArray(value)) return encodeArray(value);
  if (typeof value === "object") return encodeObject(value as Record<string, unknown>);

  throw new TypeError(
    `canonicalize: unsupported value of type ${typeof value} (value: ${String(value)})`,
  );
}

function encodeNumber(n: number): string {
  if (!Number.isFinite(n)) {
    throw new TypeError(`canonicalize: NaN and Infinity are not valid JSON (got ${n})`);
  }
  // JCS mandates ECMAScript ToString, which is what String(n) returns.
  // For integer-valued doubles, this produces e.g. "1" rather than "1.0",
  // matching the JCS specification.
  return String(n);
}

function encodeString(s: string): string {
  // Implements the string-encoding rules from RFC 8259 §7 (with the JCS
  // requirement that only the minimum required escapes be used).
  let out = '"';
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    switch (code) {
      case 0x22:
        out += '\\"';
        break;
      case 0x5c:
        out += "\\\\";
        break;
      case 0x08:
        out += "\\b";
        break;
      case 0x0c:
        out += "\\f";
        break;
      case 0x0a:
        out += "\\n";
        break;
      case 0x0d:
        out += "\\r";
        break;
      case 0x09:
        out += "\\t";
        break;
      default:
        if (code < 0x20) {
          out += `\\u${code.toString(16).padStart(4, "0")}`;
        } else {
          out += s[i];
        }
    }
  }
  out += '"';
  return out;
}

function encodeArray(arr: unknown[]): string {
  if (arr.length === 0) return "[]";
  let out = "[";
  for (let i = 0; i < arr.length; i++) {
    if (i > 0) out += ",";
    out += encode(arr[i]);
  }
  out += "]";
  return out;
}

function encodeObject(obj: Record<string, unknown>): string {
  const keys = Object.keys(obj).sort();
  if (keys.length === 0) return "{}";
  let out = "{";
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    if (i > 0) out += ",";
    out += encodeString(key);
    out += ":";
    out += encode(obj[key]);
  }
  out += "}";
  return out;
}
