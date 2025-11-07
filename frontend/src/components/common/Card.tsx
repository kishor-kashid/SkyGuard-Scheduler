import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', title, onClick }: CardProps) {
  return (
    <div 
      className={`card ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}

