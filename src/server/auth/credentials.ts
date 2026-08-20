const HASH_ALGORITHM = "SHA-256";
const ITERATIONS = 310_000;
const KEY_LENGTH_BITS = 256;
const SALT_BYTES = 16;

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(value: string) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) return null;

  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

async function derivePasswordKey(password: string, salt: Uint8Array, iterations: number) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;

  return new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: saltBuffer,
        iterations,
        hash: HASH_ALGORITHM,
      },
      baseKey,
      KEY_LENGTH_BITS,
    ),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(SALT_BYTES);
  crypto.getRandomValues(salt);
  const derivedKey = await derivePasswordKey(password, salt, ITERATIONS);

  return [
    "pbkdf2",
    ITERATIONS,
    "sha256",
    bytesToHex(salt),
    bytesToHex(derivedKey),
  ].join("$");
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const parts = encodedHash.split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[2] !== "sha256") return false;

  const iterations = Number(parts[1]);
  const salt = hexToBytes(parts[3]);
  const expectedKey = hexToBytes(parts[4]);

  if (!Number.isSafeInteger(iterations) || iterations < 100_000 || iterations > 2_000_000) return false;
  if (!salt || salt.length < SALT_BYTES || !expectedKey || expectedKey.length !== KEY_LENGTH_BITS / 8) return false;

  try {
    const derivedKey = await derivePasswordKey(password, salt, iterations);
    return constantTimeEqual(derivedKey, expectedKey);
  } catch {
    return false;
  }
}

export const PASSWORD_HASH_ALGORITHM = "pbkdf2-sha256";
