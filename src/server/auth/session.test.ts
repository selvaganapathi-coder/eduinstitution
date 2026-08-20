import { describe, expect, it } from "vitest";

import {
  generateSessionToken,
  getSessionCookieOptions,
  hashSessionToken,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "./session-core";

describe("session security primitives", () => {
  it("generates cryptographically random URL-safe tokens", () => {
    const first = generateSessionToken();
    const second = generateSessionToken();

    expect(first).toHaveLength(43);
    expect(first).not.toBe(second);
    expect(first).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("hashes the same token deterministically", () => {
    expect(hashSessionToken("test-token")).toBe(hashSessionToken("test-token"));
  });

  it("does not expose the raw token in the stored hash", () => {
    const token = "a-secure-session-token";
    expect(hashSessionToken(token)).not.toContain(token);
    expect(hashSessionToken(token)).toHaveLength(64);
  });

  it("uses a seven-day default session lifetime", () => {
    expect(SESSION_TTL_SECONDS).toBe(60 * 60 * 24 * 7);
  });

  it("uses secure HTTP-only cookie settings in production", () => {
    const original = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      configurable: true,
    });

    const expiresAt = new Date("2030-01-01T00:00:00.000Z");
    const options = getSessionCookieOptions(expiresAt);

    expect(options.httpOnly).toBe(true);
    expect(options.secure).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
    expect(options.expires).toEqual(expiresAt);
    expect(SESSION_COOKIE).toBe("session");

    Object.defineProperty(process.env, "NODE_ENV", {
      value: original,
      configurable: true,
    });
  });
});
