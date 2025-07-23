const Button = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const baseClasses = "font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"

  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "hover:bg-white/10 text-white",
  }

  const sizes = {
    sm: "px-5 py-3 text-sm",
    md: "px-8 py-4 text-base",
    lg: "px-10 py-5 text-lg",
  }

  return (
    <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
