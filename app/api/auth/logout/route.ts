import { NextResponse } from "next/server";

import { logout } from "@/src/server/auth/session";

export async function POST() {
  await logout();
  return NextResponse.json({ success: true });
}
