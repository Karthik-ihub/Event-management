import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Instagram, Facebook, Twitter, Search, Linkedin } from "lucide-react";
import heroImage from "../assets/madeforthosewhodo.png";

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    date: "",
  });

  const getAuthToken = () => localStorage.getItem("authToken") || "";

  // This useEffect triggers a fetch whenever the filters change
  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Please login to view events");
        setLoading(false);
        return;
      }

      // Build query string from active filters
      const query = new URLSearchParams();
      if (filters.type) query.append('type', filters.type);
      if (filters.location) query.append('location', filters.location);
      if (filters.date) query.append('date', filters.date);
      const queryString = query.toString();
      
      const url = `http://localhost:8000/api/user/dashboard/${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        setError("Session expired. Please login again.");
        setTimeout(() => { window.location.href = "/login"; }, 2000);
        return;
      }
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setEvents(data.events || []);

      if (data.events?.length === 0) {
        // No error, just no results
      }
    } catch (error) {
      console.error("Error fetching events:", error.message);
      setError("Failed to fetch events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleLogin = () => window.location.href = "/login";
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };
  
  // Skeleton for loading state
  const EventCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-6"></div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );

  // UPDATED Event card component to match your design
  const EventCard = ({ event }) => {
    // Format date to match "Saturday, March 18, 9.30PM"
    const formatEventDate = (dateString) => {
      if (!dateString) return "Date not available";
      const date = new Date(dateString);
      const options = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      };
      // A small regex to remove the :00 for even hours if needed, and make PM/AM uppercase
      return new Intl.DateTimeFormat('en-US', options).format(date).replace(' at ', ', ').replace(':00', '');
    };

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
        <div className="relative">
          <img
            src={event.image || `https://via.placeholder.com/400x250?text=Event+Image`}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
          <span className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs font-semibold px-2 py-1 rounded">
            {event.cost_type ? event.cost_type.toUpperCase() : 'FREE'}
          </span>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 h-14">{event.title}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {formatEventDate(event.start_date)}
          </p>
          <div className="mt-auto flex justify-between items-center">
            <p className="text-sm text-gray-500 truncate pr-2">{`ONLINE EVENT - ${event.venue}`}</p>
            {event.cost_type === 'paid' ? (
              <div className="bg-purple-600 text-white font-bold text-sm py-2 px-4 rounded whitespace-nowrap">
                {`${event.price || 'N/A'} INR`}
              </div>
            ) : (
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors whitespace-nowrap">
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative overflow-hidden rounded-lg">
          <img src={heroImage || "/placeholder.svg"} alt="Event crowd" className="w-full h-96 object-cover"/>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming <span className="text-purple-600">Events</span></h2>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Date Filter (Simplified values) */}
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
              </select>
              {/* Type Filter */}
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
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
                  className="border border-gray-300 rounded-lg px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-purple-500"
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            {error.includes("login") && (
              <button onClick={handleLogin} className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg">
                Login Now
              </button>
            )}
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => <EventCard key={event.id || index} event={event} />)}
          </div>
        ) : (
          !error && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No events found matching your criteria</p>
              <button onClick={() => setFilters({ type: "", location: "", date: "" })} className="mt-4 text-purple-600 hover:text-purple-700 font-medium">
                Clear Filters
              </button>
            </div>
          )
        )}
      </main>

      {/* UPDATED Footer to match your design */}
      <footer className="bg-[#0f0b30] text-white py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center space-x-1 mb-4">
              <span className="text-3xl font-bold">Event</span>
              <span className="text-3xl font-bold text-purple-400">Hive</span>
            </div>
            <form className="mt-4 max-w-md mx-auto flex" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your mail"
                className="w-full px-4 py-3 text-gray-800 bg-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-r-md transition-colors">
                Subscribe
              </button>
            </form>
          </div>

          <div className="flex justify-center flex-wrap gap-x-8 gap-y-2 mb-8 text-sm text-gray-300">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Services</a>
            <a href="#" className="hover:text-white transition-colors">Get in touch</a>
            <a href="#" className="hover:text-white transition-colors">FAQs</a>
          </div>

          <hr className="border-gray-700" />

          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-sm text-gray-400 gap-6">
            <div className="flex items-center space-x-4">
              <button className="bg-white text-[#0f0b30] px-3 py-1 rounded-md text-xs font-bold">English</button>
              <a href="#" className="hover:text-white">French</a>
              <a href="#" className="hover:text-white">Hindi</a>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="hover:text-white"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white"><Facebook className="w-5 h-5" /></a>
            </div>
            <p className="text-center sm:text-right">Non Copyrighted ® 2023 Upload by EventHive</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;