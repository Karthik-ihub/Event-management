import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for React Router
import { Upload } from "lucide-react";
import axios from "axios";

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    eventTitle: "",
    eventVenue: "",
    startTime: "",
    endTime: "",
    startDate: "",
    endDate: "",
    eventCost: "",
    eventDescription: "",
    eventImage: null as File | null,
  });

  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        eventImage: file,
      }));
    }
  };

  const handleGenerateDescription = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      alert("You are not authorized. Please log in.");
      return;
    }

    if (
      !formData.eventTitle ||
      !formData.eventVenue ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.startTime ||
      !formData.endTime
    ) {
      alert("Please fill in all required fields before generating a description.");
      return;
    }

    const costType = formData.eventCost && parseFloat(formData.eventCost) > 0 ? "paid" : "free";
    const timeRange = `${formData.startTime} - ${formData.endTime}`;

    try {
      const response = await axios.post(
        "http://localhost:8000/api/admin/generate-description/",
        {
          title: formData.eventTitle,
          venue: formData.eventVenue,
          start_date: formData.startDate,
          end_date: formData.endDate,
          time: timeRange,
          cost_type: costType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFormData((prev) => ({
        ...prev,
        eventDescription: response.data.description,
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Failed to generate description.";
        alert(`Error: ${errorMessage}`);
        console.error("Error generating description:", error.response?.data);
      } else {
        alert("An unexpected error occurred while generating the description.");
        console.error("Error generating description:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("adminToken");
    if (!token) {
      alert("You are not authorized. Please log in.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.eventTitle);
    data.append("venue", formData.eventVenue);
    data.append("start_date", formData.startDate);
    data.append("end_date", formData.endDate);
    const timeRange = `${formData.startTime} - ${formData.endTime}`;
    data.append("time", timeRange);
    const costType = formData.eventCost && parseFloat(formData.eventCost) > 0 ? "paid" : "free";
    data.append("cost_type", costType);
    data.append("description", formData.eventDescription);

    if (formData.eventImage) {
      data.append("image", formData.eventImage);
    } else {
      alert("Please upload an event image.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/admin/events/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Event created successfully!");
      console.log("Server response:", response.data);

      // Redirect to /dashboard using useNavigate
      navigate("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "An unexpected error occurred.";
        alert(`Error creating event: ${errorMessage}`);
        console.error("Error creating event:", error.response?.data);
      } else {
        alert("An unexpected error occurred.");
        console.error("Error creating event:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Event <span className="text-purple-600">Hive</span>
          </h1>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Create Event</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Title */}
            <div>
              <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Event Title
              </label>
              <input
                type="text"
                id="eventTitle"
                name="eventTitle"
                value={formData.eventTitle}
                onChange={handleInputChange}
                placeholder="Enter your event"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Event Venue */}
            <div>
              <label htmlFor="eventVenue" className="block text-sm font-medium text-gray-700 mb-2">
                Event Venue
              </label>
              <input
                type="text"
                id="eventVenue"
                name="eventVenue"
                value={formData.eventVenue}
                onChange={handleInputChange}
                placeholder="Enter venue address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start time
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End time
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Event Cost */}
            <div>
              <label htmlFor="eventCost" className="block text-sm font-medium text-gray-700 mb-2">
                Event Cost (enter 0 for free)
              </label>
              <input
                type="number"
                id="eventCost"
                name="eventCost"
                value={formData.eventCost}
                onChange={handleInputChange}
                placeholder="Enter the cost of the event in INR"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Event Description Section */}
            <div className="pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Event Description</h3>

              {/* Event Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium">
                      {formData.eventImage ? formData.eventImage.name : "Upload Here"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Generate AI Description Button */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none"
                >
                  Generate AI Description
                </button>
              </div>

              {/* Event Description */}
              <div>
                <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Description
                </label>
                <textarea
                  id="eventDescription"
                  name="eventDescription"
                  value={formData.eventDescription}
                  onChange={handleInputChange}
                  placeholder="Type here or generate an AI description..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 outline-none"
              >
                Create event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}