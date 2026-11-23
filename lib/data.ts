import type { Order, Client, Batch, Worker, LedgerEntry, SilverLocation, Karigar, KarigarPiece, InventoryItem, Movement, Employee, Receivable, Expense, Job } from './types';

export const orders: Order[] = [
  { no: 'ORD-2241', clientId: 'mehta', client: 'Mehta Jewels', products: 'Payal, Bichiya', gross: 1240.500, fine: 1147.463, status: 'production', due: '18 Jun', prog: 62, outS: 1240.500, outI: 234000 },
  { no: 'ORD-2240', clientId: 'rajwadi', client: 'Rajwadi Silver Arts', products: 'Kada, Bangle', gross: 880.000, fine: 814.000, status: 'qc', due: '16 Jun', prog: 88, outS: 880.000, outI: 0 },
  { no: 'ORD-2239', clientId: 'kalyan', client: 'Kalyan Silver House', products: 'Chain Roll', gross: 520.000, fine: 519.480, status: 'overdue', due: '12 Jun', prog: 45, outS: 520.000, outI: 96000 },
  { no: 'ORD-2238', clientId: 'shree', client: 'Shree Ganesh Ornaments', products: 'Anklet, Ring', gross: 640.000, fine: 592.000, status: 'dispatched', due: '15 Jun', prog: 100, outS: 0, outI: 152000 },
  { no: 'ORD-2237', clientId: 'vasupati', client: 'Vasupati Silver', products: 'Kundan Set, Chain', gross: 420.000, fine: 388.500, status: 'production', due: '20 Jun', prog: 38, outS: 420.000, outI: 0 },
  { no: 'ORD-2236', clientId: 'mehta', client: 'Mehta Jewels', products: 'Payal', gross: 380.000, fine: 351.500, status: 'hold', due: '22 Jun', prog: 20, outS: 380.000, outI: 0 },
  { no: 'ORD-2235', clientId: 'rajwadi', client: 'Rajwadi Silver Arts', products: 'Toe Ring, Pendant', gross: 300.000, fine: 277.500, status: 'production', due: '19 Jun', prog: 55, outS: 300.000, outI: 0 },
  { no: 'ORD-2234', clientId: 'kalyan', client: 'Kalyan Silver House', products: 'Bangle', gross: 220.000, fine: 203.500, status: 'completed', due: '14 Jun', prog: 100, outS: 0, outI: 0 },
  { no: 'ORD-2233', clientId: 'shree', client: 'Shree Ganesh Ornaments', products: 'Chain, Pendant', gross: 180.000, fine: 166.500, status: 'completed', due: '10 Jun', prog: 100, outS: 0, outI: 0 },
  { no: 'ORD-2232', clientId: 'vasupati', client: 'Vasupati Silver', products: 'Payal', gross: 160.000, fine: 148.000, status: 'overdue', due: '08 Jun', prog: 70, outS: 160.000, outI: 64000 },
  { no: 'ORD-2198', clientId: 'mehta', client: 'Mehta Jewels', products: 'Payal, Anklet', gross: 500.000, fine: 462.500, status: 'dispatched', due: '13 Jun', prog: 100, outS: 0, outI: 0 },
];

export const clients: Client[] = [
  { id: 'mehta', name: 'Mehta Jewels', city: 'Surat', gst: '24AABCM1234F1Z5', init: 'MJ', last: '14 Jun', silverOut: 1240.500, inrOut: 234000, credS: 2000, credI: 500000 },
  { id: 'rajwadi', name: 'Rajwadi Silver Arts', city: 'Ahmedabad', gst: '24AABCR5678G2Z6', init: 'RA', last: '13 Jun', silverOut: 880.000, inrOut: 140000, credS: 1500, credI: 300000 },
  { id: 'kalyan', name: 'Kalyan Silver House', city: 'Mumbai', gst: '27AABCK9012H3Z7', init: 'KS', last: '12 Jun', silverOut: 520.000, inrOut: 96000, credS: 1000, credI: 200000 },
  { id: 'shree', name: 'Shree Ganesh Ornaments', city: 'Jaipur', gst: '08AABCS3456J4Z8', init: 'SG', last: '11 Jun', silverOut: 0, inrOut: 152000, credS: 800, credI: 400000 },
  { id: 'vasupati', name: 'Vasupati Silver', city: 'Delhi', gst: '07AABCV7890K5Z9', init: 'VS', last: '10 Jun', silverOut: 160.000, inrOut: 64000, credS: 500, credI: 150000 },
];

