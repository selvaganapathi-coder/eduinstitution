-- TASK-017 dependency: link StaffMember to tenant Membership for authenticated staff identity.
-- Nullable for backward compatibility with existing staff records that do not yet have application access.

ALTER TABLE "StaffMember"
  ADD COLUMN "membershipId" TEXT;

CREATE UNIQUE INDEX "StaffMember_membershipId_key"
  ON "StaffMember"("membershipId");

ALTER TABLE "StaffMember"
  ADD CONSTRAINT "StaffMember_membershipId_fkey"
  FOREIGN KEY ("membershipId") REFERENCES "Membership"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
