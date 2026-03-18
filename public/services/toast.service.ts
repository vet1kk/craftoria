import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private nextId = 0;
  private readonly defaultDuration = 3000;

  readonly toasts = signal<Toast[]>([]);

  success(message: string, duration = this.defaultDuration): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = this.defaultDuration): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = this.defaultDuration): void {
    this.show(message, 'info', duration);
  }

  private show(message: string, type: Toast['type'], duration: number): void {
    const id = this.nextId++;
    const toast: Toast = { id, message, type };

    this.toasts.update((current) => [...current, toast]);

    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number): void {
    this.toasts.update((current) => current.filter((toast) => toast.id !== id));
  }
}
