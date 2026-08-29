import { NextResponse } from "next/server";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "@/src/generated/prisma/client";
import { AuthenticationError, AuthorizationError, TenantAccessError } from "@/src/server/auth/errors";
import { requirePermission } from "@/src/server/auth/permissions";
import { markAttendance } from "@/src/server/attendance/service";
import { validateAttendanceRecordInput } from "@/src/server/attendance/validation";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
function getPrisma() { if (globalForPrisma.prisma) return globalForPrisma.prisma; neonConfig.fetchConnectionCache = true; const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is not configured"); const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) }); if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; return prisma; }
function failure(error: unknown) { if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 }); if (error instanceof AuthorizationError || error instanceof TenantAccessError) return NextResponse.json({ error: error.message }, { status: 403 }); if (error instanceof Error) return NextResponse.json({ error: error.message }, { status: 400 }); console.error("Unable to mark attendance", error); return NextResponse.json({ error: "Unable to mark attendance." }, { status: 500 }); }

export async function PUT(request: Request) { try { const context = await requirePermission("student:update"); const body = await request.json(); const attendanceSessionId = typeof body.attendanceSessionId === "string" ? body.attendanceSessionId.trim() : ""; if (!attendanceSessionId) return NextResponse.json({ error: "Attendance session is required." }, { status: 400 }); const validation = validateAttendanceRecordInput(body); if ("error" in validation) return NextResponse.json(validation, { status: 400 }); const record = await markAttendance(getPrisma(), { tenantId: context.tenantId, attendanceSessionId, ...validation.value }); return NextResponse.json({ record }); } catch (error) { return failure(error); } }
