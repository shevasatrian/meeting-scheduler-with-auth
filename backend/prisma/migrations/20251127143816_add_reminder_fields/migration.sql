-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "reminded1Hour" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "remindedAtStart" BOOLEAN NOT NULL DEFAULT false;
