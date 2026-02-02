export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  stock: number;
  createdAt?: string;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt?: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}
