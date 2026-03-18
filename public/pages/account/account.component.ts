import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CartItem, OrderHistoryItem } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService, CartDrawerService, CartService, DataService, I18nService } from '../../services';
import { AccountOrderHistoryComponent, AccountProfileSummaryComponent } from '../components';

type AuthMode = 'login' | 'register';
type LoginControlName = 'email' | 'password';
type RegistrationControlName =
  | 'fullName'
  | 'email'
  | 'phone'
  | 'password'
  | 'confirmPassword';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule, AccountProfileSummaryComponent, AccountOrderHistoryComponent, TranslatePipe],
  templateUrl: './account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent {
  readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly cartDrawerService = inject(CartDrawerService);
  private readonly dataService = inject(DataService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  readonly currentUser = this.authService.currentUser;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isAdmin = this.authService.isAdmin;
  readonly authMode = signal<AuthMode>('login');
  readonly authError = signal('');
  readonly isSubmitting = signal(false);
  readonly repeatOrderError = signal('');

  readonly loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(64)]]
  });

  readonly registrationForm = this.formBuilder.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9()\s.-]{10,20}$/)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(64)]],
      confirmPassword: ['', [Validators.required]]
    },
    {
      validators: [AccountComponent.passwordsMatchValidator]
    }
  );

  constructor() {
    void this.dataService.ensureCatalogLoaded();
  }

  async login(): Promise<void> {
    this.authError.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.isSubmitting.set(true);
    const loginResult = await this.authService.login(email.trim(), password);

    if (!loginResult.success) {
      this.authError.set(loginResult.message ?? this.i18n.translate('ui.account.loginFailed'));
      this.isSubmitting.set(false);
      return;
    }

    this.loginForm.reset({ email: '', password: '' });
    this.loginForm.markAsPristine();
    this.loginForm.markAsUntouched();

    if (this.isAdmin()) {
      this.isSubmitting.set(false);
      await this.router.navigate(['/admin']);
      return;
    }

    this.isSubmitting.set(false);
    await this.router.navigate(['/account']);
  }

  async register(): Promise<void> {
    this.authError.set('');

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const { fullName, email, phone, password } = this.registrationForm.getRawValue();
    this.isSubmitting.set(true);
    const registrationResult = await this.authService.register({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password
    });

    if (!registrationResult.success) {
      this.authError.set(registrationResult.message ?? this.i18n.translate('ui.account.registerFailed'));
      this.isSubmitting.set(false);
      return;
    }

    this.registrationForm.reset({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    this.registrationForm.markAsPristine();
    this.registrationForm.markAsUntouched();
    this.isSubmitting.set(false);
    await this.router.navigate(['/account']);
  }

  setAuthMode(mode: AuthMode): void {
    this.authMode.set(mode);
    this.authError.set('');
  }

  hasLoginControlError(controlName: LoginControlName): boolean {
    const control = this.loginForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  getLoginControlError(controlName: LoginControlName): string | null {
    const control = this.loginForm.controls[controlName];

    if (!this.hasLoginControlError(controlName)) {
      return null;
    }

    if (control.hasError('required')) {
      return controlName === 'email'
        ? this.i18n.translate('ui.account.validation.emailRequired')
        : this.i18n.translate('ui.account.validation.passwordRequired');
    }

    if (controlName === 'email' && control.hasError('email')) {
      return this.i18n.translate('ui.account.validation.emailInvalid');
    }

    if (controlName === 'email' && control.hasError('maxlength')) {
      return this.i18n.translate('ui.account.validation.emailMaxLength');
    }

    if (controlName === 'password' && control.hasError('minlength')) {
      return this.i18n.translate('ui.account.validation.passwordMinLength');
    }

    if (controlName === 'password' && control.hasError('maxlength')) {
      return this.i18n.translate('ui.account.validation.passwordMaxLength');
    }

    return this.i18n.translate('ui.account.validation.fieldInvalid');
  }

  hasRegistrationControlError(controlName: RegistrationControlName): boolean {
    const control = this.registrationForm.controls[controlName];
    return (
      control.invalid &&
      (control.touched || control.dirty || this.registrationForm.hasError('passwordMismatch'))
    );
  }

  getRegistrationControlError(controlName: RegistrationControlName): string | null {
    const control = this.registrationForm.controls[controlName];

    if (
      !this.hasRegistrationControlError(controlName) &&
      !(controlName === 'confirmPassword' && this.registrationForm.hasError('passwordMismatch'))
    ) {
      return null;
    }

    if (control.hasError('required')) {
      switch (controlName) {
        case 'fullName':
          return this.i18n.translate('ui.account.validation.fullNameRequired');
        case 'email':
          return this.i18n.translate('ui.account.validation.emailRequired');
        case 'phone':
          return this.i18n.translate('ui.account.validation.phoneRequired');
        case 'password':
          return this.i18n.translate('ui.account.validation.passwordRequired');
        case 'confirmPassword':
          return this.i18n.translate('ui.account.validation.confirmPasswordRequired');
      }
    }

    if (controlName === 'fullName' && control.hasError('minlength')) {
      return this.i18n.translate('ui.account.validation.fullNameMinLength');
    }

    if (controlName === 'fullName' && control.hasError('maxlength')) {
      return this.i18n.translate('ui.account.validation.fullNameMaxLength');
    }

    if (controlName === 'email' && control.hasError('email')) {
      return this.i18n.translate('ui.account.validation.emailInvalid');
    }

    if (controlName === 'email' && control.hasError('maxlength')) {
      return this.i18n.translate('ui.account.validation.emailMaxLength');
    }

    if (controlName === 'phone' && control.hasError('pattern')) {
      return this.i18n.translate('ui.account.validation.phoneInvalid');
    }

    if (controlName === 'password' && control.hasError('minlength')) {
      return this.i18n.translate('ui.account.validation.passwordMinLength');
    }

    if (controlName === 'password' && control.hasError('maxlength')) {
      return this.i18n.translate('ui.account.validation.passwordMaxLength');
    }

    if (controlName === 'confirmPassword' && this.registrationForm.hasError('passwordMismatch')) {
      return this.i18n.translate('ui.account.validation.passwordMismatch');
    }

    return this.i18n.translate('ui.account.validation.fieldInvalid');
  }

  clearAuthError(): void {
    if (this.authError()) {
      this.authError.set('');
    }
  }

  repeatOrder(order: OrderHistoryItem): void {
    const repeatedItems = order.items.reduce<CartItem[]>((items, orderItem) => {
      const menuItem = this.dataService.menuItems().find((item) => item.id === orderItem.productId);

      if (!menuItem) {
        return items;
      }

      items.push({
        menuItem,
        quantity: orderItem.quantity,
        ...(orderItem.notes ? { notes: orderItem.notes } : {})
      });

      return items;
    }, []);

    if (repeatedItems.length === 0) {
      this.repeatOrderError.set(this.i18n.translate('ui.account.repeatOrderFailed'));
      return;
    }

    this.repeatOrderError.set('');
    this.cartService.replaceCart(repeatedItems);
    this.cartDrawerService.open();
  }

  private static passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
