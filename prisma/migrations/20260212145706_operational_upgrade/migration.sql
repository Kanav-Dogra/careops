-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Scheduled';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'New';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'staff';