export const batches: Batch[] = [
  { bid: 'BATCH-551', ref: 'ORD-2241', client: 'Mehta Jewels', product: 'Payal', wt: 142.000, stage: 'forming', karigar: 'Ramesh Soni', inStage: '2 days', delay: false },
  { bid: 'BATCH-550', ref: 'ORD-2241', client: 'Mehta Jewels', product: 'Bichiya', wt: 98.000, stage: 'qc', karigar: 'Suresh Kumar', inStage: '1 day', delay: false },
  { bid: 'BATCH-549', ref: 'ORD-2240', client: 'Rajwadi Arts', product: 'Kada', wt: 210.000, stage: 'polishing', karigar: 'Jignesh Verma', inStage: '3 days', delay: false },
  { bid: 'BATCH-548', ref: 'ORD-2237', client: 'Vasupati Silver', product: 'Kundan Set', wt: 38.000, stage: 'forming', karigar: 'Dinesh Rana', inStage: '4 days', delay: true },
  { bid: 'BATCH-547', ref: 'ORD-2235', client: 'Rajwadi Arts', product: 'Toe Ring', wt: 42.000, stage: 'cutting', karigar: 'Suresh Kumar', inStage: '1 day', delay: false },
  { bid: 'BATCH-546', ref: 'ORD-2239', client: 'Kalyan Silver', product: 'Chain Roll', wt: 180.000, stage: 'rodmaking', karigar: 'Mukesh Patel', inStage: '6 days', delay: true },
  { bid: 'BATCH-545', ref: 'ORD-2237', client: 'Vasupati Silver', product: 'Chain', wt: 90.000, stage: 'melting', karigar: 'Mukesh Patel', inStage: '1 day', delay: false },
  { bid: 'BATCH-544', ref: 'ORD-2236', client: 'Mehta Jewels', product: 'Payal', wt: 120.000, stage: 'melting', karigar: 'Ramesh Soni', inStage: 'just now', delay: false },
  { bid: 'BATCH-543', ref: 'ORD-2235', client: 'Rajwadi Arts', product: 'Pendant', wt: 60.000, stage: 'dispatch', karigar: 'Suresh Kumar', inStage: '2 days', delay: false },
  { bid: 'BATCH-540', ref: 'ORD-2240', client: 'Rajwadi Arts', product: 'Bangle', wt: 180.000, stage: 'qc', karigar: 'Jignesh Verma', inStage: '1 day', delay: false },
];

export const workers: Worker[] = [
  { id: 'w1', name: 'Suresh Polishing', spec: 'Polishing · Buffing', held: 120.000, active: 2, overdue: 0, risk: 'green' },
  { id: 'w2', name: 'Deepak Casting Unit', spec: 'Casting · Moulding', held: 300.000, active: 3, overdue: 1, risk: 'amber' },
  { id: 'w3', name: 'Imran Stone Setting', spec: 'Stone Setting · Kundan', held: 88.000, active: 2, overdue: 2, risk: 'red' },
  { id: 'w4', name: 'Bharat Plating Co.', spec: 'Rhodium · Gold Plating', held: 56.000, active: 1, overdue: 0, risk: 'green' },
];

