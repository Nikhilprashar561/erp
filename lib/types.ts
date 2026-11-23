export type OrderStatus = 'production' | 'overdue' | 'qc' | 'dispatched' | 'hold' | 'completed' | 'returned' | 'partial';

export interface Order {
  no: string;
  clientId: string;
  client: string;
  products: string;
  gross: number;
  fine: number;
  status: OrderStatus;
  due: string;
  prog: number;
  outS: number;
  outI: number;
  city?: string;
}

export interface Client {
  id: string;
  name: string;
  city: string;
  gst: string;
  init: string;
  last: string;
  silverOut: number;
  inrOut: number;
  credS: number;
  credI: number;
}

export interface Batch {
  bid: string;
  ref: string;
  client: string;
  product: string;
  wt: number;
  stage: string;
  karigar: string;
  inStage: string;
  delay: boolean;
}

export interface Worker {
  id: string;
  name: string;
  spec: string;
  held: number;
  active: number;
  overdue: number;
  risk: 'green' | 'amber' | 'red';
}

export interface LedgerEntry {
  date: string;
  type: string;
  party: string;
  ref: string;
  sIn: number;
  sOut: number;
  iIn: number;
  iOut: number;
  note: string;
}

export interface SilverLocation {
  type: string;
  party: string;
  amt: number;
  since: string;
  aging: number;
}

export interface Karigar {
  id: string;
  name: string;
  skill: string;
  held: number;
  pieces: number;
  wastage: number;
  payable: number;
  risk: 'green' | 'amber' | 'red';
}

export interface KarigarPiece {
  pid: string;
  ref: string;
  product: string;
  issued: number;
  exp: number;
  due: string;
  status: OrderStatus;
}

export interface InventoryItem {
  sku: string;
  cat: string;
  purity: string;
  pieces: number;
  gross: number;
  fine: number;
  loc: string;
  status: 'in' | 'low' | 'reorder';
}

export interface Movement {
  date: string;
  type: string;
  from: string;
  to: string;
  ref: string;
  wt: number;
  by: string;
}

export interface Employee {
  name: string;
  role: string;
  dept: string;
  att: 'present' | 'leave';
  salary: number;
  joined: string;
  init: string;
}

export interface Receivable {
  client: string;
  cur: number;
  d30: number;
  d60: number;
  d90: number;
  total: number;
}

export interface Expense {
  cat: string;
  amt: number;
  pct: number;
}

export interface Job {
  jid: string;
  ref: string;
  jtype: string;
  sent: number;
  ret: number;
  due: string;
  status: OrderStatus;
  labour: number;
}

export interface StatusMeta {
  label: string;
  bg: string;
  fg: string;
  pulse: boolean;
}
