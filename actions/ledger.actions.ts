'use server';

import { prisma } from '@/lib/prisma';
import {
  RecordPaymentSchema,
  RecordSilverReceiptSchema,
  type RecordPaymentInput,
  type RecordSilverReceiptInput,
} from '@/lib/validations/ledger.schema';
import { LedgerType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const typeLabelMap: Record<LedgerType, string> = {
  OPENING: 'Opening',
  SILVER_RCVD: 'Silver Rcvd',
  SILVER_ISSUE: 'Silver Issue',
  JOB_OUT: 'Job Out',
  JOB_IN: 'Job In',
  DISPATCH: 'Dispatch',
  PAYMENT: 'Payment',
  ADJUSTMENT: 'Adjustment',
};

export async function getDualLedgerAction() {
  try {
    const entries = await prisma.dualLedgerEntry.findMany({
      orderBy: { entryDate: 'asc' },
    });

    const formatted = entries.map((e) => ({
      id: e.id,
      date: e.dateDisplay,
      type: typeLabelMap[e.entryType] || 'Other',
      rawType: e.entryType,
      party: e.partyName,
      ref: e.referenceNo,
      sIn: Number(e.silverIn),
      sOut: Number(e.silverOut),
      sBal: Number(e.silverBalance),
      iIn: Number(e.inrIn),
      iOut: Number(e.inrOut),
      iBal: Number(e.inrBalance),
      note: e.remarks || '—',
    }));

    return { success: true, data: formatted };
  } catch (err: unknown) {
    console.error('Error fetching dual ledger:', err);
    return { success: false, error: 'Failed to fetch dual ledger records' };
  }
}

export async function recordPaymentAction(input: RecordPaymentInput) {
  try {
    const validated = RecordPaymentSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid payment data' };
    }

    const { partyName, referenceNo, paymentType, amount, mode, remarks } = validated.data;

    const now = new Date();
    const dateDisplay = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });

    // Calculate latest running balances
    const lastEntry = await prisma.dualLedgerEntry.findFirst({
      orderBy: { entryDate: 'desc' },
    });

    const currentSilverBal = lastEntry ? Number(lastEntry.silverBalance) : 0;
    const currentInrBal = lastEntry ? Number(lastEntry.inrBalance) : 0;

    let inrIn = 0;
    let inrOut = 0;
    let newInrBal = currentInrBal;

    if (paymentType === 'CLIENT_PAYMENT') {
      inrIn = amount;
      newInrBal = currentInrBal + amount;
    } else {
      inrOut = amount;
      newInrBal = currentInrBal - amount;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Dual ledger entry
      const entry = await tx.dualLedgerEntry.create({
        data: {
          dateDisplay,
          entryType: LedgerType.PAYMENT,
          partyName,
          referenceNo,
          silverIn: 0,
          silverOut: 0,
          silverBalance: currentSilverBal,
          inrIn,
          inrOut,
          inrBalance: newInrBal,
          remarks: remarks || `${paymentType.replace('_', ' ')} via ${mode}`,
        },
      });

      // 2. If client payment, reduce client outstanding
      if (paymentType === 'CLIENT_PAYMENT') {
        const client = await tx.client.findFirst({ where: { name: partyName } });
        if (client) {
          await tx.client.update({
            where: { id: client.id },
            data: {
              inrOutstanding: { decrement: amount },
              lastActiveDate: 'Today',
            },
          });
        }
      }

      // 3. Activity log
      await tx.activityLog.create({
        data: {
          message: `Payment ₹ ${amount.toLocaleString('en-IN')} recorded · ${partyName} · ${mode}`,
          timeDisplay: 'Just now',
          tagColor: '#60A5FA',
          referenceNo,
        },
      });

      return entry;
    });

    revalidatePath('/ledger');
    revalidatePath('/clients');
    revalidatePath('/finance');

    return {
      success: true,
      data: {
        id: result.id,
        date: result.dateDisplay,
        type: 'Payment',
        party: result.partyName,
        ref: result.referenceNo,
        sIn: 0,
        sOut: 0,
        sBal: Number(result.silverBalance),
        iIn: Number(result.inrIn),
        iOut: Number(result.inrOut),
        iBal: Number(result.inrBalance),
        note: result.remarks,
      },
    };
  } catch (err: unknown) {
    console.error('Error recording payment:', err);
    return { success: false, error: 'Failed to record payment in ledger' };
  }
}
