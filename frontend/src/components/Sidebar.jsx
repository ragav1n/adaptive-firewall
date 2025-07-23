"use client"

import { Link, useLocation } from "react-router-dom"
import { useState } from "react"

const Sidebar = () => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: "⚡",
      description: "System Overview",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      hoverColor: "hover:bg-blue-500/20",
    },
    {
      path: "/alerts",
      label: "Alerts",
      icon: "🚨",
      description: "Security Threats",
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      hoverColor: "hover:bg-red-500/20",
      badge: "LIVE",
    },
    {
      path: "/rules",
      label: "Rules",
      icon: "🛡️",
      description: "Firewall Config",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      hoverColor: "hover:bg-emerald-500/20",
    },
    {
      path: "/summaries",
      label: "Summaries",
      icon: "🤖",
      description: "AI Analysis",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      hoverColor: "hover:bg-purple-500/20",
      badge: "NEW",
    },
  ]

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-80"
      } h-screen bg-slate-900/80 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col`}
    >
      {/* Header - Proper spacing */}
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center space-x-4 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl">🛡️</span>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold gradient-text">ADAPTIVE</h1>
                <h2 className="text-sm font-medium text-gray-400 mt-1">FIREWALL</h2>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="text-gray-400 text-lg">{isCollapsed ? "→" : "←"}</span>
          </button>
        </div>

        {!isCollapsed && (
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse-custom"></div>
                <span className="text-sm font-mono text-emerald-400 font-medium">SYSTEM ONLINE</span>
              </div>
              <span className="text-sm font-mono text-gray-500">v2.1.0</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation - Better spacing */}
      <nav className="flex-1 p-6 space-y-3">
        {!isCollapsed && (
          <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-8 px-3">Navigation</div>
        )}

        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 animate-slideIn ${
                isActive
                  ? `${item.bgColor} border border-white/20 shadow-lg`
                  : `hover:bg-white/5 ${item.hoverColor} border border-transparent`
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Active indicator */}
              {isActive && (
                <div
                  className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-10 ${item.color.replace(
                    "text-",
                    "bg-",
                  )} rounded-r-full`}
                ></div>
              )}

              {/* Icon */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive ? item.bgColor : "bg-white/5 group-hover:bg-white/10"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
              </div>

              {!isCollapsed && (
                <>
                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-semibold text-base ${
                          isActive ? item.color : "text-white group-hover:text-white"
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`px-3 py-1 text-xs font-mono font-bold rounded-lg ${
                            item.badge === "LIVE"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>

                  {/* Arrow indicator */}
                  <div
                    className={`transition-all duration-300 ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                    }`}
                  >
                    <span className={`text-lg ${item.color}`}>→</span>
                  </div>
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer - Better spacing */}
      {!isCollapsed && (
        <div className="p-6 border-t border-white/10">
          <div className="glass rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse-custom"></div>
                <span className="text-sm font-mono text-emerald-400">FIREWALL</span>
              </div>
              <span className="text-sm font-mono text-emerald-400 font-bold">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse-custom"></div>
                <span className="text-sm font-mono text-purple-400">AI ENGINE</span>
              </div>
              <span className="text-sm font-mono text-purple-400 font-bold">ONLINE</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Last scan: <span className="text-blue-400 font-medium">2 min ago</span>
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
