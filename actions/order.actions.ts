'use server';

import { prisma } from '@/lib/prisma';
import { CreateOrderSchema, UpdateOrderStatusSchema, type CreateOrderInput } from '@/lib/validations/order.schema';
import { OrderStatus, ProductionStage } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getOrdersAction(filter?: string) {
  try {
    const whereClause: { status?: OrderStatus } = {};
    if (filter && filter !== 'all') {
      const upper = filter.toUpperCase() as OrderStatus;
      if (Object.values(OrderStatus).includes(upper)) {
        whereClause.status = upper;
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            name: true,
            city: true,
            gstNumber: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = orders.map((o) => ({
      id: o.id,
      no: o.orderNo,
      clientId: o.clientId,
      client: o.client.name,
      city: o.client.city,
      products: o.productsSummary,
      gross: Number(o.grossWeight),
      fine: Number(o.fineWeight),
      status: o.status.toLowerCase(),
      due: o.dueDate,
      prog: o.progressPct,
      rateLocked: Number(o.rateLocked),
      outS: Number(o.silverOutstanding),
      outI: Number(o.inrOutstanding),
      itemCount: o.items.length,
    }));

    return { success: true, data: formatted };
  } catch (err: unknown) {
    console.error('Error fetching orders:', err);
    return { success: false, error: 'Failed to fetch orders from database' };
  }
}

export async function getOrderByIdAction(orderNoOrId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNo: orderNoOrId }, { id: orderNoOrId }],
      },
      include: {
        client: true,
        items: true,
        batches: true,
        invoices: true,
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    const formatted = {
      id: order.id,
      no: order.orderNo,
      clientId: order.clientId,
      client: order.client.name,
      clientCity: order.client.city,
      clientGst: order.client.gstNumber,
      clientSilverOut: Number(order.client.silverOutstanding),
      clientInrOut: Number(order.client.inrOutstanding),
      products: order.productsSummary,
      gross: Number(order.grossWeight),
      fine: Number(order.fineWeight),
      status: order.status.toLowerCase(),
      due: order.dueDate,
      prog: order.progressPct,
      rateLocked: Number(order.rateLocked),
      outS: Number(order.silverOutstanding),
      outI: Number(order.inrOutstanding),
      items: order.items.map((i) => ({
        id: i.id,
        name: i.name,
        gross: Number(i.grossWeight),
        fine: Number(i.fineWeight),
        making: Number(i.makingCharge),
        silverVal: Number(i.silverValue),
        total: Number(i.totalAmount),
      })),
      batches: order.batches.map((b) => ({
        bid: b.batchId,
        product: b.product,
        weight: Number(b.weight),
        stage: b.stage.toLowerCase(),
        inStage: b.inStageDuration,
        delay: b.isDelayed,
      })),
    };

    return { success: true, data: formatted };
  } catch (err: unknown) {
    console.error('Error fetching order detail:', err);
    return { success: false, error: 'Failed to fetch order detail' };
  }
}