export const jobsByWorker: Record<string, Job[]> = {
  w1: [
    { jid: 'JOB-907', ref: 'ORD-2241', jtype: 'Polishing', sent: 120.000, ret: 0, due: '18 Jun', status: 'production', labour: 6000 },
    { jid: 'JOB-903', ref: 'ORD-2235', jtype: 'Finishing', sent: 60.000, ret: 58.000, due: '19 Jun', status: 'partial', labour: 3000 },
    { jid: 'JOB-900', ref: 'ORD-2240', jtype: 'Polishing', sent: 40.000, ret: 40.000, due: '16 Jun', status: 'returned', labour: 2000 },
    { jid: 'JOB-896', ref: 'ORD-2238', jtype: 'Buffing', sent: 30.000, ret: 30.000, due: '15 Jun', status: 'returned', labour: 1500 },
  ],
  w2: [
    { jid: 'JOB-901', ref: 'ORD-2241', jtype: 'Casting', sent: 300.000, ret: 0, due: '15 Jun', status: 'overdue', labour: 18000 },
    { jid: 'JOB-898', ref: 'ORD-2235', jtype: 'Casting', sent: 120.000, ret: 115.000, due: '19 Jun', status: 'partial', labour: 7200 },
    { jid: 'JOB-895', ref: 'ORD-2240', jtype: 'Moulding', sent: 200.000, ret: 200.000, due: '15 Jun', status: 'returned', labour: 9000 },
    { jid: 'JOB-892', ref: 'ORD-2239', jtype: 'Casting', sent: 280.000, ret: 0, due: '17 Jun', status: 'production', labour: 16800 },
    { jid: 'JOB-889', ref: 'ORD-2237', jtype: 'Moulding', sent: 150.000, ret: 148.000, due: '18 Jun', status: 'partial', labour: 6750 },
  ],
  w3: [
    { jid: 'JOB-905', ref: 'ORD-2241', jtype: 'Stone Setting', sent: 50.000, ret: 0, due: '11 Jun', status: 'overdue', labour: 12000 },
    { jid: 'JOB-902', ref: 'ORD-2237', jtype: 'Kundan Work', sent: 38.000, ret: 0, due: '12 Jun', status: 'overdue', labour: 9500 },
    { jid: 'JOB-897', ref: 'ORD-2240', jtype: 'Stone Setting', sent: 40.000, ret: 40.000, due: '16 Jun', status: 'returned', labour: 8000 },
  ],
  w4: [
    { jid: 'JOB-906', ref: 'ORD-2238', jtype: 'Rhodium Plating', sent: 56.000, ret: 0, due: '18 Jun', status: 'production', labour: 4200 },
    { jid: 'JOB-899', ref: 'ORD-2240', jtype: 'Plating', sent: 40.000, ret: 40.000, due: '16 Jun', status: 'returned', labour: 3000 },
  ],
};

export const ledger: LedgerEntry[] = [
  { date: '01 Jun 25', type: 'Opening', party: 'System', ref: '', sIn: 800.000, sOut: 0, iIn: 0, iOut: 0, note: 'Opening balance' },
  { date: '02 Jun 25', type: 'Silver Rcvd', party: 'Mehta Jewels', ref: 'ORD-2198', sIn: 500.000, sOut: 0, iIn: 0, iOut: 0, note: 'Against ORD-2198' },
  { date: '03 Jun 25', type: 'Silver Issue', party: 'Ramesh Soni', ref: 'BATCH-530', sIn: 0, sOut: 142.000, iIn: 0, iOut: 0, note: 'Payal production' },
  { date: '05 Jun 25', type: 'Job Out', party: 'Deepak Casting', ref: 'JOB-879', sIn: 0, sOut: 300.000, iIn: 0, iOut: 0, note: 'Casting batch' },
  { date: '07 Jun 25', type: 'Dispatch', party: 'Rajwadi Arts', ref: 'ORD-2234', sIn: 0, sOut: 220.000, iIn: 0, iOut: 0, note: 'Final dispatch' },
  { date: '08 Jun 25', type: 'Payment', party: 'Rajwadi Arts', ref: 'INV-1185', sIn: 0, sOut: 0, iIn: 180000, iOut: 0, note: 'NEFT payment' },
  { date: '10 Jun 25', type: 'Silver Rcvd', party: 'Rajwadi Arts', ref: 'ORD-2240', sIn: 380.000, sOut: 0, iIn: 0, iOut: 0, note: 'Against ORD-2240' },
  { date: '11 Jun 25', type: 'Payment', party: 'Kalyan Silver', ref: 'INV-1187', sIn: 0, sOut: 0, iIn: 150000, iOut: 0, note: 'NEFT · partial' },
  { date: '12 Jun 25', type: 'Job In', party: 'Deepak Casting', ref: 'JOB-879', sIn: 200.000, sOut: 0, iIn: 0, iOut: 0, note: 'Partial return' },
  { date: '13 Jun 25', type: 'Dispatch', party: 'Mehta Jewels', ref: 'ORD-2198', sIn: 0, sOut: 127.500, iIn: 0, iOut: 0, note: 'Final dispatch' },
  { date: '14 Jun 25', type: 'Silver Rcvd', party: 'Mehta Jewels', ref: 'ORD-2241', sIn: 450.000, sOut: 0, iIn: 0, iOut: 0, note: 'New order receipt' },
];

