import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
// Import the local image from assets folder
import signupImage from "../assets/signup-image.png"

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // --- Validation ---
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      // The API endpoint should be configured in a more flexible way, e.g., environment variables
      const response = await axios.post("http://localhost:8000/api/user/signup/", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      if (response.data && response.data.token) {
        setSuccess("Signup successful! You can now sign in.")
        // Store the token. Note: for production apps, consider more secure storage like HttpOnly cookies.
        localStorage.setItem("token", response.data.token)
        // Clear form
        setFormData({ name: "", email: "", password: "", confirmPassword: "" })
      } else {
        // This case might not be reached if the server always returns a structured error
        setError("An unexpected error occurred during signup.")
      }
    } catch (err) {
      console.error("Signup error:", err)
      // Extract error message from server response if available
      setError(err.response?.data?.error || "Something went wrong on the server.")
    }
  }

  const handleSignIn = () => {
    navigate("/signin")
  }

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* Left image section */}
      <div className="w-1/2 hidden md:block relative">
        <img
          src={signupImage || "/placeholder.svg"}
          alt="Event Hive Signup Background"
          className="absolute inset-0 w-full h-full object-cover rounded-r-3xl"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = "/placeholder.svg?height=1000&width=800&text=Event+Hive"
          }}
        />
        <div className="relative h-full w-full flex flex-col justify-center items-center bg-black bg-opacity-50 text-white text-center px-8 rounded-r-3xl">
          <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
          <p className="mb-6 max-w-sm">To keep connected with us, please login with your personal info.</p>
          <button 
            onClick={handleSignIn}
            className="bg-white text-purple-600 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 ease-in-out"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Right signup form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-600 text-center">
            Event <span className="text-purple-600">Hive</span>
          </h3>
          <h1 className="text-4xl font-bold mt-2 mb-6 text-center text-gray-800">Create Account</h1>

          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">YOUR NAME</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">YOUR EMAIL</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">PASSWORD</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">CONFIRM PASSWORD</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm font-semibold text-center">{error}</p>}
            {success && <p className="text-green-500 text-sm font-semibold text-center">{success}</p>}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-300 ease-in-out shadow-md"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup