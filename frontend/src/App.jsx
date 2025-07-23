import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"
import Alerts from "./pages/Alerts"
import Rules from "./pages/Rules"
import Summaries from "./pages/Summaries"

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-dark-950">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/summaries" element={<Summaries />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App
