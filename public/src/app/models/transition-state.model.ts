import { WritableSignal } from '@angular/core';

export interface TransitionState<TAction extends string> {
  isBusy: WritableSignal<boolean>;
  action: WritableSignal<TAction | null>;
  error: WritableSignal<string>;
  start: (action: TAction) => void;
  finish: () => void;
  fail: (message: string) => void;
  clearError: () => void;
}
