import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
// Import the local image from assets folder
import signinImage from "../../src/assets/signin-image.png"

const Signin = () => {
  // State for form inputs
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // State for handling errors and success messages from the API
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Handles changes in the input fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // API endpoint for user login
      const url = "http://localhost:8000/api/user/login/"
      // Making a POST request with email and password
      const response = await axios.post(url, {
        email: formData.email,
        password: formData.password,
      })

      // If the request is successful and we get a token
      if (response.data && response.data.token) {
        setSuccess("Login successful! Redirecting...")
        // Store the token in localStorage for session management
        localStorage.setItem("token", response.data.token)
        
        // Redirect to user dashboard
        setTimeout(() => {
          navigate("/userdashboard")
        }, 1000) // Small delay to show success message
      } else {
        setError("Login failed. Please check your credentials.")
      }
    } catch (err) {
      // Handle errors from the API call
      console.error("Login error:", err)
      setError(err.response?.data?.error || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = () => {
    navigate("/signup")
  }

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left side: The Sign-in Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <h3 className="text-lg font-semibold text-gray-700 text-left">
            Event <span className="text-purple-600">Hive</span>
          </h3>

          {/* Main Title */}
          <h1 className="text-4xl font-bold mt-4 mb-8 text-left text-gray-900">
            Sign In to Event Hive
          </h1>

          {/* The Form */}
          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                YOUR EMAIL
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full bg-white border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 text-sm font-bold" htmlFor="password">
                  PASSWORD
                </label>
                <a href="#" className="text-sm text-purple-600 hover:underline">
                  Forgot your password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full bg-white border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                required
              />
            </div>

            {/* Error and Success Messages */}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-green-500 text-sm text-center">{success}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white font-bold py-3 rounded-md hover:bg-purple-700 transition duration-300 ease-in-out disabled:bg-purple-400"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      {/* Right side: The Image and Welcome Message */}
      <div className="w-1/2 hidden md:flex flex-col justify-center items-center text-white p-10 rounded-l-3xl relative">
        {/* Background Image */}
        <img
          src={signinImage || "/placeholder.svg"}
          alt="Sign In Background"
          className="absolute inset-0 w-full h-full object-cover rounded-l-3xl opacity-70"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = "/placeholder.svg?height=1000&width=800&text=Event+Hive"
          }}
        />

        {/* Content Overlay */}
        <div className="bg-black bg-opacity-50 rounded-2xl p-10 text-center flex flex-col items-center relative z-10">
          <h2 className="text-4xl font-bold mb-4">Hello, Friend!</h2>
          <p className="mb-8 max-w-sm">
            To keep connected with us please login with your personal info
          </p>
          <button
            onClick={handleSignUp}
            className="bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-md hover:bg-white hover:text-black transition-all duration-300"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}

export default Signin