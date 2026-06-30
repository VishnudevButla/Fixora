import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  className = '',
  ...props
}) {
  // Base classes for the button
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

  // Variant styles
  const variants = {
    primary: 'bg-brand-primary-dark hover:bg-brand-primary text-white shadow-sm shadow-emerald-100 focus:ring-brand-primary-dark',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400',
    accent: 'bg-brand-secondary hover:bg-brand-secondary/90 text-white shadow-sm focus:ring-brand-secondary',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-brand-dark focus:ring-brand-primary-dark',
    danger: 'bg-brand-danger hover:bg-brand-danger/90 text-white shadow-sm focus:ring-brand-danger',
    ghost: 'hover:bg-slate-50 text-brand-muted hover:text-brand-dark focus:ring-slate-300',
  };

  // Size styles
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const combinedClasses = `
    ${baseClasses} 
    ${variants[variant] || variants.primary} 
    ${sizes[size] || sizes.md} 
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={combinedClasses}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  );
}
