import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap, take } from 'rxjs';

import { ApiErrorHelper } from '../../helpers';
import {
  AuthActionResult,
  AuthMode,
  CartItem,
  ClientRegistrationData,
  JwtAuthData,
  LoginControlName,
  Order,
  Product,
  RegistrationControlName
} from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import {
  AuthApiService,
  CartDrawerService,
  CartService,
  I18nService,
  OrderApiService,
  ProductApiService,
  UserService
} from '../../services';
import { AccountOrderHistoryComponent, AccountProfileSummaryComponent } from '../components';


@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule, AccountProfileSummaryComponent, AccountOrderHistoryComponent, TranslatePipe, RouterLink],
  templateUrl: './account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent {
  readonly authService = inject(UserService);
  private readonly apiErrorHelper = inject(ApiErrorHelper);
  private readonly authApiService = inject(AuthApiService);
  private readonly orderApiService = inject(OrderApiService);
  private readonly productApiService = inject(ProductApiService);
  private readonly cartService = inject(CartService);
  private readonly cartDrawerService = inject(CartDrawerService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly products = signal<Product[]>([]);

  readonly currentUser = this.authService.currentUser;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isAdmin = this.authService.isAdmin;
  readonly authMode = signal<AuthMode>('login');
  readonly authError = signal('');
  readonly isSubmitting = signal(false);
  readonly isTransitioning = signal(false);
  readonly isOrdersLoading = signal(false);
  readonly repeatOrderError = signal('');
  readonly orders = signal<Order[]>([]);

  readonly loginEmailHasError = signal(false);
  readonly loginPasswordHasError = signal(false);
  readonly loginEmailErrorMessage = signal<string | null>(null);
  readonly loginPasswordErrorMessage = signal<string | null>(null);
  readonly registrationFullNameHasError = signal(false);
  readonly registrationEmailHasError = signal(false);
  readonly registrationPhoneHasError = signal(false);
  readonly registrationPasswordHasError = signal(false);
  readonly registrationConfirmPasswordHasError = signal(false);
  readonly registrationFullNameErrorMessage = signal<string | null>(null);
  readonly registrationEmailErrorMessage = signal<string | null>(null);
  readonly registrationPhoneErrorMessage = signal<string | null>(null);
  readonly registrationPasswordErrorMessage = signal<string | null>(null);
  readonly registrationConfirmPasswordErrorMessage = signal<string | null>(null);

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
    this.productApiService.listing().pipe(take(1)).subscribe((response) => {
      this.products.set(response.data ?? []);
    });

    effect(() => {
      if (this.isTransitioning()) {
        return;
      }

      const user = this.currentUser();

      if (!user) {
        this.orders.set([]);
        this.isOrdersLoading.set(false);
        return;
      }

      this.loadProfileOrders();
    });
  }

  private loadProfileOrders(): void {
    this.isOrdersLoading.set(true);

    this.orderApiService.profileOrders().pipe(
      take(1),
      catchError(() => {
        this.orders.set([]);
        return of({ data: [] as Order[] });
      }),
      finalize(() => this.isOrdersLoading.set(false))
    ).subscribe((response) => {
      this.orders.set(response.data ?? []);
    });
  }

  login(): void {
    this.authError.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.updateLoginControlErrorState('email');
      this.updateLoginControlErrorState('password');
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    let postAuthPath: '/admin' | '/account' = '/account';

    this.isSubmitting.set(true);
    this.authApiService.login(email.trim(), password).pipe(
      take(1),
      switchMap((response) => {
        const authData: JwtAuthData = response.data;
        this.isTransitioning.set(true);
        this.authService.setToken(authData.access_token);
        this.authService.setCurrentUser(authData.user);
        postAuthPath = authData.user.role === 'admin' ? '/admin' : '/account';

        return of({ success: true });
      }),
      catchError((error: unknown) => of({
        success: false,
        message: this.apiErrorHelper.extractApiErrorMessage(error, 'Enabled to log in. Please check your credentials and try again.')
      }))
    ).subscribe((loginResult: AuthActionResult) => {
      if (!loginResult.success) {
        this.isTransitioning.set(false);
        this.authError.set(loginResult.message ?? this.i18n.translate('ui.account.loginFailed'));
        this.isSubmitting.set(false);
        return;
      }

      this.loginForm.reset({ email: '', password: '' });
      this.loginForm.markAsPristine();
      this.loginForm.markAsUntouched();

      this.isSubmitting.set(false);
      void this.router.navigate([postAuthPath], { replaceUrl: true }).finally(() => {
        this.isTransitioning.set(false);
      });
    });
  }

  register(): void {
    this.authError.set('');

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      this.updateRegistrationControlErrorState('fullName');
      this.updateRegistrationControlErrorState('email');
      this.updateRegistrationControlErrorState('phone');
      this.updateRegistrationControlErrorState('password');
      this.updateRegistrationControlErrorState('confirmPassword');
      return;
    }

    const { fullName, email, phone, password } = this.registrationForm.getRawValue();
    let postAuthPath: '/admin' | '/account' = '/account';

    this.isSubmitting.set(true);
    const registrationData: ClientRegistrationData = {
      name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password
    };

    this.authApiService.register(registrationData).pipe(
      take(1),
      switchMap((response) => {
        const authData: JwtAuthData = response.data;
        this.isTransitioning.set(true);
        this.authService.setToken(authData.access_token);
        this.authService.setCurrentUser(authData.user);
        postAuthPath = authData.user.role === 'admin' ? '/admin' : '/account';

        return of({ success: true });
      }),
      catchError((error: unknown) => of({
        success: false,
        message: this.apiErrorHelper.extractApiErrorMessage(error, 'Enabled to register. Please try again.')
      }))
    ).subscribe((registrationResult: AuthActionResult) => {
      if (!registrationResult.success) {
        this.isTransitioning.set(false);
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
      void this.router.navigate([postAuthPath], { replaceUrl: true }).finally(() => {
        this.isTransitioning.set(false);
      });
    });
  }

  setAuthMode(mode: AuthMode): void {
    this.authMode.set(mode);
    this.authError.set('');
  }

  updateLoginControlErrorState(controlName: LoginControlName): void {
    const control = this.loginForm.controls[controlName];
    const hasError = control.invalid && (control.touched || control.dirty);
    const errorMessage = hasError ? this.getLoginControlErrorMessage(controlName) : null;

    if (controlName === 'email') {
      this.loginEmailHasError.set(hasError);
      this.loginEmailErrorMessage.set(errorMessage);
    } else {
      this.loginPasswordHasError.set(hasError);
      this.loginPasswordErrorMessage.set(errorMessage);
    }
  }

  private getLoginControlErrorMessage(controlName: LoginControlName): string {
    const control = this.loginForm.controls[controlName];

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

  updateRegistrationControlErrorState(controlName: RegistrationControlName): void {
    const control = this.registrationForm.controls[controlName];
    const hasError =
      control.invalid &&
      (control.touched || control.dirty || this.registrationForm.hasError('passwordMismatch'));
    const errorMessage = hasError || (controlName === 'confirmPassword' && this.registrationForm.hasError('passwordMismatch'))
      ? this.getRegistrationControlErrorMessage(controlName)
      : null;

    switch (controlName) {
      case 'fullName':
        this.registrationFullNameHasError.set(hasError);
        this.registrationFullNameErrorMessage.set(errorMessage);
        break;
      case 'email':
        this.registrationEmailHasError.set(hasError);
        this.registrationEmailErrorMessage.set(errorMessage);
        break;
      case 'phone':
        this.registrationPhoneHasError.set(hasError);
        this.registrationPhoneErrorMessage.set(errorMessage);
        break;
      case 'password':
        this.registrationPasswordHasError.set(hasError);
        this.registrationPasswordErrorMessage.set(errorMessage);
        break;
      case 'confirmPassword':
        this.registrationConfirmPasswordHasError.set(hasError);
        this.registrationConfirmPasswordErrorMessage.set(errorMessage);
        break;
    }
  }

  private getRegistrationControlErrorMessage(controlName: RegistrationControlName): string {
    const control = this.registrationForm.controls[controlName];

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

  repeatOrder(order: Order): void {
    const repeatedItems = (order?.items ?? []).reduce<CartItem[]>((items, orderItem) => {
      const product = this.products().find((item) => item.id === orderItem.product_id);

      if (!product) {
        return items;
      }

      items.push({
        product: product,
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
