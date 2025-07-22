import { useState, useEffect } from "react"
import axios from "axios"
import { Calendar, MapPin, Plus, LogOut } from "lucide-react"
import purpleImage from "../assets/purpleimage.png"

const Dashboard = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [adminEmail, setAdminEmail] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        window.location.href = "/adminsignin"
        return
      }

      const response = await axios.get("http://localhost:8000/api/admin/dashboard/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.data && response.data.events) {
        setEvents(response.data.events)
        try {
          const payload = JSON.parse(atob(token.split(".")[1]))
          setAdminEmail(payload.email || "Admin")
        } catch (e) {
          setAdminEmail("Admin")
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err)
      if (err.response?.status === 401) {
        localStorage.removeItem("adminToken")
        window.location.href = "/adminsignin"
      } else {
        setError(err.response?.data?.error || "Failed to load dashboard data")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    window.location.href = "/adminsignin"
  }

  const handleCreateEvent = () => {
    window.location.href = "/create-event"
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateWithTime = (startDate, endDate, time) => {
    const start = formatDate(startDate)
    const end = formatDate(endDate)

    if (start === end) {
      return `${start} ${time || ""}`
    }
    return `${start} - ${end} ${time || ""}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Event <span className="text-purple-600">Hive</span>
              </h1>
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateEvent}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Event</span>
              </button>
              <span className="text-sm text-gray-600">Welcome, {adminEmail}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image Section - Aligned with content below */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative overflow-hidden rounded-lg">
          <img 
            src={purpleImage || "/placeholder.svg"} 
            alt="Event Hero" 
            className="w-full h-96 object-cover" 
          />
        </div>
      </div>

      {/* Listed Events Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Listed Events</h3>
        </div>

        {error && (
          <div className="mb-6 px-6 py-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first event.</p>
            <button
              onClick={handleCreateEvent}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Event Image */}
                <div className="relative h-48 bg-gray-200">
                  {event.image ? (
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=192&width=320"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-white opacity-50" />
                    </div>
                  )}

                  {/* Cost Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.cost_type === "paid" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {event.cost_type === "paid" ? "PAID" : "FREE"}
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {event.title || "Untitled Event"}
                  </h4>

                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-600">
                        {formatDateWithTime(event.start_date, event.end_date, event.time)}
                      </span>
                    </div>

                    {event.venue && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue}</span>
                      </div>
                    )}
                  </div>

                  {event.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">ONLINE EVENT - Attend anywhere</span>
                    <button className="text-purple-600 hover:text-purple-800 font-medium text-sm">Edit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard