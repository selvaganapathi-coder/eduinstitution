import { NextResponse } from "next/server";

import { getInstitutionOptions } from "@/src/server/auth/authenticate";
import { AuthenticationError } from "@/src/server/auth/errors";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
    };

    if (typeof body.email !== "string" || typeof body.password !== "string") {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const institutions = await getInstitutionOptions({
      email: body.email,
      password: body.password,
    });

    return NextResponse.json({ institutions });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("Institution lookup failed", error);
    return NextResponse.json({ error: "Unable to load institutions right now" }, { status: 500 });
  }
}
