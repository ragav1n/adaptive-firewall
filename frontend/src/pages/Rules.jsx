"use client"

import { useEffect, useState } from "react"
import { fetchRules } from "../api/backend"
import Card from "../components/Card"
import Button from "../components/Button"

const Rules = () => {
  const [rawRules, setRawRules] = useState("")
  const [parsedRules, setParsedRules] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRules, setFilteredRules] = useState([])

  // Parse the backend response into structured data
  const parseRulesData = (rawData) => {
    const rules = []
    const sections = rawData.split("---").filter((section) => section.trim())

    sections.forEach((section) => {
      const lines = section.trim().split("\n")
      const currentRule = {
        alert: {},
        actions: [],
        explanation: "",
      }

      let currentSection = ""
      const alertData = {}

      lines.forEach((line) => {
        line = line.trim()

        if (line.startsWith("ALERT:")) {
          currentSection = "alert"
        } else if (line.startsWith("ADD ") || line.startsWith("REMOVE ")) {
          currentRule.actions.push(line)
        } else if (line.startsWith("Explanation:")) {
          currentSection = "explanation"
          currentRule.explanation = line.replace("Explanation:", "").trim()
        } else if (currentSection === "alert") {
          if (line.startsWith("Timestamp:")) {
            alertData.timestamp = line.replace("Timestamp:", "").trim()
          } else if (line.startsWith("Source IP:")) {
            alertData.sourceIP = line.replace("Source IP:", "").trim()
          } else if (line.startsWith("Destination IP:")) {
            alertData.destinationIP = line.replace("Destination IP:", "").trim()
          } else if (line.startsWith("Protocol:")) {
            alertData.protocol = line.replace("Protocol:", "").trim()
          } else if (line.startsWith("Signature:")) {
            alertData.signature = line.replace("Signature:", "").trim()
          } else if (line.startsWith("Severity:")) {
            alertData.severity = line.replace("Severity:", "").trim()
          }
        } else if (currentSection === "explanation" && line && !line.startsWith("Explanation:")) {
          currentRule.explanation += " " + line
        }
      })

      if (Object.keys(alertData).length > 0) {
        currentRule.alert = alertData
        rules.push(currentRule)
      }
    })

    return rules
  }

  useEffect(() => {
    const fetchData = () => {
      fetchRules().then((data) => {
        if (data.status === "success") {
          setRawRules(data.content)
          const parsed = parseRulesData(data.content)
          setParsedRules(parsed)
          setFilteredRules(parsed)
          setLastUpdated(new Date().toLocaleTimeString())
        }
      })
    }
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = parsedRules.filter(
        (rule) =>
          rule.alert.sourceIP?.includes(searchTerm) ||
          rule.alert.destinationIP?.includes(searchTerm) ||
          rule.alert.signature?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rule.actions.some((action) => action.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredRules(filtered)
    } else {
      setFilteredRules(parsedRules)
    }
  }, [parsedRules, searchTerm])

  const getSeverityColor = (severity) => {
    switch (Number.parseInt(severity)) {
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

  return (
    <div className="p-10 space-y-10 animate-fadeIn min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-3">Firewall Rules</h1>
          <p className="text-gray-400 text-lg">AI-generated security rule recommendations</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse-custom"></div>
          <span className="text-emerald-400 font-mono text-lg font-medium">{filteredRules.length} RULES</span>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="block text-white font-medium text-lg mb-4">Rule Search</label>
            <input
              type="text"
              placeholder="Search by IP, signature, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-white font-medium text-lg mb-4">Last Update</label>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-blue-400 font-mono">
              {lastUpdated || "--:--:--"}
            </div>
          </div>
          <div className="flex items-end">
            <Button variant="primary" className="w-full">
              Export Analysis
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">{filteredRules.length}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Total Rules</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {filteredRules.reduce((acc, rule) => acc + rule.actions.length, 0)}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Total Actions</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {filteredRules.filter((rule) => rule.alert.severity === "1").length}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">High Severity</div>
          </div>
        </Card>
      </div>

      {/* Rules Display */}
      <div className="space-y-8">
        {filteredRules.length > 0 ? (
          filteredRules.map((rule, index) => (
            <Card key={index}>
              {/* Alert Section */}
              <div className="mb-8 p-6 bg-red-500/10 rounded-xl border border-red-500/20">
                <h3 className="text-xl font-bold text-red-400 mb-4">ALERT #{index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                  <div>
                    <span className="text-gray-400 block mb-1">Timestamp:</span>
                    <span className="font-mono text-blue-400">{rule.alert.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Source IP:</span>
                    <span className="font-mono text-purple-400">{rule.alert.sourceIP}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Destination IP:</span>
                    <span className="font-mono text-purple-400">{rule.alert.destinationIP}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Protocol:</span>
                    <span className="font-mono text-white">{rule.alert.protocol}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Severity:</span>
                    <span className={`font-mono font-bold ${getSeverityColor(rule.alert.severity)}`}>
                      {rule.alert.severity}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-gray-400 block mb-2">Signature:</span>
                  <span className="text-white">{rule.alert.signature}</span>
                </div>
              </div>

              {/* Actions Section */}
              <div className="mb-8 p-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <h4 className="text-lg font-bold text-blue-400 mb-4">RECOMMENDED ACTIONS</h4>
                <div className="space-y-3">
                  {rule.actions.map((action, actionIndex) => (
                    <div key={actionIndex} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <code className="text-blue-400 font-mono text-sm">{action}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation Section */}
              <div className="p-6 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <h4 className="text-lg font-bold text-purple-400 mb-4">EXPLANATION</h4>
                <p className="text-gray-300 leading-relaxed">{rule.explanation}</p>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No rules match current filters</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Rules
