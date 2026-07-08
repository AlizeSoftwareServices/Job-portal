-- CreateIndex
CREATE INDEX "Job_status_approvalStatus_createdAt_idx" ON "Job"("status", "approvalStatus", "createdAt");

-- CreateIndex
CREATE INDEX "Job_categoryId_status_approvalStatus_idx" ON "Job"("categoryId", "status", "approvalStatus");

-- CreateIndex
CREATE INDEX "Job_employerId_createdAt_idx" ON "Job"("employerId", "createdAt");

-- CreateIndex
CREATE INDEX "Application_candidateId_appliedAt_idx" ON "Application"("candidateId", "appliedAt");

-- CreateIndex
CREATE INDEX "Application_jobId_appliedAt_idx" ON "Application"("jobId", "appliedAt");

-- CreateIndex
CREATE INDEX "Application_status_appliedAt_idx" ON "Application"("status", "appliedAt");

-- CreateIndex
CREATE INDEX "Application_assignedEmployerId_appliedAt_idx" ON "Application"("assignedEmployerId", "appliedAt");
