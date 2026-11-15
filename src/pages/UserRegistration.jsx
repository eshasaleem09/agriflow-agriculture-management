import { useState } from "react";
import { authApi } from "../app/redux/api/index.js";
import { UserPlus, UserRound, Mail, LockKeyhole } from "lucide-react";

function UserRegistration() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await authApi.register({
        ...formData,
      });

      const result = response.data;

      if (!result.succeeded) {
        throw new Error(result.message || "Registration failed.");
      }

      setMessage("Manager account created successfully!");

      setFormData({
        fullName: "",
        username: "",
        email: "",
        password: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to register user."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="user-registration-page">
      <div className="registration-card">
        <div className="registration-icon">
          <UserPlus size={30} />
        </div>

        <h2>Register New Manager</h2>

        <p>Create a new AgriFlow manager account.</p>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <div className="registration-input">
            <UserRound size={18} />
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <label>Username</label>
          <div className="registration-input">
            <UserRound size={18} />
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>

          <label>Email</label>
          <div className="registration-input">
            <Mail size={18} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <label>Password</label>
          <div className="registration-input">
            <LockKeyhole size={18} />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
          </div>

          {message && (
            <p className="registration-success">{message}</p>
          )}

          {error && (
            <p className="registration-error">{error}</p>
          )}

          <button
            type="submit"
            className="registration-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Manager Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserRegistration;