'use server';

import { prisma } from '@/lib/prisma';
import {
  GenerateInvoiceSchema,
  UpdateInvoicePaymentSchema,
  type GenerateInvoiceInput,
  type UpdateInvoicePaymentInput,
} from '@/lib/validations/invoice.schema';
import { InvoiceStatus, LedgerType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getInvoicesAction() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: {
          select: {
            name: true,
            city: true,
            gstNumber: true,
          },
        },
        order: {
          select: {
            orderNo: true,
          },
        },
        lines: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = invoices.map((iv) => ({
      id: iv.id,
      no: iv.invoiceNo,
      client: iv.client.name,
      city: iv.client.city,
      gst: iv.client.gstNumber,
      order: iv.order.orderNo,
      date: iv.invoiceDate,
      rateLock: iv.rateLocked,
      subtotal: Number(iv.subtotal),
      cgst: Number(iv.cgst),
      sgst: Number(iv.sgst),
      grandTotal: Number(iv.grandTotal),
      paid: Number(iv.paidAmount),
      outstanding: Number(iv.outstandingAmount),
      status: iv.status.toLowerCase(),
      lines: iv.lines.map((l) => ({
        id: l.id,
        desc: l.description,
        fine: Number(l.fineWeight),
        making: Number(l.makingCharge),
        silverVal: Number(l.silverValue),
        total: Number(l.lineTotal),
      })),
    }));

    return { success: true, data: formatted };
  } catch (err: unknown) {
    console.error('Error fetching invoices:', err);
    return { success: false, error: 'Failed to fetch invoices' };
  }
}

export async function generateInvoiceAction(input: GenerateInvoiceInput) {
  try {
    const validated = GenerateInvoiceSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid invoice data' };
    }

    const { orderId, invoiceDate, applyGst } = validated.data;

    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { orderNo: orderId }] },
      include: {
        client: true,
        items: true,
      },
    });

    if (!order) return { success: false, error: 'Order not found' };

    // Sequential INV-xxxx
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { invoiceNo: true },
    });

    let nextNum = 1191;
    if (lastInvoice && lastInvoice.invoiceNo.startsWith('INV-')) {
      const parsed = parseInt(lastInvoice.invoiceNo.replace('INV-', ''), 10);
      if (!isNaN(parsed)) nextNum = parsed + 1;
    }
    const invoiceNo = `INV-${nextNum}`;

    let subtotal = 0;
    const lines = order.items.map((item) => {
      const lineTotal = Number(item.totalAmount);
      subtotal += lineTotal;
      return {
        description: item.name,
        fineWeight: item.fineWeight,
        makingCharge: item.makingCharge,
        silverValue: item.silverValue,
        lineTotal: item.totalAmount,
      };
    });

    const cgst = applyGst ? subtotal * 0.015 : 0;
    const sgst = applyGst ? subtotal * 0.015 : 0;
    const grandTotal = subtotal + cgst + sgst;

    const invoice = await prisma.$transaction(async (tx) => {
      // 1. Create Invoice
      const inv = await tx.invoice.create({
        data: {
          invoiceNo,
          orderId: order.id,
          clientId: order.clientId,
          invoiceDate,
          rateLocked: `₹ ${Number(order.rateLocked).toLocaleString('en-IN')} / kg`,
          subtotal,
          cgst,
          sgst,
          grandTotal,
          paidAmount: 0,
          outstandingAmount: grandTotal,
          status: InvoiceStatus.OUTSTANDING,
          lines: {
            create: lines,
          },
        },
        include: {
          client: true,
          order: true,
          lines: true,
        },
      });

      // 2. Activity log
      await tx.activityLog.create({
        data: {
          message: `GST Invoice ${invoiceNo} raised for ${order.client.name} · ₹ ${grandTotal.toLocaleString('en-IN')}`,
          timeDisplay: 'Just now',
          tagColor: '#60A5FA',
          referenceNo: invoiceNo,
        },
      });

      return inv;
    });

    revalidatePath('/billing');
    revalidatePath('/finance');
    revalidatePath('/ledger');

    return {
      success: true,
      data: {
        id: invoice.id,
        no: invoice.invoiceNo,
        client: invoice.client.name,
        city: invoice.client.city,
        gst: invoice.client.gstNumber,
        order: invoice.order.orderNo,
        date: invoice.invoiceDate,
        rateLock: invoice.rateLocked,
        subtotal: Number(invoice.subtotal),
        cgst: Number(invoice.cgst),
        sgst: Number(invoice.sgst),
        grandTotal: Number(invoice.grandTotal),
        paid: 0,
        outstanding: Number(invoice.outstandingAmount),
        status: invoice.status.toLowerCase(),
        lines: invoice.lines.map((l) => ({
          id: l.id,
          desc: l.description,
          fine: Number(l.fineWeight),
          making: Number(l.makingCharge),
          silverVal: Number(l.silverValue),
          total: Number(l.lineTotal),
        })),
      },
    };
  } catch (err: unknown) {
    console.error('Error generating invoice:', err);
    return { success: false, error: 'Failed to generate invoice' };
  }
}
