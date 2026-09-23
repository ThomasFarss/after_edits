-- CreateTable
CREATE TABLE "UserModuleOverride" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,

    CONSTRAINT "UserModuleOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserModuleOverride_userId_moduleId_key" ON "UserModuleOverride"("userId", "moduleId");

-- AddForeignKey
ALTER TABLE "UserModuleOverride" ADD CONSTRAINT "UserModuleOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserModuleOverride" ADD CONSTRAINT "UserModuleOverride_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
