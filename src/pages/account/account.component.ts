import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService, CartDrawerService, CartService, DataService } from '../../services';
import { CartItem, OrderHistoryItem } from '../../models';
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
  imports: [ReactiveFormsModule, AccountProfileSummaryComponent, AccountOrderHistoryComponent],
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

  async login(): Promise<void> {
    this.authError.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.isSubmitting.set(true);
    const loginResult = this.authService.login(email.trim(), password);

    if (!loginResult.success) {
      this.authError.set(loginResult.message ?? 'Не вдалося увійти.');
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
    const registrationResult = this.authService.register({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password
    });

    if (!registrationResult.success) {
      this.authError.set(registrationResult.message ?? 'Не вдалося створити обліковий запис.');
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
      return controlName === 'email' ? 'Вкажіть email.' : 'Вкажіть пароль.';
    }

    if (controlName === 'email' && control.hasError('email')) {
      return 'Введіть коректну email-адресу.';
    }

    if (controlName === 'email' && control.hasError('maxlength')) {
      return 'Email має містити не більше 120 символів.';
    }

    if (controlName === 'password' && control.hasError('minlength')) {
      return 'Пароль має містити щонайменше 6 символів.';
    }

    if (controlName === 'password' && control.hasError('maxlength')) {
      return 'Пароль має містити не більше 64 символів.';
    }

    return 'Перевірте це поле та спробуйте ще раз.';
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
          return 'Вкажіть ім’я та прізвище.';
        case 'email':
          return 'Вкажіть email.';
        case 'phone':
          return 'Вкажіть номер телефону.';
        case 'password':
          return 'Вкажіть пароль.';
        case 'confirmPassword':
          return 'Підтвердіть пароль.';
      }
    }

    if (controlName === 'fullName' && control.hasError('minlength')) {
      return 'Ім’я та прізвище мають містити щонайменше 2 символи.';
    }

    if (controlName === 'fullName' && control.hasError('maxlength')) {
      return 'Ім’я та прізвище мають містити не більше 80 символів.';
    }

    if (controlName === 'email' && control.hasError('email')) {
      return 'Введіть коректну email-адресу.';
    }

    if (controlName === 'email' && control.hasError('maxlength')) {
      return 'Email має містити не більше 120 символів.';
    }

    if (controlName === 'phone' && control.hasError('pattern')) {
      return 'Введіть коректний номер телефону.';
    }

    if (controlName === 'password' && control.hasError('minlength')) {
      return 'Пароль має містити щонайменше 6 символів.';
    }

    if (controlName === 'password' && control.hasError('maxlength')) {
      return 'Пароль має містити не більше 64 символів.';
    }

    if (controlName === 'confirmPassword' && this.registrationForm.hasError('passwordMismatch')) {
      return 'Паролі не збігаються.';
    }

    return 'Перевірте це поле та спробуйте ще раз.';
  }

  clearAuthError(): void {
    if (this.authError()) {
      this.authError.set('');
    }
  }

  repeatOrder(order: OrderHistoryItem): void {
    const repeatedItems: CartItem[] = order.items
      .map((orderItem) => {
        const menuItem = this.dataService.menuItems.find((item) => item.id === orderItem.id);

        if (!menuItem) {
          return null;
        }

        return {
          menuItem,
          quantity: orderItem.quantity
        };
      })
      .filter((item): item is CartItem => item !== null);

    if (repeatedItems.length === 0) {
      this.repeatOrderError.set('Не вдалося повторити це замовлення, бо його позиції більше недоступні.');
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
