-- DropIndex
DROP INDEX "_MembershipToRole_AB_unique";

-- AlterTable
ALTER TABLE "_MembershipToRole" RENAME CONSTRAINT "_MembershipToRole_pkey" TO "_MembershipToRole_AB_pkey";
