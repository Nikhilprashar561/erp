'use server';

import { prisma } from '@/lib/prisma';
import { KarigarSchema, AssignWorkSchema, type KarigarInput, type AssignWorkInput } from '@/lib/validations/karigar.schema';
import { revalidatePath } from 'next/cache';

export async function getKarigarsAction() {
  try {
    const karigars = await prisma.karigar.findMany({
      orderBy: { name: 'asc' },
      include: {
        pieces: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const formatted = karigars.map((k) => ({
      id: k.id,
      karigarCode: k.karigarCode,
      name: k.name,
      skill: k.skill,
      held: Number(k.silverHeld),
      pieces: k.piecesCount,
      wastage: Number(k.wastagePct),
      payable: Number(k.wagesPayable),
      risk: k.riskLevel.toLowerCase() as 'green' | 'amber' | 'red',
      piecesList: k.pieces.map((p) => ({
        pid: p.pieceId,
        ref: p.product,
        product: p.product,
        issued: Number(p.weightIssued),
        exp: Number(p.expectedFine),
        due: p.dueDate,
        status: p.status.toLowerCase(),
      })),
    }));

    return { success: true, data: formatted };
  } catch (err: unknown) {
    console.error('Error fetching karigars:', err);
    return { success: false, error: 'Failed to fetch karigars from database' };
  }
}

export async function createKarigarAction(input: KarigarInput) {
  try {
    const validated = KarigarSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Validation failed' };
    }

    const { name, skill, wastagePct, riskLevel } = validated.data;
    const baseCode = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5);
    const karigarCode = `k_${baseCode}_${Date.now().toString().slice(-3)}`;

    const newKarigar = await prisma.karigar.create({
      data: {
        karigarCode,
        name,
        skill,
        wastagePct,
        riskLevel,
        silverHeld: 0,
        piecesCount: 0,
        wagesPayable: 0,
      },
    });

    revalidatePath('/karigar');
    return {
      success: true,
      data: {
        id: newKarigar.id,
        karigarCode: newKarigar.karigarCode,
        name: newKarigar.name,
        skill: newKarigar.skill,
        held: 0,
        pieces: 0,
        wastage: Number(newKarigar.wastagePct),
        payable: 0,
        risk: newKarigar.riskLevel.toLowerCase() as 'green' | 'amber' | 'red',
        piecesList: [],
      },
    };
  } catch (err: unknown) {
    console.error('Error creating karigar:', err);
    return { success: false, error: 'Failed to create karigar in database' };
  }
}

export async function assignWorkAction(input: AssignWorkInput) {
  try {
    const validated = AssignWorkSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Validation failed' };
    }

    const { karigarId, product, orderRef, weightIssued, expectedFine, dueDate } = validated.data;
    const pieceId = `PC-${Date.now().toString().slice(-4)}`;

    // Find order or associate with default
    const order = await prisma.order.findFirst();
    if (!order) return { success: false, error: 'No active orders in system' };

    // Transaction: Create piece and update karigar silver held
    const result = await prisma.$transaction(async (tx) => {
      const piece = await tx.karigarPiece.create({
        data: {
          pieceId,
          orderId: order.id,
          karigarId,
          product,
          weightIssued,
          expectedFine,
          dueDate,
        },
      });

      const updatedKarigar = await tx.karigar.update({
        where: { id: karigarId },
        data: {
          silverHeld: { increment: weightIssued },
          piecesCount: { increment: 1 },
        },
      });

      return { piece, updatedKarigar };
    });

    revalidatePath('/karigar');
    return { success: true, data: result };
  } catch (err: unknown) {
    console.error('Error assigning work:', err);
    return { success: false, error: 'Failed to assign work' };
  }
}
