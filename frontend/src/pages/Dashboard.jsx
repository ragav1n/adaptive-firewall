"use client"

import { useEffect, useState } from "react"
import { fetchSummaries, fetchAlerts } from "../api/backend"
import Card from "../components/Card"
import Button from "../components/Button"
import { Link } from "react-router-dom"

const Dashboard = () => {
  const [summary, setSummary] = useState("")
  const [alertCount, setAlertCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    const fetchData = () => {
      fetchSummaries().then((data) => {
        if (data.status === "success") {
          setSummary(data.content)
          setLastUpdated(new Date().toLocaleTimeString())
        }
      })
      fetchAlerts().then((data) => {
        if (data.status === "success") {
          setAlertCount(data.data.length)
        }
      })
    }
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    {
      title: "Total Alerts",
      value: alertCount,
      icon: "🚨",
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      change: "+12%",
      changeType: "increase",
    },
    {
      title: "Active Rules",
      value: "247",
      icon: "🛡️",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      change: "+3%",
      changeType: "increase",
    },
    {
      title: "Blocked Threats",
      value: "1,429",
      icon: "🔒",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      change: "+8%",
      changeType: "increase",
    },
    {
      title: "System Health",
      value: "98.5%",
      icon: "💚",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      change: "+0.2%",
      changeType: "increase",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="p-12 space-y-16 animate-fadeIn">
        {/* Header - Clean spacing */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold gradient-text mb-6">Command Center</h1>
            <p className="text-gray-400 text-xl">Real-time security monitoring and analysis</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-5 h-5 bg-emerald-400 rounded-full animate-pulse-custom"></div>
            <span className="text-emerald-400 font-mono text-xl font-medium">LIVE</span>
          </div>
        </div>

        {/* Stats Grid - Clean spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, index) => (
            <Card
              key={stat.title}
              className="animate-slideIn hover:scale-105 transition-transform duration-300 text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="space-y-8">
                <div className={`w-24 h-24 rounded-2xl ${stat.bgColor} flex items-center justify-center mx-auto`}>
                  <span className="text-4xl">{stat.icon}</span>
                </div>
                <div>
                  <p className="text-gray-400 text-base font-medium mb-4">{stat.title}</p>
                  <p className="text-5xl font-bold text-white mb-6">{stat.value}</p>
                  <div className="flex items-center justify-center">
                    <span
                      className={`text-base font-medium ${
                        stat.changeType === "increase" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-gray-500 text-base ml-2">vs last week</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid - Clean spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
          {/* Threat Analysis */}
          <div className="lg:col-span-3">
            <Card>
              <div className="flex items-center justify-between mb-16">
                <h2 className="text-4xl font-bold text-white">Threat Analysis</h2>
                <Link to="/alerts">
                  <Button variant="ghost" size="md">
                    View All →
                  </Button>
                </Link>
              </div>

              {summary ? (
                <div className="space-y-16">
                  {/* Header */}
                  <div className="text-center">
                    <h3 className="text-3xl font-semibold text-blue-400 mb-6">Latest Security Alert</h3>
                    <div className="h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
                  </div>

                  {/* Alert Information */}
                  <div className="bg-red-500/10 rounded-2xl border border-red-500/20">
                    <div className="p-12">
                      <div className="text-center mb-12">
                        <h4 className="text-2xl font-semibold text-red-400 mb-4">Alert Information</h4>
                        <div className="h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                        <div className="space-y-4">
                          <p className="text-gray-400 text-base">Source IP</p>
                          <p className="text-blue-400 font-mono text-xl font-semibold">192.168.1.13</p>
                        </div>
                        <div className="space-y-4">
                          <p className="text-gray-400 text-base">Destination IP</p>
                          <p className="text-purple-400 font-mono text-xl font-semibold">192.168.1.255</p>
                        </div>
                        <div className="space-y-4">
                          <p className="text-gray-400 text-base">Protocol</p>
                          <p className="text-gray-300 font-mono text-xl font-semibold">UDP</p>
                        </div>
                        <div className="space-y-4">
                          <p className="text-gray-400 text-base">Severity</p>
                          <p className="text-yellow-400 font-mono text-xl font-semibold">Level 3</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detection Information */}
                  <div className="bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <div className="p-12">
                      <div className="text-center mb-12">
                        <h4 className="text-2xl font-semibold text-emerald-400 mb-4">Detection Information</h4>
                        <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4">
                          <p className="text-gray-400 text-base">Service</p>
                          <p className="text-emerald-400 font-mono text-xl font-semibold">Spotify P2P</p>
                        </div>
                        <div className="space-y-4">
                          <p className="text-gray-400 text-base">Detection Time</p>
                          <p className="text-blue-400 font-mono text-xl font-semibold">6:04 PM IST</p>
                        </div>
                        <div className="space-y-4">
                          <p className="text-gray-400 text-base">Status</p>
                          <p className="text-purple-400 font-mono text-xl font-semibold">Analyzed</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis Summary */}
                  <div className="bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <div className="p-12">
                      <div className="text-center mb-12">
                        <h4 className="text-2xl font-semibold text-blue-400 mb-4">AI Analysis Summary</h4>
                        <div className="h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-300 text-xl leading-relaxed max-w-4xl mx-auto">
                          Network activity detected involving Spotify&apos;s P2P service. Communication pattern suggests
                          normal peer-to-peer file sharing behavior.{" "}
                          <span className="text-emerald-400 font-semibold">Low severity</span> - continued monitoring
                          recommended.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-80">
                  <div className="flex items-center space-x-6">
                    <div className="animate-spin w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full"></div>
                    <div className="text-gray-400 text-2xl">Loading threat analysis...</div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-12">
            <Card>
              <h3 className="text-2xl font-bold text-white mb-12 text-center">Quick Actions</h3>
              <div className="space-y-8">
                <Link to="/alerts">
                  <Button variant="secondary" className="w-full justify-center text-lg py-6">
                    <span className="text-2xl mr-4">🚨</span>
                    <span>View Alerts</span>
                  </Button>
                </Link>
                <Link to="/rules">
                  <Button variant="secondary" className="w-full justify-center text-lg py-6">
                    <span className="text-2xl mr-4">🛡️</span>
                    <span>Manage Rules</span>
                  </Button>
                </Link>
                <Link to="/summaries">
                  <Button variant="secondary" className="w-full justify-center text-lg py-6">
                    <span className="text-2xl mr-4">🤖</span>
                    <span>AI Analysis</span>
                  </Button>
                </Link>
              </div>
            </Card>

            <Card>
              <h3 className="text-2xl font-bold text-white mb-12 text-center">System Status</h3>
              <div className="space-y-10">
                <div className="text-center">
                  <p className="text-gray-400 text-base mb-4">Last Update</p>
                  <p className="text-blue-400 font-mono text-xl font-semibold">{lastUpdated || "--:--:--"}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-base mb-4">System Uptime</p>
                  <p className="text-emerald-400 font-mono text-xl font-semibold">99.9%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-base mb-4">Memory Usage</p>
                  <p className="text-purple-400 font-mono text-xl font-semibold">67%</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
