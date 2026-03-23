import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  label:     string;
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  icon?:     string;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary:   'bg-primary border-primary',
  secondary: 'bg-light-elevated dark:bg-dark-elevated border-light-border dark:border-dark-border',
  outline:   'bg-transparent border-white/30',
  ghost:     'bg-transparent border-transparent',
  danger:    'bg-error/10 border-error/40',
};

const TEXT_STYLES: Record<Variant, string> = {
  primary:   'text-white',
  secondary: 'text-white',
  outline:   'text-white',
  ghost:     'text-text-muted dark:text-text-secondary',
  danger:    'text-error',
};

const SIZE_STYLES: Record<Size, { button: string; text: string }> = {
  sm: { button: 'px-4 py-2.5 rounded-xl', text: 'text-sm' },
  md: { button: 'px-5 py-3.5 rounded-2xl', text: 'text-base' },
  lg: { button: 'px-6 py-4 rounded-2xl',  text: 'text-base' },
};

export default function Button({
  label, variant = 'primary', size = 'md',
  loading = false, icon, fullWidth = false,
  disabled, ...props
}: ButtonProps) {
  const v = VARIANT_STYLES[variant];
  const t = TEXT_STYLES[variant];
  const s = SIZE_STYLES[size];

  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      className={[
        'flex-row items-center justify-center gap-2 border',
        v, s.button,
        fullWidth ? 'w-full' : '',
        disabled || loading ? 'opacity-40' : 'active:opacity-75',
      ].join(' ')}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : '#FF6B35'} />
      ) : (
        <>
          {icon && <Text className="text-base">{icon}</Text>}
          <Text className={['font-semibold', t, s.text].join(' ')}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
