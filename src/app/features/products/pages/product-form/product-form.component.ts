import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../shared/models/product.model';

export interface ProductDialogData {
  mode: 'create' | 'edit';
  product?: Product;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<ProductFormComponent>);
  
  productForm!: FormGroup;
  categories = ['Food & Beverages', 'Clothing', 'Perfumes & Cosmetics', 'Home & Kitchen', 'Home & Decor', 'Electronics', 'Books & Media', 'Health & Beauty', 'Sports & Outdoors', 'Other'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: ProductDialogData) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: [this.data.product?.name || '', [Validators.required, Validators.minLength(3)]],
      description: [this.data.product?.description || '', [Validators.required, Validators.minLength(10)]],
      price: [this.data.product?.price || '', [Validators.required, Validators.min(0.01)]],
      sku: [this.data.product?.sku || '', [Validators.required]],
      category: [this.data.product?.category || '', [Validators.required]],
      stock: [this.data.product?.stock || 0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const productData: Product = this.productForm.value;

    if (this.data.mode === 'create') {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Failed to create product', 'Close', { duration: 3000 });
        }
      });
    } else if (this.data.product?.id) {
      this.productService.updateProduct(this.data.product.id, productData).subscribe({
        next: () => {
          this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Failed to update product', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }
}
