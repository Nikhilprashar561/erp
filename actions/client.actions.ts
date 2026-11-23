'use server';

import { prisma } from '@/lib/prisma';
import { ClientSchema, type ClientInput } from '@/lib/validations/client.schema';
import { revalidatePath } from 'next/cache';

export async function getClientsAction() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' },
      include: {
        orders: {
          select: {
            orderNo: true,
            productsSummary: true,
            grossWeight: true,
            fineWeight: true,
            status: true,
            dueDate: true,
            silverOutstanding: true,
            inrOutstanding: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Format Decimal values for client JSON serialization
    const formatted = clients.map((c) => ({
      id: c.id,
      clientCode: c.clientCode,
      name: c.name,
      city: c.city,
      gst: c.gstNumber,
      init: c.initials,
      phone: c.phone || undefined,
      last: c.lastActiveDate || 'Recent',
      silverOut: Number(c.silverOutstanding),
      inrOut: Number(c.inrOutstanding),
      credS: Number(c.creditSilverLimit),
      credI: Number(c.creditInrLimit),
      orders: c.orders.map((o) => ({
        no: o.orderNo,
        products: o.productsSummary,
        gross: Number(o.grossWeight),
        fine: Number(o.fineWeight),
        status: o.status.toLowerCase(),
        due: o.dueDate,
        outS: Number(o.silverOutstanding),
        outI: Number(o.inrOutstanding),
      })),
    }));

    return { success: true, data: formatted };
  } catch (err: unknown) {
    console.error('Error fetching clients:', err);
    return { success: false, error: 'Failed to fetch clients from database' };
  }
}

export async function createClientAction(input: ClientInput) {
  try {
    const validated = ClientSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Validation failed' };
    }

    const { name, city, gstNumber, phone, email, creditSilverLimit, creditInrLimit } = validated.data;

    // Generate unique clientCode and initials
    const baseCode = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 10);
    const clientCode = `${baseCode}_${Date.now().toString().slice(-4)}`;
    const initials = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'CL';

    const newClient = await prisma.client.create({
      data: {
        clientCode,
        name,
        city,
        gstNumber,
        initials,
        phone,
        email,
        lastActiveDate: 'Just now',
        silverOutstanding: 0,
        inrOutstanding: 0,
        creditSilverLimit,
        creditInrLimit,
      },
    });

    revalidatePath('/clients');
    return {
      success: true,
      data: {
        id: newClient.id,
        clientCode: newClient.clientCode,
        name: newClient.name,
        city: newClient.city,
        gst: newClient.gstNumber,
        init: newClient.initials,
        last: 'Just now',
        silverOut: 0,
        inrOut: 0,
        credS: Number(newClient.creditSilverLimit),
        credI: Number(newClient.creditInrLimit),
        orders: [],
      },
    };
  } catch (err: unknown) {
    console.error('Error creating client:', err);
    return { success: false, error: 'Failed to create client in database' };
  }
}
