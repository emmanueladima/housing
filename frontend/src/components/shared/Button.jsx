const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md';

  const variants = {
    primary: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500 border border-transparent',
    secondary: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 focus:ring-gray-500',
    outline: 'bg-transparent border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 focus:ring-orange-500',
    ghost: 'text-orange-600 hover:bg-orange-50 focus:ring-orange-500 bg-transparent shadow-none hover:shadow-none',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;