export async function createOrderAction(input: CreateOrderInput) {
  try {
    const validated = CreateOrderSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid order data' };
    }

    const { clientId, dueDate, rateLocked, items } = validated.data;

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return { success: false, error: 'Selected client does not exist' };
    }

    // Generate next sequential Order Number (ORD-2242)
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { orderNo: true },
    });

    let nextNum = 2242;
    if (lastOrder && lastOrder.orderNo.startsWith('ORD-')) {
      const currentNum = parseInt(lastOrder.orderNo.replace('ORD-', ''), 10);
      if (!isNaN(currentNum)) nextNum = currentNum + 1;
    }
    const orderNo = `ORD-${nextNum}`;

    // Compute aggregated line item weights and amounts
    let totalGross = 0;
    let totalFine = 0;
    let totalMaking = 0;
    let totalSilverValue = 0;

    const itemCreates = items.map((item) => {
      totalGross += item.grossWeight;
      totalFine += item.fineWeight;
      const silverVal = item.fineWeight * (rateLocked / 1000);
      const makingVal = item.makingChargeRate * item.grossWeight;
      totalSilverValue += silverVal;
      totalMaking += makingVal;
      const lineTotal = silverVal + makingVal;

      return {
        name: item.name,
        quantity: item.quantity,
        grossWeight: item.grossWeight,
        fineWeight: item.fineWeight,
        makingCharge: makingVal,
        silverValue: silverVal,
        totalAmount: lineTotal,
      };
    });

    const grandTotalINR = totalSilverValue + totalMaking;
    const productsSummary = items.map((i) => i.name).join(', ');

    // Atomic Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Order with items
      const order = await tx.order.create({
        data: {
          orderNo,
          clientId,
          productsSummary,
          grossWeight: totalGross,
          fineWeight: totalFine,
          status: OrderStatus.PRODUCTION,
          dueDate,
          progressPct: 15,
          rateLocked,
          silverOutstanding: totalGross,
          inrOutstanding: grandTotalINR,
          items: {
            create: itemCreates,
          },
        },
      });

      // 2. Update client outstanding balances
      await tx.client.update({
        where: { id: clientId },
        data: {
          silverOutstanding: { increment: totalGross },
          inrOutstanding: { increment: grandTotalINR },
          lastActiveDate: 'Just now',
        },
      });

      // 3. Create initial production floor batch
      const batchId = `BATCH-${nextNum - 1700}`;
      await tx.batch.create({
        data: {
          batchId,
          orderId: order.id,
          product: items[0]?.name || 'Jewellery',
          weight: totalGross,
          stage: ProductionStage.MELTING,
          inStageDuration: 'just now',
          isDelayed: false,
        },
      });

      // 4. Log recent activity
      await tx.activityLog.create({
        data: {
          message: `Order ${orderNo} created · ${client.name} · ${totalGross.toFixed(3)} g`,
          timeDisplay: 'Just now',
          tagColor: '#60A5FA',
          referenceNo: orderNo,
        },
      });

      return order;
    });

    revalidatePath('/orders');
    revalidatePath('/clients');
    revalidatePath('/production');

    return {
      success: true,
      data: {
        id: result.id,
        no: result.orderNo,
        clientId: result.clientId,
        client: client.name,
        products: result.productsSummary,
        gross: Number(result.grossWeight),
        fine: Number(result.fineWeight),
        status: result.status.toLowerCase(),
        due: result.dueDate,
        prog: result.progressPct,
        rateLocked: Number(result.rateLocked),
        outS: Number(result.silverOutstanding),
        outI: Number(result.inrOutstanding),
      },
    };
  } catch (err: unknown) {
    console.error('Error creating order:', err);
    return { success: false, error: 'Failed to create order in database' };
  }
}

export async function updateOrderStatusAction(orderId: string, statusInput: string) {
  try {
    const upper = statusInput.toUpperCase() as OrderStatus;
    if (!Object.values(OrderStatus).includes(upper)) {
      return { success: false, error: 'Invalid status' };
    }

    // Map status to progress percentage
    const progressMap: Record<OrderStatus, number> = {
      PRODUCTION: 50,
      QC: 85,
      DISPATCHED: 100,
      COMPLETED: 100,
      HOLD: 25,
      OVERDUE: 70,
      RETURNED: 0,
      PARTIAL: 60,
    };

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: upper,
        progressPct: progressMap[upper] || 50,
      },
    });

    revalidatePath('/orders');
    revalidatePath(`/orders/${updated.orderNo}`);

    return {
      success: true,
      data: {
        id: updated.id,
        no: updated.orderNo,
        status: updated.status.toLowerCase(),
        prog: updated.progressPct,
      },
    };
  } catch (err: unknown) {
    console.error('Error updating order status:', err);
    return { success: false, error: 'Failed to update order status' };
  }
}
