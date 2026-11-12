import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Leaf, LockKeyhole, UserRound } from "lucide-react";

import { login } from "../features/auth/authSlice.js";
import { authApi } from "../app/redux/api/index.js";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await authApi.login({
        username: username.trim(),
        password,
      });

      const result = response.data;

      if (!result.succeeded || !result.user) {
        throw new Error(
          result.message || "Login failed."
        );
      }

      const user = result.user;

      // Save JWT token
      localStorage.setItem(
        "agriflow_token",
        user.token
      );

      // Convert backend role to frontend role format
      const frontendRole =
        user.role?.toLowerCase() === "admin"
          ? "Admin"
          : "Manager";

      // Preserve existing Redux login action
      dispatch(
        login({
          ...user,
          name: user.fullName || user.username,
          role: frontendRole,
        })
      );

      const destination =
        location.state?.from?.pathname || "/";

      navigate(destination, { replace: true });

    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.message ||
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form
        className="login-card"
        onSubmit={handleSubmit}
      >
        <div className="login-logo">
          <Leaf size={32} />
        </div>

        <h1>Welcome to AgriFlow</h1>

        <p className="login-subtitle">
          Sign in to manage your farm
        </p>

        <label htmlFor="username">
          Username or Email
        </label>

        <div className="login-input">
          <UserRound size={18} />

          <input
            id="username"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            placeholder="Enter username or email"
            autoComplete="username"
            required
          />
        </div>

        <label htmlFor="password">
          Password
        </label>

        <div className="login-input">
          <LockKeyhole size={18} />

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter password"
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        <button
          className="login-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default Login;