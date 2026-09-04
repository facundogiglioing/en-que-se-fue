export type CategoryName =
  | "Servicios"
  | "Entretenimiento"
  | "Salidas"
  | "Supermercado"
  | "Transporte"
  | "Salud"
  | "Educación"
  | "Otros";

export interface Expense {
  id: string;
  name: string;
  category: CategoryName;
  dueDate: number;
  estimatedAmount?: number;
  electronicPaymentCode?: string;
}

export interface Payment {
  id: string;
  expenseId: string;
  month: number;
  year: number;
  isPaid: boolean;
  paidAt?: string;
  actualAmount?: number;
}

export interface CardPayment {
  id: string;
  cardId: string;
  month: number;
  year: number;
  isPaid: boolean;
  paidAt?: string;
  actualAmount?: number;
}

export interface Income {
  id: string;
  name: string;
  category: "Sueldo" | "Inversión" | "Extra" | "Otros";
  expectedAmount: number;
  expectedDay: number;
}

export interface IncomeReceipt {
  id: string;
  incomeId: string;
  month: number;
  year: number;
  isReceived: boolean;
  receivedAt?: string;
}

export interface CreditCard {
  id: string;
  name: string; // Ej: Visa Santander
  bank: string;
  closingDay: number; // Día que cierra la tarjeta
  dueDay: number; // Día que vence el resumen
  order: number; // Orden de visualización en el carrusel
  last4Digits: string; // Últimos 4 dígitos de la tarjeta
  paysInArrears?: boolean; // Si el resumen se paga al mes siguiente del consumo
}

export interface Transaction {
  id: string;
  cardId: string;
  description: string;
  totalAmount: number;
  installments: number;
  startMonth: number;
  startYear: number;
  category: CategoryName;
  isRecurring?: boolean;
}

// Actualizamos el Schema Global
export interface DbSchema {
  expenses: Expense[];
  payments: Payment[];
  incomes: Income[];
  incomeReceipts: IncomeReceipt[];
  creditCards: CreditCard[];
  transactions: Transaction[];
  cardPayments: CardPayment[];
}

// --- Resúmenes de tarjeta importados desde PDF ---

export interface StatementSummary {
  bank: string;
  ownerName: string;
  closingDate?: string; // ISO (AAAA-MM-DD) - Fecha de cierre
  dueDate?: string; // ISO - Fecha de vencimiento
  nextClosingDate?: string; // ISO - Fecha próxima de cierre
  nextDueDate?: string; // ISO - Fecha próxima de vencimiento
  totalAmount: number; // Total a pagar (en pesos)
}

export interface StatementMovement {
  date: string; // ISO (AAAA-MM-DD)
  description: string;
  installment?: string; // Ej: "12/12"
  amountArs?: number; // Pesos
  amountUsd?: number; // Dólares (no se utiliza todavía)
}

export interface ParsedStatement {
  bankId: string;
  summary: StatementSummary;
  movements: StatementMovement[];
}
