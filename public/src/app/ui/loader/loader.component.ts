import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-loader',
  standalone: true,
  templateUrl: './loader.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {
  readonly label = input<string | null>(null);
  readonly size = input<'sm' | 'md'>('md');
  readonly tone = input<'dark' | 'light'>('dark');
}
