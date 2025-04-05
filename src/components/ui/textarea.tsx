import { TextField, TextFieldProps } from '@mui/material';

function Textarea(props: Omit<TextFieldProps, 'variant' | 'multiline'>) {
  return <TextField variant="outlined" multiline minRows={3} {...props} />;
}

export { Textarea };
