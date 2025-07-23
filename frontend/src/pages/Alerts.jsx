"use client"

import { useEffect, useState } from "react"
import { fetchAlerts } from "../api/backend"
import Card from "../components/Card"
import Button from "../components/Button"

const Alerts = () => {
  const [alerts, setAlerts] = useState([])
  const [filteredAlerts, setFilteredAlerts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")

  useEffect(() => {
    const fetchData = () => {
      fetchAlerts().then((data) => {
        if (data.status === "success") {
          setAlerts(data.data)
          setFilteredAlerts(data.data)
        }
      })
    }
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let filtered = alerts

    if (searchTerm) {
      filtered = filtered.filter(
        (alert) =>
          alert.src_ip?.includes(searchTerm) ||
          alert.dest_ip?.includes(searchTerm) ||
          alert.alert?.signature?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter((alert) => alert.alert?.severity?.toString() === severityFilter)
    }

    setFilteredAlerts(filtered)
  }, [alerts, searchTerm, severityFilter])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 1:
        return "text-red-400"
      case 2:
        return "text-yellow-400"
      case 3:
        return "text-blue-400"
      default:
        return "text-gray-400"
    }
  }

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 1:
        return "HIGH"
      case 2:
        return "MEDIUM"
      case 3:
        return "LOW"
      default:
        return "UNKNOWN"
    }
  }

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "N/A"
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <div className="p-10 space-y-10 animate-fadeIn min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-3">Security Alerts</h1>
          <p className="text-gray-400 text-lg">Real-time threat detection and monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse-custom"></div>
          <span className="text-red-400 font-mono text-lg font-medium">{filteredAlerts.length} ACTIVE</span>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="block text-white font-medium text-lg mb-4">Search Filter</label>
            <input
              type="text"
              placeholder="Search by IP or signature..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-white font-medium text-lg mb-4">Severity Level</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
            >
              <option value="all">All Levels</option>
              <option value="1">High</option>
              <option value="2">Medium</option>
              <option value="3">Low</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="primary" className="w-full">
              Export Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {filteredAlerts.filter((a) => a.alert?.severity === 1).length}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">High Severity</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {filteredAlerts.filter((a) => a.alert?.severity === 2).length}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Medium Severity</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {filteredAlerts.filter((a) => a.alert?.severity === 3).length}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Low Severity</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">{filteredAlerts.length}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Total Alerts</div>
          </div>
        </Card>
      </div>

      {/* Alerts Table */}
      <Card>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Threat Detection Log</h2>
          <p className="text-gray-400">Real-time security event monitoring</p>
        </div>

        <div className="overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full modern-table">
              <thead>
                <tr>
                  <th className="p-6 text-left">Timestamp</th>
                  <th className="p-6 text-left">Source IP</th>
                  <th className="p-6 text-left">Dest IP</th>
                  <th className="p-6 text-left">Signature</th>
                  <th className="p-6 text-left">Severity</th>
                  <th className="p-6 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert, index) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors">
                      <td className="p-6 font-mono text-sm">
                        {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : "N/A"}
                      </td>
                      <td className="p-6 font-mono text-sm text-blue-400">{alert.src_ip}</td>
                      <td className="p-6 font-mono text-sm text-purple-400">{alert.dest_ip}</td>
                      <td className="p-6 text-sm" title={alert.alert?.signature}>
                        {truncateText(alert.alert?.signature)}
                      </td>
                      <td className="p-6">
                        <span className={`font-mono text-sm font-bold ${getSeverityColor(alert.alert?.severity)}`}>
                          {getSeverityLabel(alert.alert?.severity)}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse-custom"></div>
                          <span className="text-sm font-mono text-red-400">ACTIVE</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-400">
                      No alerts match current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Alerts
