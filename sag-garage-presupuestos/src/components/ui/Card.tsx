import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  hover = false,
}) => {
  return (
    <div className={`${hover ? 'card-hover' : 'card'} ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h2 className="section-title">{title}</h2>}
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
