import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Image from "../../assets/signup.jpg";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 6) {
      newErrors.name = "Name must be at least 6 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one special character";
    }

    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear server error when user starts typing
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const response = await axios.post('https://online-hotel-booking-system-bf2k.onrender.com/users/create', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Full response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      // Check for successful response (201 Created or 200 OK)
      if (response.status === 201 || response.status === 200) {
        // Check if response has success flag or just successful status
        if (response.data.success === false) {
          // Handle business logic error
          setServerError(response.data.message || "Registration failed");
        } else {
          // Success - show message and redirect
          alert('User registered successfully! Please login.');
          navigate('/login');
        }
      } else {
        setServerError("Unexpected response from server");
      }
      
    } catch (error) {
      console.error('Error details:', error);
      
      // Handle different error scenarios
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.status === 409) {
          setServerError("Email already exists. Please use a different email or login.");
        } else if (error.response.status === 400) {
          // Check if the response has a message
          const errorMessage = error.response.data?.message || 
                               error.response.data?.error || 
                               "Invalid input. Please check your details.";
          setServerError(errorMessage);
        } else if (error.response.status === 500) {
          setServerError("Server error. Please try again later.");
        } else {
          setServerError(error.response.data?.message || "Registration failed. Please try again.");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setServerError("Cannot connect to server. Please check if the backend is running.");
      } else {
        // Something happened in setting up the request
        console.error('Error:', error.message);
        setServerError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex justify-stretch">
            <img
              className="object-cover rounded-lg"
              src={Image}
              alt="Signup"
            />
          </div>
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
              Sign up for an account
            </h2>
            
            {/* Display server errors */}
            {serverError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {serverError}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    disabled={loading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                    onChange={handleChange}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
                </div>
                
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                    onChange={handleChange}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
                </div>
                
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                    onChange={handleChange}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
                </div>
                
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    autoComplete="role"
                    required
                    disabled={loading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                    onChange={handleChange}
                    value={formData.role}
                  >
                    <option value="">Select Role</option>
                    <option value="HOTELMANAGER">HOTEL MANAGER</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                  </select>
                  {errors.role && <p className="text-red-500 text-sm mt-2">{errors.role}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Note: ADMIN role can only be assigned by existing administrators.
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                  Login Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
