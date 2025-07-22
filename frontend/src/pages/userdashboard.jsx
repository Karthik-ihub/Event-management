import { useState, useEffect } from "react"
import { Calendar, MapPin, Clock, Instagram, Facebook, Twitter, Search } from "lucide-react"

const UserDashboard = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    date: "",
  })

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("authToken") || ""
  }

  useEffect(() => {
    fetchEvents()
  }, [filters])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) {
        setError("Please login to view events")
        setLoading(false)
        return
      }

      // Build query parameters
      const params = new URLSearchParams()
      if (filters.type) params.append("type", filters.type)
      if (filters.location) params.append("location", filters.location)
      if (filters.date) params.append("date", filters.date)

      const url = `http://localhost:8000/api/user/events/${params.toString() ? "?" + params.toString() : ""}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.status === 401) {
        setError("Session expired. Please login again.")
        return
      }

      if (response.status === 403) {
        setError("Access denied. User role required.")
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setEvents(data.events || [])

      if (data.events?.length === 0) {
        setError("No events found matching your criteria")
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setError("Failed to fetch events. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const handleLogin = () => {
    window.location.href = "/login"
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    window.location.href = "/login"
  }

  // Loading skeleton component
  const EventCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded mb-1"></div>
        <div className="h-3 bg-gray-200 rounded"></div>
      </div>
    </div>
  )

  // Event card component
  const EventCard = ({ event, index }) => (
    <div
      key={index}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-48">
        <img
          src={event.image || `https://via.placeholder.com/300x200?text=Event+${index + 1}`}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-3 right-3 px-2.5 py-0.5 text-xs font-semibold rounded-full text-white ${
            event.cost_type === "paid" ? "bg-purple-600" : "bg-green-600"
          }`}
        >
          {event.cost_type === "paid" ? "Paid" : "Free"}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.title}</h3>
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(event.start_date)} - {formatDate(event.end_date)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{event.time}</span>
          </div>
        </div>
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
          Book Now
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-black">Event</span>
              <span className="text-2xl font-bold text-purple-600">Hive</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, User!</span>
              <button onClick={handleLogout} className="text-gray-600 hover:text-purple-600 font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img
          src="/src/assets/madeforthosewhodo.png"
          alt="Made for those who do - Event crowd"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">MADE FOR THOSE</h1>
            <h1 className="text-4xl md:text-6xl font-bold">WHO DO</h1>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Upcoming <span className="text-purple-600">Events</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Date Filter */}
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
              >
                <option value="">All Dates</option>
                <option value={new Date().toISOString().split("T")[0]}>Today</option>
                <option value={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}>
                  This Week
                </option>
              </select>

              {/* Type Filter */}
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="">All Types</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>

              {/* Location Filter */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search location..."
                  className="border border-gray-300 rounded-lg px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              {error.includes("login") && (
                <button
                  onClick={handleLogin}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg"
                >
                  Login Now
                </button>
              )}
            </div>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <EventCard key={index} event={event} index={index} />
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-8">
              <button className="border border-purple-600 text-purple-600 hover:bg-purple-50 font-medium py-2 px-6 rounded-lg transition-colors duration-200">
                Load More Events
              </button>
            </div>
          </>
        ) : (
          !error && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-gray-500 text-lg">No events found matching your criteria</p>
              <button
                onClick={() => setFilters({ type: "", location: "", date: "" })}
                className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 to-blue-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-3xl font-bold">Event</span>
              <span className="text-3xl font-bold text-purple-300">Hive</span>
            </div>
            <p className="text-purple-200 mb-6">Discover and book amazing events</p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200">
              Get Started
            </button>
          </div>

          <div className="flex flex-wrap justify-center items-center space-x-8 mb-8 text-sm">
            <a href="#" className="hover:text-purple-300 transition-colors">
              Home
            </a>
            <a href="#" className="hover:text-purple-300 transition-colors">
              About
            </a>
            <a href="#" className="hover:text-purple-300 transition-colors">
              Services
            </a>
            <a href="#" className="hover:text-purple-300 transition-colors">
              Get In Touch
            </a>
            <a href="#" className="hover:text-purple-300 transition-colors">
              FAQs
            </a>
          </div>

          <div className="flex justify-center space-x-6 mb-8">
            <a href="#" className="text-purple-300 hover:text-white transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" className="text-purple-300 hover:text-white transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" className="text-purple-300 hover:text-white transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
          </div>

          <div className="text-center text-sm text-purple-300 border-t border-purple-800 pt-6">
            <p>Your Copyright Text 2024 | Website by Somewhere</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default UserDashboard