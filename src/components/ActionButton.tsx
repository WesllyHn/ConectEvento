import { Button } from 'antd';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface ActionButtonProps {
  icon?: LucideIcon;
  children: ReactNode;
  onClick?: () => void;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  danger?: boolean;
  disabled?: boolean;
  block?: boolean;
  size?: 'small' | 'middle' | 'large';
}

export function ActionButton({
  icon: Icon,
  children,
  onClick,
  type = 'default',
  danger,
  disabled,
  block,
  size = 'middle'
}: ActionButtonProps) {
  return (
    <Button
      type={type}
      danger={danger}
      disabled={disabled}
      block={block}
      size={size}
      onClick={onClick}
      icon={Icon && <Icon className="w-4 h-4" />}
    >
      {children}
    </Button>
  );
}
