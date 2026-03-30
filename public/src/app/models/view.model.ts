export type UiLocale = 'en' | 'ua';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export interface LaravelValidationErrors {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface GallerySlot {
  image_url: string | null;
  is_placeholder: boolean;
}

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'orange' | 'sky';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'password' | 'tel' | 'number';

export type AuthMode = 'login' | 'register';
export type LoginControlName = 'email' | 'password';
export type RegistrationControlName = 'fullName' | 'email' | 'phone' | 'password' | 'confirmPassword';

export interface AuthActionResult {
  success: boolean;
  message?: string;
}

