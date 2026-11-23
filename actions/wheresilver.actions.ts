'use server';

import { prisma } from '@/lib/prisma';
import { LocationType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getSilverLocationsAction() {
  try {
    const locations = await prisma.silverLocation.findMany({
      orderBy: [{ locationType: 'asc' }, { amountHeld: 'desc' }],
    });

    const formatted = locations.map((l) => {
      let typeLabel = 'Factory';
      if (l.locationType === LocationType.KARIGAR) typeLabel = 'Karigar';
      else if (l.locationType === LocationType.JOB_WORKER) typeLabel = 'Job Worker';
      else if (l.locationType === LocationType.CLIENT_DISPATCHED) typeLabel = 'Client (Dispatched)';

      return {
        id: l.id,
        type: typeLabel,
        party: l.partyOrVault,
        amt: Number(l.amountHeld),
        since: l.holdingSince,
        aging: l.agingDays,
      };
    });

    return { success: true, data: formatted };
  } catch (err: unknown) {
    console.error('Error fetching silver locations:', err);
    return { success: false, error: 'Failed to fetch silver locations' };
  }
}

export async function reconcileSilverLocationsAction() {
  try {
    // Reconcile Karigar balances
    const karigars = await prisma.karigar.findMany({ select: { name: true, silverHeld: true } });
    for (const k of karigars) {
      const existing = await prisma.silverLocation.findFirst({
        where: { locationType: LocationType.KARIGAR, partyOrVault: k.name },
      });
      if (existing) {
        await prisma.silverLocation.update({
          where: { id: existing.id },
          data: { amountHeld: k.silverHeld },
        });
      }
    }

    // Reconcile Job Worker balances
    const workers = await prisma.jobWorker.findMany({ select: { name: true, silverHeld: true } });
    for (const w of workers) {
      const existing = await prisma.silverLocation.findFirst({
        where: { locationType: LocationType.JOB_WORKER, partyOrVault: w.name },
      });
      if (existing) {
        await prisma.silverLocation.update({
          where: { id: existing.id },
          data: { amountHeld: w.silverHeld },
        });
      }
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        message: 'Enterprise silver reconciliation executed across all vaults, karigars and job workers',
        timeDisplay: 'Just now',
        tagColor: '#60A5FA',
        referenceNo: 'RECONCILE',
      },
    });

    revalidatePath('/wheresilver');

    return { success: true };
  } catch (err: unknown) {
    console.error('Error reconciling silver locations:', err);
    return { success: false, error: 'Failed to reconcile silver locations' };
  }
}
