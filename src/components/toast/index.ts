export interface ToastProps {
  text?: string;
  position?: 'top' | 'top-center' | 'top-left' | 'top-right' | 'bottom' | 'bottom-center' | 'bottom-left' | 'bottom-right';
  duration?: 'normal' | 'long' | 'short' | number;
  type?: 'normal' | 'primary' | 'success' | 'danger' | 'info' | 'warning';

  actionText?: string;
  action?: Function;
}