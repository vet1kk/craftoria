export interface GallerySlot {
  image_url: string | null;
  is_placeholder: boolean;
}

export interface SkeletonLineConfig {
  widthClass?: string;
  heightClass?: string;
  className?: string;
  roundedClass?: string;
  tone?: 'default' | 'muted';
}

export interface SkeletonRowSegmentConfig {
  className?: string;
  lines: SkeletonLineConfig[];
}

export interface SkeletonRowConfig {
  className?: string;
  left?: SkeletonRowSegmentConfig;
  center?: SkeletonRowSegmentConfig;
  right?: SkeletonRowSegmentConfig;
}

export interface SkeletonGroupConfig {
  className?: string;
  lines?: SkeletonLineConfig[];
  rows?: SkeletonRowConfig[];
  rowsClassName?: string;
}

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'orange' | 'sky';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'password' | 'tel' | 'number';
