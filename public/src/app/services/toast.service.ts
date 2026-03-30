import { Injectable, signal } from '@angular/core';
import { ToastHelper } from '../helpers';
import { Toast } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private nextId = 0;
  private readonly defaultDuration = 800;

  readonly toasts = signal<Toast[]>([]);

  success(message: string, duration = this.defaultDuration): void {
    const id = this.nextId++;
    const toast = ToastHelper.createToast(id, message, 'success');

    this.toasts.update((current) => ToastHelper.appendToast(current, toast));
    setTimeout(() => this.dismiss(id), duration);
  }

  error(message: string, duration = this.defaultDuration): void {
    const id = this.nextId++;
    const toast = ToastHelper.createToast(id, message, 'error');

    this.toasts.update((current) => ToastHelper.appendToast(current, toast));
    setTimeout(() => this.dismiss(id), duration);
  }

  info(message: string, duration = this.defaultDuration): void {
    const id = this.nextId++;
    const toast = ToastHelper.createToast(id, message, 'info');

    this.toasts.update((current) => ToastHelper.appendToast(current, toast));
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number): void {
    this.toasts.update((current) => ToastHelper.removeToastById(current, id));
  }
}
