-- Add mustChangePassword so freshly seeded admins are forced to rotate the default password.
ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
