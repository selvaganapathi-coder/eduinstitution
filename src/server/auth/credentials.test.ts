import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./credentials";

describe("password credentials", () => {
  it("hashes passwords without storing the plaintext", async () => {
    const password = "Correct Horse Battery Staple";
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^pbkdf2\$\d+\$sha256\$/);
    expect(hash).not.toContain(password);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it("uses a unique salt for each password hash", async () => {
    const password = "same-password";
    const first = await hashPassword(password);
    const second = await hashPassword(password);

    expect(first).not.toBe(second);
    expect(await verifyPassword(password, first)).toBe(true);
    expect(await verifyPassword(password, second)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-password");

    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("rejects malformed password hashes", async () => {
    expect(await verifyPassword("password", "not-a-password-hash")).toBe(false);
    expect(await verifyPassword("password", "pbkdf2$1$sha256$salt$bad")).toBe(false);
  });
});
