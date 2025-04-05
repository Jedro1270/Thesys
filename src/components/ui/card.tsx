import * as React from 'react';
import { Card as MuiCard, CardHeader as MuiCardHeader, CardContent as MuiCardContent, CardActions as MuiCardActions, Typography, TypographyProps } from '@mui/material';

interface CardProps extends React.ComponentProps<typeof MuiCard> {}
interface CardHeaderProps extends React.ComponentProps<typeof MuiCardHeader> {}
interface CardContentProps extends React.ComponentProps<typeof MuiCardContent> {}
interface CardActionProps extends React.ComponentProps<typeof MuiCardActions> {}
interface CardDescriptionProps extends TypographyProps {}

function Card({ className, ...props }: CardProps) {
  return <MuiCard variant="outlined" elevation={1} {...props} sx={{ p: 3, ...props.sx }} />;
}

function CardHeader({ className, ...props }: CardHeaderProps) {
  return <MuiCardHeader {...props} />;
}

function CardTitle({ children, ...props }: { children: React.ReactNode }) {
  return (
    <Typography variant="h6" component="h3" {...props}>
      {children}
    </Typography>
  );
}

function CardDescription({ children, ...props }: CardDescriptionProps) {
  return (
    <Typography variant="body2" color="text.secondary" {...props}>
      {children}
    </Typography>
  );
}

function CardAction(props: CardActionProps) {
  return <MuiCardActions {...props} />;
}

function CardContent(props: CardContentProps) {
  return <MuiCardContent {...props} />;
}

function CardFooter(props: CardActionProps) {
  return <MuiCardActions {...props} />;
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
