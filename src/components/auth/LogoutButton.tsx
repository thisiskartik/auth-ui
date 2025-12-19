'use client';

import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

export interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ 
  variant = 'outline', 
  size = 'default',
  className,
  children 
}: LogoutButtonProps) {
  const { logout, isLoading } = useAuth();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={logout}
      disabled={isLoading}
    >
      {children || 'Logout'}
    </Button>
  );
}
