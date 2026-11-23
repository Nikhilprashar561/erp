'use server';

import { prisma } from '@/lib/prisma';
import {
  CreateJobOrderSchema,
  ReceiveJobReturnSchema,
  type CreateJobOrderInput,
  type ReceiveJobReturnInput,
} from '@/lib/validations/outsourcing.schema';
import { OrderStatus, LedgerType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getJobWorkersAction() {
  try {
    const workers = await prisma.jobWorker.findMany({
      include: {
        jobs: {
          include: {
            order: {
              select: {
                orderNo: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formattedWorkers = workers.map((w) => ({
      id: w.id,
      code: w.workerCode,
      name: w.name,
      spec: w.specialty,
      held: Number(w.silverHeld),
      active: w.activeJobsCount,
      overdue: w.overdueCount,
      risk: w.riskLevel.toLowerCase(),
    }));

    const jobsByWorker: Record<string, Array<{
      id: string;
      jid: string;
      ref: string;
      jtype: string;
      sent: number;
      ret: number;
      due: string;
      status: string;
      labour: number;
    }>> = {};

    workers.forEach((w) => {
      jobsByWorker[w.id] = w.jobs.map((j) => ({
        id: j.id,
        jid: j.jobId,
        ref: j.order.orderNo,
        jtype: j.jobType,
        sent: Number(j.weightSent),
        ret: Number(j.weightReturned),
        due: j.dueDate,
        status: j.status.toLowerCase(),
        labour: Number(j.labourCost),
      }));
    });

    return {
      success: true,
      data: {
        workers: formattedWorkers,
        jobsByWorker,
      },
    };
  } catch (err: unknown) {
    console.error('Error fetching job workers:', err);
    return { success: false, error: 'Failed to fetch job workers and outsourcing jobs' };
  }
}

export async function createJobOrderAction(input: CreateJobOrderInput) {
  try {
    const validated = CreateJobOrderSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid job order data' };
    }

    const { workerId, orderId, jobType, weightSent, dueDate, labourCost } = validated.data;

    // Verify worker
    const worker = await prisma.jobWorker.findFirst({
      where: { OR: [{ id: workerId }, { workerCode: workerId }] },
    });
    if (!worker) return { success: false, error: 'Selected job worker not found' };

    // Verify order
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { orderNo: orderId }] },
    });
    if (!order) return { success: false, error: 'Selected order reference not found' };

    // Sequential JOB-xxx
    const lastJob = await prisma.outsourceJob.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { jobId: true },
    });

    let nextNum = 908;
    if (lastJob && lastJob.jobId.startsWith('JOB-')) {
      const parsed = parseInt(lastJob.jobId.replace('JOB-', ''), 10);
      if (!isNaN(parsed)) nextNum = parsed + 1;
    }
    const jobId = `JOB-${nextNum}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create job
      const job = await tx.outsourceJob.create({
        data: {
          jobId,
          orderId: order.id,
          workerId: worker.id,
          jobType,
          weightSent,
          weightReturned: 0,
          dueDate,
          status: OrderStatus.PRODUCTION,
          labourCost,
        },
      });

      // 2. Increment worker held silver & active jobs
      await tx.jobWorker.update({
        where: { id: worker.id },
        data: {
          silverHeld: { increment: weightSent },
          activeJobsCount: { increment: 1 },
        },
      });

      // 3. Dual ledger entry
      await tx.dualLedgerEntry.create({
        data: {
          dateDisplay: 'Today',
          entryType: LedgerType.JOB_OUT,
          partyName: worker.name,
          referenceNo: jobId,
          workerId: worker.id,
          silverIn: 0,
          silverOut: weightSent,
          silverBalance: Number(worker.silverHeld) + weightSent,
          inrIn: 0,
          inrOut: labourCost,
          inrBalance: 0,
          remarks: `Outsourced ${jobType} · Order ${order.orderNo}`,
        },
      });

      // 4. Activity log
      await tx.activityLog.create({
        data: {
          message: `Job ${jobId} issued to ${worker.name} · ${weightSent.toFixed(3)} g`,
          timeDisplay: 'Just now',
          tagColor: '#FFC840',
          referenceNo: jobId,
        },
      });

      return job;
    });

    revalidatePath('/outsourcing');
    revalidatePath('/ledger');
    revalidatePath('/wheresilver');

    return {
      success: true,
      data: {
        id: result.id,
        jid: result.jobId,
        ref: order.orderNo,
        jtype: result.jobType,
        sent: Number(result.weightSent),
        ret: 0,
        due: result.dueDate,
        status: result.status.toLowerCase(),
        labour: Number(result.labourCost),
      },
    };
  } catch (err: unknown) {
    console.error('Error creating job order:', err);
    return { success: false, error: 'Failed to create outsourcing job order' };
  }
}

export async function receiveJobReturnAction(input: ReceiveJobReturnInput) {
  try {
    const validated = ReceiveJobReturnSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid return data' };
    }

    const { jobId, weightReturned, scrapReturned, isCompleted } = validated.data;

    const job = await prisma.outsourceJob.findFirst({
      where: { OR: [{ jobId }, { id: jobId }] },
      include: {
        worker: true,
        order: { select: { orderNo: true } },
      },
    });

    if (!job) return { success: false, error: `Job ${jobId} not found` };

    const totalDeduction = weightReturned + (scrapReturned || 0);
    const newReturnedWeight = Number(job.weightReturned) + weightReturned;
    const isFullyReturned = isCompleted || newReturnedWeight >= Number(job.weightSent);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Job
      const updatedJob = await tx.outsourceJob.update({
        where: { id: job.id },
        data: {
          weightReturned: newReturnedWeight,
          status: isFullyReturned ? OrderStatus.RETURNED : OrderStatus.PARTIAL,
        },
      });

      // 2. Decrement worker silver held & active jobs
      await tx.jobWorker.update({
        where: { id: job.workerId },
        data: {
          silverHeld: { decrement: totalDeduction },
          ...(isFullyReturned && job.worker.activeJobsCount > 0 ? { activeJobsCount: { decrement: 1 } } : {}),
        },
      });

      // 3. Dual ledger entry
      await tx.dualLedgerEntry.create({
        data: {
          dateDisplay: 'Today',
          entryType: LedgerType.SILVER_RCVD,
          partyName: job.worker.name,
          referenceNo: job.jobId,
          workerId: job.workerId,
          silverIn: weightReturned,
          silverOut: 0,
          silverBalance: Math.max(0, Number(job.worker.silverHeld) - totalDeduction),
          inrIn: 0,
          inrOut: 0,
          inrBalance: 0,
          remarks: `Return received from ${job.worker.name} for ${job.jobId} (${weightReturned.toFixed(3)} g${scrapReturned > 0 ? ` + ${scrapReturned.toFixed(3)} g scrap` : ''})`,
        },
      });

      // 4. Activity log
      await tx.activityLog.create({
        data: {
          message: `Return recorded for ${job.jobId} · ${weightReturned.toFixed(3)} g rcvd from ${job.worker.name}`,
          timeDisplay: 'Just now',
          tagColor: '#4ADE80',
          referenceNo: job.jobId,
        },
      });

      return updatedJob;
    });

    revalidatePath('/outsourcing');
    revalidatePath('/ledger');
    revalidatePath('/wheresilver');

    return {
      success: true,
      data: {
        id: result.id,
        jid: result.jobId,
        ret: Number(result.weightReturned),
        status: result.status.toLowerCase(),
      },
    };
  } catch (err: unknown) {
    console.error('Error receiving job return:', err);
    return { success: false, error: 'Failed to record job return' };
  }
}
