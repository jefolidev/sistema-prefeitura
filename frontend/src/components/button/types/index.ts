export interface ButtonProps {
  className?: string;
  color?: "primary" | "secondary" | "danger" | "success" | "outline";
  disabled?: boolean;
  icon?: React.ReactNode;
  label: string;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "outline"
  onClick?: () => void;
} 