import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, of, switchMap, take } from 'rxjs';

import { ApiErrorHelper, extractValidationPayload, passwordsMatchValidator } from '../../helpers';
import { AuthActionResult, AuthMode, ClientRegistrationData, JwtAuthData } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthApiService, I18nService, UserService, ValidationService } from '../../services';
import { ButtonComponent, FormInputComponent, LoaderComponent } from '../../ui';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink, LoaderComponent, ButtonComponent, FormInputComponent],
  templateUrl: './account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent {
  readonly loginValidationGroup = 'accountLogin';
  readonly registerValidationGroup = 'accountRegistration';

  readonly authService = inject(UserService);
  private readonly apiErrorHelper = inject(ApiErrorHelper);
  private readonly authApiService = inject(AuthApiService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  readonly validationService = inject(ValidationService);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly authMode = signal<AuthMode>('login');
  readonly authError = signal('');
  readonly isSubmitting = signal(false);
  readonly isTransitioning = signal(false);
  private readonly loginFieldKeys = ['email', 'password'] as const;
  private readonly registerFieldKeys = ['fullName', 'email', 'phone', 'password', 'confirmPassword'] as const;

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
      validators: [passwordsMatchValidator]
    }
  );

  constructor() {
    effect(() => {
      if (!this.isAuthenticated() || this.isTransitioning()) {
        return;
      }

      this.isTransitioning.set(true);
      void this.router.navigate(['/profile'], { replaceUrl: true }).finally(() => {
        this.isTransitioning.set(false);
      });
    });
  }

  login(): void {
    this.authError.set('');
    this.validationService.clearGroupErrors(this.loginValidationGroup);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    let postAuthPath: '/admin' | '/profile' = '/profile';

    this.isSubmitting.set(true);
    this.authApiService.login(email.trim(), password).pipe(
      take(1),
      switchMap((response) => {
        this.isTransitioning.set(true);
        const authData: JwtAuthData = response.data;
        this.authService.setToken(authData.access_token);
        this.authService.setCurrentUser(authData.user);
        postAuthPath = authData.user.role === 'admin' ? '/admin' : '/profile';

        return of({ success: true });
      }),
      catchError((error: unknown) => of({
        ...this.resolveAuthFailure(error, this.loginValidationGroup, 'Enabled to log in. Please check your credentials and try again.')
      }))
    ).subscribe((loginResult: AuthActionResult) => {
      if (!loginResult.success) {
        this.isTransitioning.set(false);

        if (!this.validationService.hasGroupErrors(this.loginValidationGroup, this.loginFieldKeys)) {
          this.authError.set(loginResult.message ?? this.i18n.translate('ui.account.loginFailed'));
        }

        this.isSubmitting.set(false);
        return;
      }

      this.loginForm.reset({ email: '', password: '' });
      this.loginForm.markAsPristine();
      this.loginForm.markAsUntouched();
      this.validationService.clearGroupErrors(this.loginValidationGroup);

      this.isSubmitting.set(false);
      void this.router.navigate([postAuthPath], { replaceUrl: true }).finally(() => {
        this.isTransitioning.set(false);
      });
    });
  }

  register(): void {
    this.authError.set('');
    this.validationService.clearGroupErrors(this.registerValidationGroup);

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const { fullName, email, phone, password } = this.registrationForm.getRawValue();
    let postAuthPath: '/admin' | '/profile' = '/profile';

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
        postAuthPath = authData.user.role === 'admin' ? '/admin' : '/profile';

        return of({ success: true });
      }),
      catchError((error: unknown) => of({
        ...this.resolveAuthFailure(error, this.registerValidationGroup, 'Enabled to register. Please try again.')
      }))
    ).subscribe((registrationResult: AuthActionResult) => {
      if (!registrationResult.success) {
        this.isTransitioning.set(false);

        if (!this.validationService.hasGroupErrors(this.registerValidationGroup, this.registerFieldKeys)) {
          this.authError.set(registrationResult.message ?? this.i18n.translate('ui.account.registerFailed'));
        }

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
      this.validationService.clearGroupErrors(this.registerValidationGroup);
      this.isSubmitting.set(false);
      void this.router.navigate([postAuthPath], { replaceUrl: true }).finally(() => {
        this.isTransitioning.set(false);
      });
    });
  }

  setAuthMode(mode: AuthMode): void {
    this.authMode.set(mode);
    this.authError.set('');
    this.validationService.clearGroupErrors(this.loginValidationGroup);
    this.validationService.clearGroupErrors(this.registerValidationGroup);
  }

  clearAuthError(): void {
    if (this.authError()) {
      this.authError.set('');
    }
  }

  private resolveAuthFailure(error: unknown, validationGroup: string, fallbackMessage: string): AuthActionResult {
    const payload = extractValidationPayload(error);

    if (payload?.errors) {
      this.validationService.setFieldErrors(validationGroup, payload.errors);
    }

    return {
      success: false,
      message: this.apiErrorHelper.extractApiErrorMessage(error, fallbackMessage)
    };
  }
}
