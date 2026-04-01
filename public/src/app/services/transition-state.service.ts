import { Injectable, signal } from '@angular/core';

import { TransitionState } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TransitionStateService {
  create<TAction extends string>(): TransitionState<TAction> {
    const isBusy = signal(false);
    const action = signal<TAction | null>(null);
    const error = signal('');

    return {
      isBusy,
      action,
      error,
      start: (nextAction: TAction) => {
        isBusy.set(true);
        action.set(nextAction);
        error.set('');
      },
      finish: () => {
        isBusy.set(false);
        action.set(null);
      },
      fail: (message: string) => {
        error.set(message);
      },
      clearError: () => {
        error.set('');
      }
    };
  }
}
