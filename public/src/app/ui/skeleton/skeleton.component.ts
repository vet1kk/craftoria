import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonGroupConfig, SkeletonLineConfig, SkeletonRowConfig } from '../../models';

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  templateUrl: './skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonComponent {
  readonly containerClass = input('rounded-3xl border border-stone-100 bg-white p-6 shadow-sm sm:p-8');
  readonly pulseClass = input('animate-pulse space-y-4');
  readonly groups = input<SkeletonGroupConfig[]>([
    {
      lines: [
        { widthClass: 'w-44', heightClass: 'h-6', tone: 'default' },
        { widthClass: 'w-60', heightClass: 'h-4', tone: 'muted' }
      ]
    },
    {
      className: 'rounded-2xl border border-stone-100 p-5',
      lines: [
        { widthClass: 'w-32', heightClass: 'h-4', tone: 'default' },
        { widthClass: 'w-24', heightClass: 'h-4', className: 'mt-3', tone: 'muted' },
        { widthClass: 'w-full', heightClass: 'h-10', className: 'mt-4', roundedClass: 'rounded-xl', tone: 'muted' }
      ]
    }
  ]);

  lineClass(line: SkeletonLineConfig): string {
    return [
      line.heightClass ?? 'h-4',
      line.widthClass ?? 'w-full',
      line.roundedClass ?? 'rounded',
      line.tone === 'muted' ? 'bg-stone-100' : 'bg-stone-200',
      line.className ?? ''
    ].filter((value) => value.length > 0).join(' ');
  }

  rowClass(row: SkeletonRowConfig): string {
    return [
      'flex items-center justify-between gap-3',
      row.className ?? ''
    ].filter((value) => value.length > 0).join(' ');
  }

  segmentClass(position: 'left' | 'center' | 'right', segmentClassName?: string): string {
    const defaults: Record<'left' | 'center' | 'right', string> = {
      left: 'flex items-center gap-2',
      center: 'min-w-0 flex-1',
      right: 'flex flex-wrap items-center justify-end gap-2'
    };

    return [defaults[position], segmentClassName ?? '']
      .filter((value) => value.length > 0)
      .join(' ');
  }

}
