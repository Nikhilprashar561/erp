import { PrismaClient, OrderStatus, ProductionStage, RiskLevel, LocationType, MovementType, LedgerType, InvoiceStatus, InventoryStatus, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SilverSuite PostgreSQL database...');

  // 1. Company Profile
  await prisma.companyProfile.upsert({
    where: { id: 'default-profile' },
    update: {},
    create: {
      id: 'default-profile',
      name: 'Kothari Silver Industries Pvt. Ltd.',
      proprietor: 'Rakesh Kothari',
      location: 'Surat, Gujarat',
      gstNumber: '24AABCK1234F1Z5',
      udyamNumber: 'UDYAM-GJ-12-0012345',
      mcxRateBase: 89000.00,
      autoBills: true,
      twoFactorAuth: false,
    },
  });

  // 2. Master Categories
  const categories = [
    { code: 'PYL', name: 'Payal (Anklet)', description: 'Foot ornament' },
    { code: 'KAD', name: 'Kada (Bangle)', description: 'Wrist ornament' },
    { code: 'CHN', name: 'Chain', description: 'Neck & waist chain' },
    { code: 'BCH', name: 'Bichiya (Toe Ring)', description: 'Toe ornament' },
    { code: 'PND', name: 'Pendant', description: 'Neck pendant' },
    { code: 'ANK', name: 'Anklet', description: 'Ankle ornament' },
    { code: 'RAW', name: 'Raw Silver', description: 'Pure 99.9 Bullion & Bars' },
    { code: 'BNG', name: 'Bangle', description: 'Hand ornaments' },
  ];

  for (const cat of categories) {
    await prisma.masterCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
  }

  // 3. Master Purity Standards
  const purities = [
    { code: '999', standard: '99.9% Fine', useCase: 'Raw Silver, Bars', purityPct: 99.90 },
    { code: '925', standard: '92.5% Sterling', useCase: 'Most jewellery', purityPct: 92.50 },
    { code: '800', standard: '80% Standard', useCase: 'Cutlery, utility', purityPct: 80.00 },
    { code: '722', standard: '72.2% Coin', useCase: 'Coin silver', purityPct: 72.20 },
  ];

  for (const pur of purities) {
    await prisma.masterPurity.upsert({
      where: { code: pur.code },
      update: { standard: pur.standard, useCase: pur.useCase, purityPct: pur.purityPct },
      create: pur,
    });
  }

  // 4. Clients
  const clientsData = [
    { clientCode: 'mehta', name: 'Mehta Jewels', city: 'Surat', gstNumber: '24AABCM1234F1Z5', initials: 'MJ', lastActiveDate: '14 Jun', silverOutstanding: 1240.500, inrOutstanding: 234000.00, creditSilverLimit: 2000.000, creditInrLimit: 500000.00 },
    { clientCode: 'rajwadi', name: 'Rajwadi Silver Arts', city: 'Ahmedabad', gstNumber: '24AABCR5678G2Z6', initials: 'RA', lastActiveDate: '13 Jun', silverOutstanding: 880.000, inrOutstanding: 140000.00, creditSilverLimit: 1500.000, creditInrLimit: 300000.00 },
    { clientCode: 'kalyan', name: 'Kalyan Silver House', city: 'Mumbai', gstNumber: '27AABCK9012H3Z7', initials: 'KS', lastActiveDate: '12 Jun', silverOutstanding: 520.000, inrOutstanding: 96000.00, creditSilverLimit: 1000.000, creditInrLimit: 200000.00 },
    { clientCode: 'shree', name: 'Shree Ganesh Ornaments', city: 'Jaipur', gstNumber: '08AABCS3456J4Z8', initials: 'SG', lastActiveDate: '11 Jun', silverOutstanding: 0.000, inrOutstanding: 152000.00, creditSilverLimit: 800.000, creditInrLimit: 400000.00 },
    { clientCode: 'vasupati', name: 'Vasupati Silver', city: 'Delhi', gstNumber: '07AABCV7890K5Z9', initials: 'VS', lastActiveDate: '10 Jun', silverOutstanding: 160.000, inrOutstanding: 64000.00, creditSilverLimit: 500.000, creditInrLimit: 150000.00 },
  ];

  const clientMap = new Map<string, string>();
  for (const c of clientsData) {
    const record = await prisma.client.upsert({
      where: { clientCode: c.clientCode },
      update: c,
      create: c,
    });
    clientMap.set(c.clientCode, record.id);
  }

  // 5. Karigars (Artisans)
  const karigarsData = [
    { karigarCode: 'k1', name: 'Ramesh Soni', skill: 'Filigree · Payal', silverHeld: 142.000, piecesCount: 18, wastagePct: 1.80, wagesPayable: 24500.00, riskLevel: RiskLevel.GREEN },
    { karigarCode: 'k2', name: 'Jignesh Verma', skill: 'Kada · Bangle', silverHeld: 98.000, piecesCount: 12, wastagePct: 2.10, wagesPayable: 18200.00, riskLevel: RiskLevel.GREEN },
    { karigarCode: 'k3', name: 'Mukesh Patel', skill: 'Chain · Rope', silverHeld: 72.000, piecesCount: 9, wastagePct: 2.60, wagesPayable: 15400.00, riskLevel: RiskLevel.AMBER },
    { karigarCode: 'k4', name: 'Suresh Kumar', skill: 'Polishing', silverHeld: 34.000, piecesCount: 24, wastagePct: 0.90, wagesPayable: 9800.00, riskLevel: RiskLevel.GREEN },
    { karigarCode: 'k5', name: 'Dinesh Rana', skill: 'Stone Setting', silverHeld: 28.000, piecesCount: 7, wastagePct: 1.40, wagesPayable: 12300.00, riskLevel: RiskLevel.AMBER },
    { karigarCode: 'k6', name: 'Prakash Joshi', skill: 'Casting · Mould', silverHeld: 56.000, piecesCount: 5, wastagePct: 3.10, wagesPayable: 8600.00, riskLevel: RiskLevel.RED },
  ];

  const karigarMap = new Map<string, string>();
  for (const k of karigarsData) {
    const record = await prisma.karigar.upsert({
      where: { karigarCode: k.karigarCode },
      update: k,
      create: k,
    });
    karigarMap.set(k.karigarCode, record.id);
  }

  // 6. Job Workers (Outsourcing)
  const workersData = [
    { workerCode: 'w1', name: 'Suresh Polishing', specialty: 'Polishing · Buffing', silverHeld: 120.000, activeJobsCount: 2, overdueCount: 0, riskLevel: RiskLevel.GREEN },
    { workerCode: 'w2', name: 'Deepak Casting Unit', specialty: 'Casting · Moulding', silverHeld: 300.000, activeJobsCount: 3, overdueCount: 1, riskLevel: RiskLevel.AMBER },
    { workerCode: 'w3', name: 'Imran Stone Setting', specialty: 'Stone Setting · Kundan', silverHeld: 88.000, activeJobsCount: 2, overdueCount: 2, riskLevel: RiskLevel.RED },
    { workerCode: 'w4', name: 'Bharat Plating Co.', specialty: 'Rhodium · Gold Plating', silverHeld: 56.000, activeJobsCount: 1, overdueCount: 0, riskLevel: RiskLevel.GREEN },
  ];

  const workerMap = new Map<string, string>();
  for (const w of workersData) {
    const record = await prisma.jobWorker.upsert({
      where: { workerCode: w.workerCode },
      update: w,
      create: w,
    });
    workerMap.set(w.workerCode, record.id);
  }

  // 7. Employees
  const employeesData = [
    { name: 'Rakesh Kothari', role: 'Owner · MD', department: 'Management', attendance: AttendanceStatus.PRESENT, monthlySalary: 0.00, joinedYear: '2009', initials: 'RK' },
    { name: 'Sunita Shah', role: 'Accounts Head', department: 'Finance', attendance: AttendanceStatus.PRESENT, monthlySalary: 48000.00, joinedYear: '2014', initials: 'SS' },
    { name: 'Vikram Desai', role: 'Production Manager', department: 'Production', attendance: AttendanceStatus.PRESENT, monthlySalary: 42000.00, joinedYear: '2016', initials: 'VD' },
    { name: 'Ramesh Soni', role: 'Senior Karigar', department: 'Production', attendance: AttendanceStatus.PRESENT, monthlySalary: 38000.00, joinedYear: '2011', initials: 'RS' },
    { name: 'Anita Rao', role: 'Store Keeper', department: 'Warehouse', attendance: AttendanceStatus.LEAVE, monthlySalary: 26000.00, joinedYear: '2018', initials: 'AR' },
    { name: 'Imran Shaikh', role: 'QC Inspector', department: 'Quality', attendance: AttendanceStatus.PRESENT, monthlySalary: 30000.00, joinedYear: '2019', initials: 'IS' },
    { name: 'Deepa Nair', role: 'Sales Executive', department: 'Sales', attendance: AttendanceStatus.PRESENT, monthlySalary: 32000.00, joinedYear: '2020', initials: 'DN' },
    { name: 'Karan Mehta', role: 'Dispatch Clerk', department: 'Logistics', attendance: AttendanceStatus.LEAVE, monthlySalary: 22000.00, joinedYear: '2021', initials: 'KM' },
  ];

  for (const e of employeesData) {
    const exists = await prisma.employee.findFirst({ where: { name: e.name } });
    if (!exists) {
      await prisma.employee.create({ data: e });
    }
  }

  // 8. Orders
  const ordersData = [
    { orderNo: 'ORD-2241', clientCode: 'mehta', productsSummary: 'Payal, Bichiya', grossWeight: 1240.500, fineWeight: 1147.463, status: OrderStatus.PRODUCTION, dueDate: '18 Jun', progressPct: 62, rateLocked: 88900.00, silverOutstanding: 1240.500, inrOutstanding: 234000.00 },
    { orderNo: 'ORD-2240', clientCode: 'rajwadi', productsSummary: 'Kada, Bangle', grossWeight: 880.000, fineWeight: 814.000, status: OrderStatus.QC, dueDate: '16 Jun', progressPct: 88, rateLocked: 88900.00, silverOutstanding: 880.000, inrOutstanding: 0.00 },
    { orderNo: 'ORD-2239', clientCode: 'kalyan', productsSummary: 'Chain Roll', grossWeight: 520.000, fineWeight: 519.480, status: OrderStatus.OVERDUE, dueDate: '12 Jun', progressPct: 45, rateLocked: 88900.00, silverOutstanding: 520.000, inrOutstanding: 96000.00 },
    { orderNo: 'ORD-2238', clientCode: 'shree', productsSummary: 'Anklet, Ring', grossWeight: 640.000, fineWeight: 592.000, status: OrderStatus.DISPATCHED, dueDate: '15 Jun', progressPct: 100, rateLocked: 88900.00, silverOutstanding: 0.000, inrOutstanding: 152000.00 },
    { orderNo: 'ORD-2237', clientCode: 'vasupati', productsSummary: 'Kundan Set, Chain', grossWeight: 420.000, fineWeight: 388.500, status: OrderStatus.PRODUCTION, dueDate: '20 Jun', progressPct: 38, rateLocked: 88900.00, silverOutstanding: 420.000, inrOutstanding: 0.00 },
    { orderNo: 'ORD-2236', clientCode: 'mehta', productsSummary: 'Payal', grossWeight: 380.000, fineWeight: 351.500, status: OrderStatus.HOLD, dueDate: '22 Jun', progressPct: 20, rateLocked: 88900.00, silverOutstanding: 380.000, inrOutstanding: 0.00 },
    { orderNo: 'ORD-2235', clientCode: 'rajwadi', productsSummary: 'Toe Ring, Pendant', grossWeight: 300.000, fineWeight: 277.500, status: OrderStatus.PRODUCTION, dueDate: '19 Jun', progressPct: 55, rateLocked: 88900.00, silverOutstanding: 300.000, inrOutstanding: 0.00 },
    { orderNo: 'ORD-2234', clientCode: 'kalyan', productsSummary: 'Bangle', grossWeight: 220.000, fineWeight: 203.500, status: OrderStatus.COMPLETED, dueDate: '14 Jun', progressPct: 100, rateLocked: 88900.00, silverOutstanding: 0.000, inrOutstanding: 0.00 },
    { orderNo: 'ORD-2233', clientCode: 'shree', productsSummary: 'Chain, Pendant', grossWeight: 180.000, fineWeight: 166.500, status: OrderStatus.COMPLETED, dueDate: '10 Jun', progressPct: 100, rateLocked: 88900.00, silverOutstanding: 0.000, inrOutstanding: 0.00 },
    { orderNo: 'ORD-2232', clientCode: 'vasupati', productsSummary: 'Payal', grossWeight: 160.000, fineWeight: 148.000, status: OrderStatus.OVERDUE, dueDate: '08 Jun', progressPct: 70, rateLocked: 88900.00, silverOutstanding: 160.000, inrOutstanding: 64000.00 },
    { orderNo: 'ORD-2198', clientCode: 'mehta', productsSummary: 'Payal, Anklet', grossWeight: 500.000, fineWeight: 462.500, status: OrderStatus.DISPATCHED, dueDate: '13 Jun', progressPct: 100, rateLocked: 88900.00, silverOutstanding: 0.000, inrOutstanding: 0.00 },
  ];

  const orderMap = new Map<string, string>();
  for (const o of ordersData) {
    const clientId = clientMap.get(o.clientCode);
    if (!clientId) continue;

    const record = await prisma.order.upsert({
      where: { orderNo: o.orderNo },
      update: {
        clientId,
        productsSummary: o.productsSummary,
        grossWeight: o.grossWeight,
        fineWeight: o.fineWeight,
        status: o.status,
        dueDate: o.dueDate,
        progressPct: o.progressPct,
        rateLocked: o.rateLocked,
        silverOutstanding: o.silverOutstanding,
        inrOutstanding: o.inrOutstanding,
      },
      create: {
        orderNo: o.orderNo,
        clientId,
        productsSummary: o.productsSummary,
        grossWeight: o.grossWeight,
        fineWeight: o.fineWeight,
        status: o.status,
        dueDate: o.dueDate,
        progressPct: o.progressPct,
        rateLocked: o.rateLocked,
        silverOutstanding: o.silverOutstanding,
        inrOutstanding: o.inrOutstanding,
      },
    });
    orderMap.set(o.orderNo, record.id);
  }

  // 9. Batches
  const batchesData = [
    { batchId: 'BATCH-551', orderNo: 'ORD-2241', product: 'Payal', weight: 142.000, stage: ProductionStage.FORMING, karigarCode: 'k1', inStageDuration: '2 days', isDelayed: false },
    { batchId: 'BATCH-550', orderNo: 'ORD-2241', product: 'Bichiya', weight: 98.000, stage: ProductionStage.QC, karigarCode: 'k4', inStageDuration: '1 day', isDelayed: false },
    { batchId: 'BATCH-549', orderNo: 'ORD-2240', product: 'Kada', weight: 210.000, stage: ProductionStage.POLISHING, karigarCode: 'k2', inStageDuration: '3 days', isDelayed: false },
    { batchId: 'BATCH-548', orderNo: 'ORD-2237', product: 'Kundan Set', weight: 38.000, stage: ProductionStage.FORMING, karigarCode: 'k5', inStageDuration: '4 days', isDelayed: true },
    { batchId: 'BATCH-547', orderNo: 'ORD-2235', product: 'Toe Ring', weight: 42.000, stage: ProductionStage.CUTTING, karigarCode: 'k4', inStageDuration: '1 day', isDelayed: false },
    { batchId: 'BATCH-546', orderNo: 'ORD-2239', product: 'Chain Roll', weight: 180.000, stage: ProductionStage.ROD_MAKING, karigarCode: 'k3', inStageDuration: '6 days', isDelayed: true },
    { batchId: 'BATCH-545', orderNo: 'ORD-2237', product: 'Chain', weight: 90.000, stage: ProductionStage.MELTING, karigarCode: 'k3', inStageDuration: '1 day', isDelayed: false },
    { batchId: 'BATCH-544', orderNo: 'ORD-2236', product: 'Payal', weight: 120.000, stage: ProductionStage.MELTING, karigarCode: 'k1', inStageDuration: 'just now', isDelayed: false },
    { batchId: 'BATCH-543', orderNo: 'ORD-2235', product: 'Pendant', weight: 60.000, stage: ProductionStage.DISPATCH, karigarCode: 'k4', inStageDuration: '2 days', isDelayed: false },
    { batchId: 'BATCH-540', orderNo: 'ORD-2240', product: 'Bangle', weight: 180.000, stage: ProductionStage.QC, karigarCode: 'k2', inStageDuration: '1 day', isDelayed: false },
  ];

  for (const b of batchesData) {
    const orderId = orderMap.get(b.orderNo);
    const karigarId = karigarMap.get(b.karigarCode);
    if (!orderId) continue;

    await prisma.batch.upsert({
      where: { batchId: b.batchId },
      update: {
        orderId,
        karigarId,
        product: b.product,
        weight: b.weight,
        stage: b.stage,
        inStageDuration: b.inStageDuration,
        isDelayed: b.isDelayed,
      },
      create: {
        batchId: b.batchId,
        orderId,
        karigarId,
        product: b.product,
        weight: b.weight,
        stage: b.stage,
        inStageDuration: b.inStageDuration,
        isDelayed: b.isDelayed,
      },
    });
  }

  // 9b. Outsource Jobs
  const jobsData = [
    { jobId: 'JOB-907', orderNo: 'ORD-2241', workerCode: 'w1', jobType: 'Polishing', weightSent: 120.000, weightReturned: 0, dueDate: '18 Jun', status: OrderStatus.PRODUCTION, labourCost: 6000 },
    { jobId: 'JOB-903', orderNo: 'ORD-2235', workerCode: 'w1', jobType: 'Finishing', weightSent: 60.000, weightReturned: 58.000, dueDate: '19 Jun', status: OrderStatus.PARTIAL, labourCost: 3000 },
    { jobId: 'JOB-900', orderNo: 'ORD-2240', workerCode: 'w1', jobType: 'Polishing', weightSent: 40.000, weightReturned: 40.000, dueDate: '16 Jun', status: OrderStatus.RETURNED, labourCost: 2000 },
    { jobId: 'JOB-896', orderNo: 'ORD-2238', workerCode: 'w1', jobType: 'Buffing', weightSent: 30.000, weightReturned: 30.000, dueDate: '15 Jun', status: OrderStatus.RETURNED, labourCost: 1500 },
    { jobId: 'JOB-901', orderNo: 'ORD-2241', workerCode: 'w2', jobType: 'Casting', weightSent: 300.000, weightReturned: 0, dueDate: '15 Jun', status: OrderStatus.OVERDUE, labourCost: 18000 },
    { jobId: 'JOB-898', orderNo: 'ORD-2235', workerCode: 'w2', jobType: 'Casting', weightSent: 120.000, weightReturned: 115.000, dueDate: '19 Jun', status: OrderStatus.PARTIAL, labourCost: 7200 },
    { jobId: 'JOB-895', orderNo: 'ORD-2240', workerCode: 'w2', jobType: 'Moulding', weightSent: 200.000, weightReturned: 200.000, dueDate: '15 Jun', status: OrderStatus.RETURNED, labourCost: 9000 },
    { jobId: 'JOB-892', orderNo: 'ORD-2239', workerCode: 'w2', jobType: 'Casting', weightSent: 280.000, weightReturned: 0, dueDate: '17 Jun', status: OrderStatus.PRODUCTION, labourCost: 16800 },
    { jobId: 'JOB-889', orderNo: 'ORD-2237', workerCode: 'w2', jobType: 'Moulding', weightSent: 150.000, weightReturned: 148.000, dueDate: '18 Jun', status: OrderStatus.PARTIAL, labourCost: 6750 },
    { jobId: 'JOB-905', orderNo: 'ORD-2241', workerCode: 'w3', jobType: 'Stone Setting', weightSent: 50.000, weightReturned: 0, dueDate: '11 Jun', status: OrderStatus.OVERDUE, labourCost: 12000 },
    { jobId: 'JOB-902', orderNo: 'ORD-2237', workerCode: 'w3', jobType: 'Kundan Work', weightSent: 38.000, weightReturned: 0, dueDate: '12 Jun', status: OrderStatus.OVERDUE, labourCost: 9500 },
    { jobId: 'JOB-897', orderNo: 'ORD-2240', workerCode: 'w3', jobType: 'Stone Setting', weightSent: 40.000, weightReturned: 40.000, dueDate: '16 Jun', status: OrderStatus.RETURNED, labourCost: 8000 },
    { jobId: 'JOB-906', orderNo: 'ORD-2238', workerCode: 'w4', jobType: 'Rhodium Plating', weightSent: 56.000, weightReturned: 0, dueDate: '18 Jun', status: OrderStatus.PRODUCTION, labourCost: 4200 },
    { jobId: 'JOB-899', orderNo: 'ORD-2240', workerCode: 'w4', jobType: 'Plating', weightSent: 40.000, weightReturned: 40.000, dueDate: '16 Jun', status: OrderStatus.RETURNED, labourCost: 3000 },
  ];

  for (const j of jobsData) {
    const orderId = orderMap.get(j.orderNo);
    const workerId = workerMap.get(j.workerCode);
    if (!orderId || !workerId) continue;

    await prisma.outsourceJob.upsert({
      where: { jobId: j.jobId },
      update: {
        orderId,
        workerId,
        jobType: j.jobType,
        weightSent: j.weightSent,
        weightReturned: j.weightReturned,
        dueDate: j.dueDate,
        status: j.status,
        labourCost: j.labourCost,
      },
      create: {
        jobId: j.jobId,
        orderId,
        workerId,
        jobType: j.jobType,
        weightSent: j.weightSent,
        weightReturned: j.weightReturned,
        dueDate: j.dueDate,
        status: j.status,
        labourCost: j.labourCost,
      },
    });
  }

  // 10. Silver Locations
  const silverLocationsData = [
    { locationType: LocationType.FACTORY_VAULT, partyOrVault: 'Vault A', amountHeld: 1240.500, holdingSince: '14 Jun', agingDays: 0 },
    { locationType: LocationType.FACTORY_VAULT, partyOrVault: 'Vault B', amountHeld: 520.000, holdingSince: '14 Jun', agingDays: 0 },
    { locationType: LocationType.KARIGAR, partyOrVault: 'Ramesh Soni', amountHeld: 142.000, holdingSince: '14 Jun', agingDays: 1 },
    { locationType: LocationType.KARIGAR, partyOrVault: 'Jignesh Verma', amountHeld: 98.000, holdingSince: '11 Jun', agingDays: 4 },
    { locationType: LocationType.KARIGAR, partyOrVault: 'Mukesh Patel', amountHeld: 72.000, holdingSince: '08 Jun', agingDays: 7 },
    { locationType: LocationType.JOB_WORKER, partyOrVault: 'Deepak Casting Unit', amountHeld: 300.000, holdingSince: '05 Jun', agingDays: 10 },
    { locationType: LocationType.JOB_WORKER, partyOrVault: 'Imran Stone Setting', amountHeld: 88.000, holdingSince: '30 May', agingDays: 16 },
    { locationType: LocationType.JOB_WORKER, partyOrVault: 'Bharat Plating Co.', amountHeld: 40.000, holdingSince: '15 May', agingDays: 31 },
    { locationType: LocationType.CLIENT_DISPATCHED, partyOrVault: 'Shree Ganesh Orn.', amountHeld: 127.500, holdingSince: '13 Jun', agingDays: 2 },
  ];

  await prisma.silverLocation.deleteMany();
  for (const loc of silverLocationsData) {
    await prisma.silverLocation.create({ data: loc });
  }

  // 11. Inventory Items
  const catMap = new Map<string, string>();
  const allCats = await prisma.masterCategory.findMany();
  allCats.forEach(c => catMap.set(c.code, c.id));

  const purMap = new Map<string, string>();
  const allPurs = await prisma.masterPurity.findMany();
  allPurs.forEach(p => purMap.set(p.code, p.id));

  const inventoryData = [
    { sku: 'PYL-925-018', catCode: 'PYL', purCode: '925', pieces: 18, gross: 1240.500, fine: 1147.463, loc: 'Vault A', status: InventoryStatus.IN_STOCK },
    { sku: 'KAD-925-012', catCode: 'KAD', purCode: '925', pieces: 12, gross: 880.000, fine: 814.000, loc: 'Vault A', status: InventoryStatus.IN_STOCK },
    { sku: 'CHN-999-040', catCode: 'CHN', purCode: '999', pieces: 40, gross: 520.000, fine: 519.480, loc: 'Vault B', status: InventoryStatus.LOW },
    { sku: 'ANK-925-008', catCode: 'ANK', purCode: '925', pieces: 8, gross: 640.000, fine: 592.000, loc: 'Display', status: InventoryStatus.IN_STOCK },
    { sku: 'PND-925-024', catCode: 'PND', purCode: '925', pieces: 24, gross: 420.000, fine: 388.500, loc: 'Vault B', status: InventoryStatus.IN_STOCK },
    { sku: 'RAW-999-BAR', catCode: 'RAW', purCode: '999', pieces: 1, gross: 2100.000, fine: 2097.900, loc: 'Vault A', status: InventoryStatus.REORDER },
    { sku: 'TOE-925-050', catCode: 'BCH', purCode: '925', pieces: 50, gross: 380.000, fine: 351.500, loc: 'Display', status: InventoryStatus.LOW },
    { sku: 'BNG-925-020', catCode: 'BNG', purCode: '925', pieces: 20, gross: 1180.000, fine: 1091.500, loc: 'Vault A', status: InventoryStatus.IN_STOCK },
  ];

  for (const inv of inventoryData) {
    const categoryId = catMap.get(inv.catCode);
    const purityId = purMap.get(inv.purCode);
    if (!categoryId || !purityId) continue;

    await prisma.inventoryItem.upsert({
      where: { sku: inv.sku },
      update: {
        categoryId,
        purityId,
        pieces: inv.pieces,
        grossWeight: inv.gross,
        fineWeight: inv.fine,
        location: inv.loc,
        status: inv.status,
      },
      create: {
        sku: inv.sku,
        categoryId,
        purityId,
        pieces: inv.pieces,
        grossWeight: inv.gross,
        fineWeight: inv.fine,
        location: inv.loc,
        status: inv.status,
      },
    });
  }

  // 12. Material Movements
  const movementsData = [
    { dateDisplay: '14 Jun · 12:18', movementType: MovementType.RECEIPT, fromLocation: 'Mehta Jewels', toLocation: 'Vault A', referenceNo: 'ORD-2241', fineWeight: 450.000, createdByName: 'R. Kothari' },
    { dateDisplay: '14 Jun · 11:40', movementType: MovementType.ISSUE, fromLocation: 'Vault A', toLocation: 'Ramesh Soni', referenceNo: 'BATCH-551', fineWeight: 142.000, createdByName: 'Store' },
    { dateDisplay: '14 Jun · 10:05', movementType: MovementType.TRANSFER, fromLocation: 'Vault A', toLocation: 'Vault B', referenceNo: 'TRF-220', fineWeight: 520.000, createdByName: 'Store' },
    { dateDisplay: '13 Jun · 17:30', movementType: MovementType.RETURN, fromLocation: 'Deepak Casting', toLocation: 'Vault A', referenceNo: 'JOB-895', fineWeight: 200.000, createdByName: 'Store' },
    { dateDisplay: '13 Jun · 14:10', movementType: MovementType.ISSUE, fromLocation: 'Vault A', toLocation: 'Suresh Kumar', referenceNo: 'BATCH-547', fineWeight: 180.000, createdByName: 'Store' },
    { dateDisplay: '12 Jun · 16:20', movementType: MovementType.DISPATCH, fromLocation: 'Vault B', toLocation: 'Kalyan Silver', referenceNo: 'ORD-2238', fineWeight: 320.000, createdByName: 'Dispatch' },
    { dateDisplay: '12 Jun · 09:15', movementType: MovementType.RECEIPT, fromLocation: 'Rajwadi Arts', toLocation: 'Vault A', referenceNo: 'ORD-2234', fineWeight: 380.000, createdByName: 'R. Kothari' },
    { dateDisplay: '11 Jun · 15:50', movementType: MovementType.ISSUE, fromLocation: 'Vault A', toLocation: 'Deepak Casting', referenceNo: 'JOB-879', fineWeight: 300.000, createdByName: 'Store' },
  ];

  await prisma.materialMovement.deleteMany();
  for (const m of movementsData) {
    await prisma.materialMovement.create({ data: m });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
