import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { ProductService } from '../../../../core/services/product.service';
import { Product, Invoice, InvoiceItem } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './invoice-create.component.html',
  styleUrl: './invoice-create.component.scss'
})
export class InvoiceCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private invoiceService = inject(InvoiceService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  invoiceForm!: FormGroup;
  products = signal<Product[]>([]);
  displayedColumns: string[] = ['product', 'quantity', 'price', 'total', 'actions'];

  ngOnInit(): void {
    this.loadProducts();
    this.initForm();
  }

  initForm(): void {
    this.invoiceForm = this.fb.group({
      customerName: ['', [Validators.required]],
      customerEmail: ['', [Validators.required, Validators.email]],
      items: this.fb.array([])
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
      },
      error: () => {
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
      }
    });
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem(): void {
    const itemForm = this.fb.group({
      productId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });

    this.items.push(itemForm);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  getProduct(productId: string): Product | undefined {
    return this.products().find(p => p.id === productId);
  }

  getItemTotal(index: number): number {
    const item = this.items.at(index);
    const productId = item.get('productId')?.value;
    const quantity = item.get('quantity')?.value || 0;
    const product = this.getProduct(productId);
    return product ? product.price * quantity : 0;
  }

  getSubtotal(): number {
    let subtotal = 0;
    for (let i = 0; i < this.items.length; i++) {
      subtotal += this.getItemTotal(i);
    }
    return subtotal;
  }

  getTax(): number {
    return this.getSubtotal() * 0.15; // 15% VAT (Saudi Arabia)
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax();
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid || this.items.length === 0) {
      this.invoiceForm.markAllAsTouched();
      if (this.items.length === 0) {
        this.snackBar.open('Please add at least one item', 'Close', { duration: 3000 });
      }
      return;
    }

    const invoiceItems: InvoiceItem[] = this.items.value.map((item: any) => {
      const product = this.getProduct(item.productId)!;
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        total: product.price * item.quantity
      };
    });

    const invoice: Invoice = {
      invoiceNumber: this.invoiceService.generateInvoiceNumber(),
      customerName: this.invoiceForm.value.customerName,
      customerEmail: this.invoiceForm.value.customerEmail,
      items: invoiceItems,
      subtotal: this.getSubtotal(),
      tax: this.getTax(),
      total: this.getTotal(),
      status: 'pending'
    };

    this.invoiceService.createInvoice(invoice).subscribe({
      next: () => {
        this.snackBar.open('Invoice created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/invoices']);
      },
      error: () => {
        this.snackBar.open('Failed to create invoice', 'Close', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/invoices']);
  }
}
