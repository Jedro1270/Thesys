import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'small' | 'medium' | 'large';
}

const variantMapping = {
  default: 'contained',
  destructive: 'contained',
  outline: 'outlined',
  secondary: 'contained',
  ghost: 'text',
  link: 'text',
} as const;

const sizeMapping = {
  small: 'small',
  medium: 'medium',
  large: 'large',
} as const;

function Button({ variant = 'default', size = 'medium', color, ...props }: ButtonProps) {
  const muiVariant = variantMapping[variant as keyof typeof variantMapping] || 'contained';
  const muiSize = sizeMapping[size as keyof typeof sizeMapping] || 'medium';
  
  // Set appropriate color based on variant
  const muiColor = variant === 'destructive' ? 'error' : (color || 'primary');

  return (
    <MuiButton
      variant={muiVariant}
      size={muiSize}
      color={muiColor}
      {...props}
    />
  );
}

export { Button, type ButtonProps };