export const silverLoc: SilverLocation[] = [
  { type: 'Factory', party: 'Vault A', amt: 1240.500, since: '14 Jun', aging: 0 },
  { type: 'Factory', party: 'Vault B', amt: 520.000, since: '14 Jun', aging: 0 },
  { type: 'Karigar', party: 'Ramesh Soni', amt: 142.000, since: '14 Jun', aging: 1 },
  { type: 'Karigar', party: 'Jignesh Verma', amt: 98.000, since: '11 Jun', aging: 4 },
  { type: 'Karigar', party: 'Mukesh Patel', amt: 72.000, since: '08 Jun', aging: 7 },
  { type: 'Job Worker', party: 'Deepak Casting Unit', amt: 300.000, since: '05 Jun', aging: 10 },
  { type: 'Job Worker', party: 'Imran Stone Setting', amt: 88.000, since: '30 May', aging: 16 },
  { type: 'Job Worker', party: 'Bharat Plating Co.', amt: 40.000, since: '15 May', aging: 31 },
  { type: 'Client (Dispatched)', party: 'Shree Ganesh Orn.', amt: 127.500, since: '13 Jun', aging: 2 },
];

export const karigars: Karigar[] = [
  { id: 'k1', name: 'Ramesh Soni', skill: 'Filigree · Payal', held: 142.000, pieces: 18, wastage: 1.8, payable: 24500, risk: 'green' },
  { id: 'k2', name: 'Jignesh Verma', skill: 'Kada · Bangle', held: 98.000, pieces: 12, wastage: 2.1, payable: 18200, risk: 'green' },
  { id: 'k3', name: 'Mukesh Patel', skill: 'Chain · Rope', held: 72.000, pieces: 9, wastage: 2.6, payable: 15400, risk: 'amber' },
  { id: 'k4', name: 'Suresh Kumar', skill: 'Polishing', held: 34.000, pieces: 24, wastage: 0.9, payable: 9800, risk: 'green' },
  { id: 'k5', name: 'Dinesh Rana', skill: 'Stone Setting', held: 28.000, pieces: 7, wastage: 1.4, payable: 12300, risk: 'amber' },
  { id: 'k6', name: 'Prakash Joshi', skill: 'Casting · Mould', held: 56.000, pieces: 5, wastage: 3.1, payable: 8600, risk: 'red' },
];

export const karigarWork: Record<string, KarigarPiece[]> = {
  k1: [
    { pid: 'PC-4410', ref: 'ORD-2241', product: 'Payal', issued: 80.000, exp: 78.500, due: '18 Jun', status: 'production' },
    { pid: 'PC-4405', ref: 'ORD-2235', product: 'Toe Ring', issued: 42.000, exp: 41.200, due: '19 Jun', status: 'production' },
    { pid: 'PC-4398', ref: 'ORD-2240', product: 'Payal B', issued: 20.000, exp: 19.600, due: '16 Jun', status: 'qc' },
  ],
  k2: [
    { pid: 'PC-4412', ref: 'ORD-2234', product: 'Bangle', issued: 60.000, exp: 58.700, due: '17 Jun', status: 'production' },
    { pid: 'PC-4401', ref: 'ORD-2240', product: 'Kada', issued: 38.000, exp: 37.200, due: '16 Jun', status: 'qc' },
  ],
  k3: [
    { pid: 'PC-4408', ref: 'ORD-2239', product: 'Chain Roll', issued: 50.000, exp: 48.700, due: '12 Jun', status: 'overdue' },
    { pid: 'PC-4396', ref: 'ORD-2237', product: 'Rope Chain', issued: 22.000, exp: 21.400, due: '20 Jun', status: 'production' },
  ],
  k4: [
    { pid: 'PC-4415', ref: 'ORD-2241', product: 'Payal · polish', issued: 18.000, exp: 17.900, due: '18 Jun', status: 'production' },
    { pid: 'PC-4409', ref: 'ORD-2238', product: 'Anklet · polish', issued: 16.000, exp: 15.900, due: '15 Jun', status: 'qc' },
  ],
  k5: [{ pid: 'PC-4407', ref: 'ORD-2237', product: 'Kundan Set', issued: 28.000, exp: 27.100, due: '20 Jun', status: 'production' }],
  k6: [{ pid: 'PC-4413', ref: 'ORD-2239', product: 'Cast blanks', issued: 56.000, exp: 54.300, due: '17 Jun', status: 'overdue' }],
};

