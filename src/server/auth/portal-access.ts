import { AuthorizationError } from "./errors";
import { getPrisma, requireTenantContext } from "./tenant-context";

export async function requireStudentPortalAccess(studentId?: string) {
  const context = await requireTenantContext();
  const prisma = getPrisma();

  const student = await prisma.student.findFirst({
    where: {
      tenantId: context.tenantId,
      membershipId: context.membershipId,
      status: "ACTIVE",
      ...(studentId ? { id: studentId } : {}),
    },
    select: { id: true },
  });

  if (!student) {
    throw new AuthorizationError("Student portal access denied");
  }

  return { context, studentId: student.id };
}

export async function requireGuardianPortalAccess(studentId?: string) {
  const context = await requireTenantContext();
  const prisma = getPrisma();

  const guardian = await prisma.guardian.findFirst({
    where: {
      tenantId: context.tenantId,
      membershipId: context.membershipId,
      status: "ACTIVE",
    },
    select: { id: true },
  });

  if (!guardian) {
    throw new AuthorizationError("Parent portal access denied");
  }

  if (!studentId) {
    return { context, guardianId: guardian.id };
  }

  const relationship = await prisma.studentGuardian.findFirst({
    where: {
      tenantId: context.tenantId,
      guardianId: guardian.id,
      studentId,
      student: {
        tenantId: context.tenantId,
        status: "ACTIVE",
      },
    },
    select: { studentId: true },
  });

  if (!relationship) {
    throw new AuthorizationError("Parent is not authorized to access this student");
  }

  return {
    context,
    guardianId: guardian.id,
    studentId: relationship.studentId,
  };
}
