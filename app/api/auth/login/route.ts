import { NextResponse } from "next/server";

import { authenticate } from "@/src/server/auth/authenticate";
import { AuthenticationError, TenantAccessError } from "@/src/server/auth/errors";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
      tenantId?: unknown;
    };

    if (typeof body.email !== "string" || typeof body.password !== "string") {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (body.tenantId !== undefined && typeof body.tenantId !== "string") {
      return NextResponse.json({ error: "Invalid institution selection" }, { status: 400 });
    }

    const result = await authenticate({
      email: body.email,
      password: body.password,
      tenantId: body.tenantId,
    });

    return NextResponse.json({
      userId: result.userId,
      tenantId: result.tenantId,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof TenantAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Authentication request failed", error);
    return NextResponse.json({ error: "Unable to sign in right now" }, { status: 500 });
  }
}