export const inventory: InventoryItem[] = [
  { sku: 'PYL-925-018', cat: 'Payal', purity: '92.5', pieces: 18, gross: 1240.500, fine: 1147.463, loc: 'Vault A', status: 'in' },
  { sku: 'KAD-925-012', cat: 'Kada', purity: '92.5', pieces: 12, gross: 880.000, fine: 814.000, loc: 'Vault A', status: 'in' },
  { sku: 'CHN-999-040', cat: 'Chain', purity: '99.9', pieces: 40, gross: 520.000, fine: 519.480, loc: 'Vault B', status: 'low' },
  { sku: 'ANK-925-008', cat: 'Anklet', purity: '92.5', pieces: 8, gross: 640.000, fine: 592.000, loc: 'Display', status: 'in' },
  { sku: 'PND-925-024', cat: 'Pendant', purity: '92.5', pieces: 24, gross: 420.000, fine: 388.500, loc: 'Vault B', status: 'in' },
  { sku: 'RAW-999-BAR', cat: 'Raw Silver', purity: '99.9', pieces: 1, gross: 2100.000, fine: 2097.900, loc: 'Vault A', status: 'reorder' },
  { sku: 'TOE-925-050', cat: 'Toe Ring', purity: '92.5', pieces: 50, gross: 380.000, fine: 351.500, loc: 'Display', status: 'low' },
  { sku: 'BNG-925-020', cat: 'Bangle', purity: '92.5', pieces: 20, gross: 1180.000, fine: 1091.500, loc: 'Vault A', status: 'in' },
];

export const movements: Movement[] = [
  { date: '14 Jun · 12:18', type: 'Receipt', from: 'Mehta Jewels', to: 'Vault A', ref: 'ORD-2241', wt: 450.000, by: 'R. Kothari' },
  { date: '14 Jun · 11:40', type: 'Issue', from: 'Vault A', to: 'Ramesh Soni', ref: 'BATCH-551', wt: 142.000, by: 'Store' },
  { date: '14 Jun · 10:05', type: 'Transfer', from: 'Vault A', to: 'Vault B', ref: 'TRF-220', wt: 520.000, by: 'Store' },
  { date: '13 Jun · 17:30', type: 'Return', from: 'Deepak Casting', to: 'Vault A', ref: 'JOB-895', wt: 200.000, by: 'Store' },
  { date: '13 Jun · 14:10', type: 'Issue', from: 'Vault A', to: 'Suresh Kumar', ref: 'BATCH-547', wt: 180.000, by: 'Store' },
  { date: '12 Jun · 16:20', type: 'Dispatch', from: 'Vault B', to: 'Kalyan Silver', ref: 'ORD-2238', wt: 320.000, by: 'Dispatch' },
  { date: '12 Jun · 09:15', type: 'Receipt', from: 'Rajwadi Arts', to: 'Vault A', ref: 'ORD-2234', wt: 380.000, by: 'R. Kothari' },
  { date: '11 Jun · 15:50', type: 'Issue', from: 'Vault A', to: 'Deepak Casting', ref: 'JOB-879', wt: 300.000, by: 'Store' },
];

export const employees: Employee[] = [
  { name: 'Rakesh Kothari', role: 'Owner · MD', dept: 'Management', att: 'present', salary: 0, joined: '2009', init: 'RK' },
  { name: 'Sunita Shah', role: 'Accounts Head', dept: 'Finance', att: 'present', salary: 48000, joined: '2014', init: 'SS' },
  { name: 'Vikram Desai', role: 'Production Manager', dept: 'Production', att: 'present', salary: 42000, joined: '2016', init: 'VD' },
  { name: 'Ramesh Soni', role: 'Senior Karigar', dept: 'Production', att: 'present', salary: 38000, joined: '2011', init: 'RS' },
  { name: 'Anita Rao', role: 'Store Keeper', dept: 'Warehouse', att: 'leave', salary: 26000, joined: '2018', init: 'AR' },
  { name: 'Imran Shaikh', role: 'QC Inspector', dept: 'Quality', att: 'present', salary: 30000, joined: '2019', init: 'IS' },
  { name: 'Deepa Nair', role: 'Sales Executive', dept: 'Sales', att: 'present', salary: 32000, joined: '2020', init: 'DN' },
  { name: 'Karan Mehta', role: 'Dispatch Clerk', dept: 'Logistics', att: 'leave', salary: 22000, joined: '2021', init: 'KM' },
];

