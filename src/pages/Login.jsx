import { useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Leaf, LockKeyhole, UserRound } from "lucide-react";
import { login } from "../features/auth/authSlice.js";
import { useSelector } from "react-redux";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Manager");
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const demoUsers = {
      Admin: {
        username: "admin",
        password: "Admin@123",
      },
      Manager: {
        username: "manager",
        password: "Manager@123",
      },
    };

    const selectedUser = demoUsers[role];

    if (
      username.trim() !== selectedUser.username ||
      password !== selectedUser.password
    ) {
      setError("Invalid username or password.");
      return;
    }

    dispatch(
      login({
        username: selectedUser.username,
        name: role === "Admin" ? "Farm Administrator" : "Farm Manager",
        role,
      })
    );

    const destination = location.state?.from?.pathname || "/";
    navigate(destination, { replace: true });
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <Leaf size={32} />
        </div>

        <h1>Welcome to AgriFlow</h1>
        <p className="login-subtitle">
          Sign in to manage your farm
        </p>

        <label htmlFor="role">Login as</label>
        <select
          id="role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          <option value="Admin">Administrator</option>
          <option value="Manager">Farm Manager</option>
        </select>

        <label htmlFor="username">Username</label>
        <div className="login-input">
          <UserRound size={18} />
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter username"
            autoComplete="username"
            required
          />
        </div>

        <label htmlFor="password">Password</label>
        <div className="login-input">
          <LockKeyhole size={18} />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button className="login-submit" type="submit">
          Sign In
        </button>

        <div className="demo-credentials">
          <strong>Demo credentials</strong>
          <p>Admin: admin / Admin@123</p>
          <p>Manager: manager / Manager@123</p>
        </div>
      </form>
    </div>
  );
}

export default Login;