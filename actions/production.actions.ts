'use server';

import { prisma } from '@/lib/prisma';
import { AdvanceBatchSchema, CreateBatchSchema, type CreateBatchInput } from '@/lib/validations/production.schema';
import { ProductionStage } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const STAGE_FLOW: ProductionStage[] = [
  ProductionStage.MELTING,
  ProductionStage.ROD_MAKING,
  ProductionStage.CUTTING,
  ProductionStage.FORMING,
  ProductionStage.POLISHING,
  ProductionStage.QC,
  ProductionStage.DISPATCH,
];

export async function getBatchesAction() {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        order: {
          select: {
            orderNo: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
        karigar: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = batches.map((b) => ({
      id: b.id,
      bid: b.batchId,
      ref: b.order.orderNo,
      client: b.order.client.name,
      product: b.product,
      wt: Number(b.weight),
      stage: b.stage.toLowerCase().replace('_', ''),
      rawStage: b.stage,
      karigar: b.karigar?.name || 'Unassigned',
      inStage: b.inStageDuration,
      delay: b.isDelayed,
    }));

    return { success: true, data: formatted };
  } catch (err: unknown) {
    console.error('Error fetching batches:', err);
    return { success: false, error: 'Failed to fetch production batches' };
  }
}

export async function advanceBatchStageAction(batchId: string, lossWeight = 0) {
  try {
    const validated = AdvanceBatchSchema.safeParse({ batchId, lossWeight });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid batch input' };
    }

    const batch = await prisma.batch.findFirst({
      where: {
        OR: [{ batchId }, { id: batchId }],
      },
      include: {
        order: {
          select: {
            id: true,
            orderNo: true,
          },
        },
      },
    });

    if (!batch) {
      return { success: false, error: `Batch ${batchId} not found` };
    }

    const currentIdx = STAGE_FLOW.indexOf(batch.stage);
    if (currentIdx === -1 || currentIdx >= STAGE_FLOW.length - 1) {
      return { success: false, error: 'Batch is already at the final dispatch stage' };
    }

    const nextStage = STAGE_FLOW[currentIdx + 1];
    const newWeight = Math.max(0, Number(batch.weight) - (lossWeight || 0));

    // Update in transaction
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.batch.update({
        where: { id: batch.id },
        data: {
          stage: nextStage,
          weight: newWeight,
          inStageDuration: 'just now',
          isDelayed: false,
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          message: `Batch ${batch.batchId} advanced to ${nextStage} stage · ${newWeight.toFixed(3)} g`,
          timeDisplay: 'Just now',
          tagColor: '#60A5FA',
          referenceNo: batch.batchId,
        },
      });

      return b;
    });

    revalidatePath('/production');
    revalidatePath('/orders');
    revalidatePath(`/orders/${batch.order.orderNo}`);

    return {
      success: true,
      data: {
        id: updated.id,
        bid: updated.batchId,
        stage: updated.stage.toLowerCase().replace('_', ''),
        wt: Number(updated.weight),
        inStage: updated.inStageDuration,
      },
    };
  } catch (err: unknown) {
    console.error('Error advancing batch:', err);
    return { success: false, error: 'Failed to advance batch stage' };
  }
}

export async function createBatchAction(input: CreateBatchInput) {
  try {
    const validated = CreateBatchSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid batch input' };
    }

    const { orderId, karigarId, product, weight, stage } = validated.data;

    // Verify order exists
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNo: orderId }],
      },
    });

    if (!order) {
      return { success: false, error: 'Referenced order not found' };
    }

    // Generate sequential batch number
    const lastBatch = await prisma.batch.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { batchId: true },
    });

    let nextNum = 552;
    if (lastBatch && lastBatch.batchId.startsWith('BATCH-')) {
      const parsed = parseInt(lastBatch.batchId.replace('BATCH-', ''), 10);
      if (!isNaN(parsed)) nextNum = parsed + 1;
    }
    const batchId = `BATCH-${nextNum}`;

    const newBatch = await prisma.batch.create({
      data: {
        batchId,
        orderId: order.id,
        karigarId: karigarId || null,
        product,
        weight,
        stage,
        inStageDuration: 'just now',
        isDelayed: false,
      },
    });

    revalidatePath('/production');

    return {
      success: true,
      data: {
        id: newBatch.id,
        bid: newBatch.batchId,
        product: newBatch.product,
        wt: Number(newBatch.weight),
        stage: newBatch.stage.toLowerCase().replace('_', ''),
        inStage: newBatch.inStageDuration,
      },
    };
  } catch (err: unknown) {
    console.error('Error creating batch:', err);
    return { success: false, error: 'Failed to create batch' };
  }
}
