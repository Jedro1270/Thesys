import { TextField, TextFieldProps } from '@mui/material';

function Input(props: Omit<TextFieldProps, 'variant'>) {
  return <TextField variant="outlined" size="small" {...props} />;
}

export { Input };
