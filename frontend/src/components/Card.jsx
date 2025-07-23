const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 ${className}`}
      {...props}
    >
      <div className="p-12">{children}</div>
    </div>
  )
}

export default Card
