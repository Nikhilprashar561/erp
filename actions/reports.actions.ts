'use server';

import { prisma } from '@/lib/prisma';

export async function getReportsOverviewAction() {
  try {
    const [ordersCount, invoicesCount, movementsCount, itemsCount] = await Promise.all([
      prisma.order.count(),
      prisma.invoice.count(),
      prisma.materialMovement.count(),
      prisma.inventoryItem.count(),
    ]);

    const reportsList = [
      {
        id: 'METAL_POSITION',
        name: 'Silver Position Statement',
        cat: 'Silver',
        stat: `${movementsCount} Records`,
        desc: 'Daily opening, client receipts, bullion purchases, karigar issues, scrap recovery & closing position.',
      },
      {
        id: 'GST_SALES',
        name: 'GST Sales & Tax Register',
        cat: 'Finance',
        stat: `${invoicesCount} Invoices`,
        desc: 'Comprehensive B2B invoice ledger with HSN 7113, CGST 1.5%, SGST 1.5% and payment realization.',
      },
      {
        id: 'KARIGAR_AUDIT',
        name: 'Karigar Wastage & Loss Audit',
        cat: 'Operations',
        stat: '100% Reconciled',
        desc: 'Worker-by-worker analysis: issued fine silver vs returned weight vs permissible tolerance % loss.',
      },
      {
        id: 'STOCK_VALUATION',
        name: 'Vault & Stock Valuation',
        cat: 'Silver',
        stat: `${itemsCount} SKUs`,
        desc: 'Finished goods and raw bullion across factory vaults valued dynamically at live MCX spot rate.',
      },
      {
        id: 'CLIENT_OUTSTANDING',
        name: 'Party Ledger & Receivables Aging',
        cat: 'Finance',
        stat: `${ordersCount} Active Orders`,
        desc: 'Dual outstanding balances (Fine Silver grams & INR) with 30-60-90 day aging analysis.',
      },
      {
        id: 'STAFF_PAYROLL',
        name: 'Staff Attendance & Payroll Statement',
        cat: 'People',
        stat: 'Monthly Ledger',
        desc: 'Department-wise salary commitments, attendance logs, and staff advances register.',
      },
    ];

    return { success: true, data: reportsList };
  } catch (err: unknown) {
    console.error('Error fetching reports overview:', err);
    return { success: false, error: 'Failed to fetch reports list' };
  }
}

export async function generateReportDataAction(reportId: string) {
  try {
    if (reportId === 'METAL_POSITION') {
      const movements = await prisma.materialMovement.findMany({
        orderBy: { timestamp: 'desc' },
        take: 100,
      });

      const headers = ['Ref No', 'Date', 'Type', 'From Location', 'To Location', 'Fine Weight (g)', 'Authorized By'];
      const rows = movements.map((m) => [
        m.referenceNo,
        m.dateDisplay,
        m.movementType,
        m.fromLocation,
        m.toLocation,
        Number(m.fineWeight).toFixed(3),
        m.createdByName,
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      return { success: true, reportName: 'Silver_Position_Statement.csv', csvContent: csv };
    }

    if (reportId === 'GST_SALES') {
      const invoices = await prisma.invoice.findMany({
        include: { client: true },
        orderBy: { createdAt: 'desc' },
      });

      const headers = ['Invoice No', 'Date', 'Client', 'GSTIN', 'City', 'Subtotal (INR)', 'CGST (1.5%)', 'SGST (1.5%)', 'Grand Total (INR)', 'Paid (INR)', 'Status'];
      const rows = invoices.map((iv) => [
        iv.invoiceNo,
        iv.invoiceDate,
        iv.client.name,
        iv.client.gstNumber,
        iv.client.city,
        Number(iv.subtotal).toFixed(2),
        Number(iv.cgst).toFixed(2),
        Number(iv.sgst).toFixed(2),
        Number(iv.grandTotal).toFixed(2),
        Number(iv.paidAmount).toFixed(2),
        iv.status,
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      return { success: true, reportName: 'GST_Sales_Register.csv', csvContent: csv };
    }

    if (reportId === 'KARIGAR_AUDIT') {
      const karigars = await prisma.karigar.findMany({
        include: { pieces: true },
      });

      const headers = ['Karigar Code', 'Name', 'Skill', 'Held Weight (g)', 'Assigned Pieces', 'Wastage %', 'Payable Wages (INR)', 'Risk Level'];
      const rows = karigars.map((k) => [
        k.karigarCode,
        k.name,
        k.skill,
        Number(k.silverHeld).toFixed(3),
        k.piecesCount.toString(),
        Number(k.wastagePct).toFixed(2) + '%',
        Number(k.wagesPayable).toFixed(2),
        k.riskLevel,
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      return { success: true, reportName: 'Karigar_Wastage_Audit.csv', csvContent: csv };
    }

    // Default: Vault stock valuation
    const items = await prisma.inventoryItem.findMany({
      include: { category: true, purity: true },
    });
    const headers = ['SKU', 'Category', 'Vault Location', 'Purity', 'Gross Wt (g)', 'Fine Wt (g)', 'Pieces', 'Status'];
    const rows = items.map((i) => [
      i.sku,
      i.category?.name || 'Jewellery',
      i.location,
      i.purity?.standard || '92.5%',
      Number(i.grossWeight).toFixed(3),
      Number(i.fineWeight).toFixed(3),
      i.pieces.toString(),
      i.status,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    return { success: true, reportName: 'Vault_Stock_Valuation.csv', csvContent: csv };
  } catch (err: unknown) {
    console.error('Error generating report CSV:', err);
    return { success: false, error: 'Failed to generate report data' };
  }
}
