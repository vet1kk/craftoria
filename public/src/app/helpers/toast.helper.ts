import { Toast } from '../models';

export class ToastHelper {
  static createToast(id: number, message: string, type: Toast['type']): Toast {
    return { id, message, type };
  }

  static appendToast(current: Toast[], toast: Toast): Toast[] {
    return [...current, toast];
  }

  static removeToastById(current: Toast[], id: number): Toast[] {
    return current.filter((toast) => toast.id !== id);
  }
}