export const receivables: Receivable[] = [
  { client: 'Shree Ganesh Orn.', cur: 120000, d30: 240000, d60: 152000, d90: 0, total: 512000 },
  { client: 'Rajwadi Silver Arts', cur: 140000, d30: 0, d60: 0, d90: 0, total: 140000 },
  { client: 'Kalyan Silver House', cur: 96000, d30: 0, d60: 0, d90: 0, total: 96000 },
  { client: 'Mehta Jewels', cur: 234000, d30: 0, d60: 0, d90: 0, total: 234000 },
  { client: 'Vasupati Silver', cur: 0, d30: 88000, d60: 0, d90: 64000, total: 152000 },
];

export const expenses: Expense[] = [
  { cat: 'Karigar & Labour', amt: 486000, pct: 38 },
  { cat: 'Silver Purchase', amt: 402000, pct: 31 },
  { cat: 'Power & Fuel', amt: 148000, pct: 11 },
  { cat: 'Rent & Facility', amt: 120000, pct: 9 },
  { cat: 'Logistics', amt: 78000, pct: 6 },
  { cat: 'Misc & Admin', amt: 62000, pct: 5 },
];

export const productionStages = [
  { id: 'melting', name: 'Melting' },
  { id: 'rodmaking', name: 'Rod Making' },
  { id: 'cutting', name: 'Cutting' },
  { id: 'forming', name: 'Forming' },
  { id: 'polishing', name: 'Polishing' },
  { id: 'qc', name: 'QC' },
  { id: 'dispatch', name: 'Dispatch' },
];

export const reports = [
  { name: 'Silver Reconciliation', desc: 'In / out / balance across all locations', stat: '1,150.500 g', cat: 'Silver' },
  { name: 'Client Outstanding', desc: 'Receivables by client · silver & INR', stat: '₹ 38.42 L', cat: 'Finance' },
  { name: 'Production Efficiency', desc: 'Stage throughput & bottleneck analysis', stat: '23 batches', cat: 'Operations' },
  { name: 'Outsourcing Ledger', desc: 'Job-worker silver held & wastage', stat: '468.000 g', cat: 'Operations' },
  { name: 'Profit & Loss', desc: 'Monthly revenue, cost & margin', stat: '23.0%', cat: 'Finance' },
  { name: 'GST Summary', desc: 'Output tax, input credit, net payable', stat: '₹ 1.18 L', cat: 'Finance' },
  { name: 'Stock Valuation', desc: 'Inventory value at live silver rate', stat: '₹ 1.02 Cr', cat: 'Silver' },
  { name: 'Karigar Performance', desc: 'Wastage & output per artisan', stat: '1.9% avg', cat: 'People' },
  { name: 'Aging Analysis', desc: 'Silver dwell time by location', stat: '8 flagged', cat: 'Silver' },
];

export const timeline = [
  { time: 'Today · 12:18', type: 'Silver Received', desc: '450.000 g received against ORD-2241', ref: 'ORD-2241', tone: '#4ADE80' },
  { time: 'Today · 11:02', type: 'Invoice Generated', desc: 'INV-1190 raised · ₹ 2,34,000', ref: 'INV-1190', tone: '#60A5FA' },
  { time: 'Yesterday · 16:40', type: 'Dispatch', desc: '127.500 g dispatched · ORD-2198 final', ref: 'ORD-2198', tone: '#C8D0D8' },
  { time: 'Yesterday · 10:15', type: 'QC Passed', desc: 'Batch BATCH-540 cleared QC · 0 rejects', ref: 'BATCH-540', tone: '#4ADE80' },
  { time: '11 Jun · 14:30', type: 'Payment Received', desc: '₹ 1,50,000 received via NEFT', ref: 'PAY-771', tone: '#4ADE80' },
  { time: '10 Jun · 09:50', type: 'Order Created', desc: 'ORD-2241 · Payal, Bichiya · 1,240.500 g', ref: 'ORD-2241', tone: '#C8D0D8' },
  { time: '08 Jun · 17:20', type: 'Note Added', desc: 'Client requested antique finish on next batch', ref: '', tone: '#8A9099' },
];
