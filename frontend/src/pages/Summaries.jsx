"use client"

import { useEffect, useState } from "react"
import { fetchSummaries } from "../api/backend"
import Card from "../components/Card"
import Button from "../components/Button"

const Summaries = () => {
  const [rawSummary, setRawSummary] = useState("")
  const [parsedSummaries, setParsedSummaries] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSummaries, setFilteredSummaries] = useState([])

  // Parse the backend response into structured data
  const parseSummaryData = (rawData) => {
    const summaries = []
    const sections = rawData.split("---").filter((section) => section.trim())

    sections.forEach((section) => {
      const lines = section.trim().split("\n")
      const currentSummary = {
        timestamp: "",
        sourceIP: "",
        destIP: "",
        protocol: "",
        signature: "",
        severity: "",
        summary: "",
        explanation: "",
        actions: [],
      }

      let currentSection = ""

      lines.forEach((line) => {
        line = line.trim()

        // Parse the first line with timestamp and alert info
        if (line.match(/^\[.*\]/)) {
          const timestampMatch = line.match(/^\[(.*?)\]/)
          if (timestampMatch) {
            currentSummary.timestamp = timestampMatch[1]
          }

          const ipMatch = line.match(/(\d+\.\d+\.\d+\.\d+)\s*→\s*(\d+\.\d+\.\d+\.\d+)/)
          if (ipMatch) {
            currentSummary.sourceIP = ipMatch[1]
            currentSummary.destIP = ipMatch[2]
          }

          const protocolMatch = line.match(/\|\s*(\w+)\s*\|/)
          if (protocolMatch) {
            currentSummary.protocol = protocolMatch[1]
          }

          const signatureMatch = line.match(/\|\s*([^|]+)\s*$$Severity:\s*(\d+)$$/)
          if (signatureMatch) {
            currentSummary.signature = signatureMatch[1].trim()
            currentSummary.severity = signatureMatch[2]
          }
        } else if (line.startsWith("Summary:")) {
          currentSection = "summary"
          currentSummary.summary = line.replace("Summary:", "").trim()
        } else if (line.startsWith("Explanation:")) {
          currentSection = "explanation"
          currentSummary.explanation = line.replace("Explanation:", "").trim()
        } else if (line.startsWith("Recommended Actions:")) {
          currentSection = "actions"
        } else if (currentSection === "summary" && line && !line.startsWith("Explanation:")) {
          currentSummary.summary += " " + line
        } else if (currentSection === "explanation" && line && !line.startsWith("Recommended Actions:")) {
          currentSummary.explanation += " " + line
        } else if (currentSection === "actions" && line.match(/^\d+\./)) {
          currentSummary.actions.push(line)
        }
      })

      if (currentSummary.timestamp || currentSummary.sourceIP) {
        summaries.push(currentSummary)
      }
    })

    return summaries
  }

  useEffect(() => {
    const fetchData = () => {
      fetchSummaries().then((data) => {
        if (data.status === "success") {
          setRawSummary(data.content)
          const parsed = parseSummaryData(data.content)
          setParsedSummaries(parsed)
          setFilteredSummaries(parsed)
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
      const filtered = parsedSummaries.filter(
        (summary) =>
          summary.sourceIP?.includes(searchTerm) ||
          summary.destIP?.includes(searchTerm) ||
          summary.signature?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          summary.summary?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredSummaries(filtered)
    } else {
      setFilteredSummaries(parsedSummaries)
    }
  }, [parsedSummaries, searchTerm])

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

  const getSeverityLabel = (severity) => {
    switch (Number.parseInt(severity)) {
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

  return (
    <div className="p-10 space-y-10 animate-fadeIn min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-3">LLM Analysis</h1>
          <p className="text-gray-400 text-lg">AI-powered security analysis and recommendations</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse-custom"></div>
          <span className="text-purple-400 font-mono text-lg font-medium">{filteredSummaries.length} REPORTS</span>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="block text-white font-medium text-lg mb-4">Search Filter</label>
            <input
              type="text"
              placeholder="Search by IP, signature, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-white font-medium text-lg mb-4">Last Update</label>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-purple-400 font-mono">
              {lastUpdated || "--:--:--"}
            </div>
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
            <div className="text-3xl font-bold text-white mb-2">{filteredSummaries.length}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Total Summaries</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {filteredSummaries.filter((s) => s.severity === "1").length}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">High Severity</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {filteredSummaries.filter((s) => s.severity === "2").length}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Medium Severity</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {filteredSummaries.filter((s) => s.severity === "3").length}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Low Severity</div>
          </div>
        </Card>
      </div>

      {/* Summaries Display */}
      <div className="space-y-8">
        {filteredSummaries.length > 0 ? (
          filteredSummaries.map((summary, index) => (
            <Card key={index}>
              {/* Header Section */}
              <div className="mb-8 p-6 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-purple-400">ANALYSIS #{index + 1}</h3>
                  <span className={`font-mono text-sm font-bold ${getSeverityColor(summary.severity)}`}>
                    {getSeverityLabel(summary.severity)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                  <div>
                    <span className="text-gray-400 block mb-1">Timestamp:</span>
                    <span className="font-mono text-blue-400">
                      {summary.timestamp ? new Date(summary.timestamp).toLocaleString() : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Source IP:</span>
                    <span className="font-mono text-purple-400">{summary.sourceIP}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Destination IP:</span>
                    <span className="font-mono text-purple-400">{summary.destIP}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Protocol:</span>
                    <span className="font-mono text-white">{summary.protocol}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-gray-400 block mb-2">Signature:</span>
                  <span className="text-white">{summary.signature}</span>
                </div>
              </div>

              {/* Summary Section */}
              {summary.summary && (
                <div className="mb-8 p-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <h4 className="text-lg font-bold text-blue-400 mb-4">SUMMARY</h4>
                  <p className="text-gray-300 leading-relaxed">{summary.summary}</p>
                </div>
              )}

              {/* Explanation Section */}
              {summary.explanation && (
                <div className="mb-8 p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <h4 className="text-lg font-bold text-emerald-400 mb-4">EXPLANATION</h4>
                  <p className="text-gray-300 leading-relaxed">{summary.explanation}</p>
                </div>
              )}

              {/* Actions Section */}
              {summary.actions && summary.actions.length > 0 && (
                <div className="p-6 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <h4 className="text-lg font-bold text-yellow-400 mb-4">RECOMMENDED ACTIONS</h4>
                  <div className="space-y-3">
                    {summary.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-gray-300">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {rawSummary ? "No summaries match current filters" : "Loading LLM analysis..."}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Summaries
