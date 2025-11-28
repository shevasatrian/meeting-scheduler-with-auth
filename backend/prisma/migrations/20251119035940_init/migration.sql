-- CreateTable
CREATE TABLE "OrganizerSettings" (
    "id" SERIAL NOT NULL,
    "timezone" TEXT NOT NULL,
    "workingHoursStart" TEXT NOT NULL,
    "workingHoursEnd" TEXT NOT NULL,
    "meetingDuration" INTEGER NOT NULL,
    "bufferBefore" INTEGER NOT NULL,
    "bufferAfter" INTEGER NOT NULL,
    "minimumNotice" INTEGER NOT NULL,
    "blackoutDates" JSONB NOT NULL,

    CONSTRAINT "OrganizerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "inviteeName" TEXT NOT NULL,
    "inviteeEmail" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_startTime_endTime_key" ON "Booking"("startTime", "endTime");
