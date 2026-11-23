'use server';

import { prisma } from '@/lib/prisma';
import { CreateMovementSchema, type CreateMovementInput } from '@/lib/validations/movement.schema';
import { MovementType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getMovementsAction() {
  try {
    const movements = await prisma.materialMovement.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    const formatted = movements.map((m) => {
      // Convert RECEIPT -> Receipt
      const formattedType =
        m.movementType.charAt(0) + m.movementType.slice(1).toLowerCase();

      return {
        id: m.id,
        date: m.dateDisplay,
        type: formattedType,
        from: m.fromLocation,
        to: m.toLocation,
        ref: m.referenceNo,
        wt: Number(m.fineWeight),
        by: m.createdByName,
      };
    });

    return { success: true, data: formatted };
  } catch (err: unknown) {
    console.error('Error fetching movements:', err);
    return { success: false, error: 'Failed to fetch material movements' };
  }
}

export async function createMovementAction(input: CreateMovementInput) {
  try {
    const validated = CreateMovementSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid movement data' };
    }

    const { movementType, fromLocation, toLocation, referenceNo, fineWeight, createdByName } = validated.data;

    const now = new Date();
    const dateDisplay = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    const movement = await prisma.materialMovement.create({
      data: {
        movementType: movementType as MovementType,
        fromLocation,
        toLocation,
        referenceNo,
        fineWeight,
        dateDisplay,
        createdByName,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        message: `${movementType} movement: ${fineWeight.toFixed(3)} g from ${fromLocation} to ${toLocation}`,
        timeDisplay: 'Just now',
        tagColor: movementType === 'RECEIPT' || movementType === 'RETURN' ? '#4ADE80' : '#F87171',
        referenceNo,
      },
    });

    revalidatePath('/movement');
    revalidatePath('/wheresilver');

    const formattedType =
      movement.movementType.charAt(0) + movement.movementType.slice(1).toLowerCase();

    return {
      success: true,
      data: {
        id: movement.id,
        date: movement.dateDisplay,
        type: formattedType,
        from: movement.fromLocation,
        to: movement.toLocation,
        ref: movement.referenceNo,
        wt: Number(movement.fineWeight),
        by: movement.createdByName,
      },
    };
  } catch (err: unknown) {
    console.error('Error creating movement:', err);
    return { success: false, error: 'Failed to record movement' };
  }
}
