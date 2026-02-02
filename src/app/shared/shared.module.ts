import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthFormComponent } from './components/auth-form/auth-form.component';
import { AuthHeaderComponent } from './components/auth-header/auth-header.component';
import { AuthWrapperComponent } from './components/auth-wrapper/auth-wrapper.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { FormFieldComponent } from './components/form-field/form-field.component';
import { HorizontalSeparatorComponent } from './components/horizontal-separator/horizontal-separator.component';
import { IconComponent } from './components/icon/icon.component';
import { OtpInputComponent } from './components/otp-input/otp-input.component';
import { PrimaryButtonComponent } from './components/primary-button/primary-button.component';
import { ResendOtpComponent } from './components/resend-otp/resend-otp.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AuthFormComponent,
    AuthHeaderComponent,
    AuthWrapperComponent,
    BreadcrumbComponent,
    AdminLayoutComponent,
    FormFieldComponent,
    HorizontalSeparatorComponent,
    IconComponent,
    OtpInputComponent,
    PrimaryButtonComponent,
    ResendOtpComponent,
    SidebarComponent
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AuthFormComponent,
    AuthHeaderComponent,
    AuthWrapperComponent,
    BreadcrumbComponent,
    AdminLayoutComponent,
    FormFieldComponent,
    HorizontalSeparatorComponent,
    IconComponent,
    OtpInputComponent,
    PrimaryButtonComponent,
    ResendOtpComponent,
    SidebarComponent
  ]
})
export class SharedModule { }
