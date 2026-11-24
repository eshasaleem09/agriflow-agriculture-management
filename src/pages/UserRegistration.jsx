import { useEffect, useState } from "react";
import {
  UserPlus,
  UserRound,
  Mail,
  LockKeyhole,
  Pencil,
  Trash2,
  Users,
  X,
  RefreshCw,
} from "lucide-react";

import { authApi } from "../app/redux/api/index.js";

const emptyForm = {
  fullName: "",
  username: "",
  email: "",
  password: "",
};

function UserRegistration() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // READ: Fetch all users
  async function fetchUsers() {
    try {
      setError("");

      const response = await authApi.getUsers();

      if (!response.data.succeeded) {
        throw new Error(response.data.message || "Unable to fetch users.");
      }

      setUsers(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // CREATE / UPDATE
  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setSaving(true);

    try {
      if (editingId) {
        const updateData = {
          fullName: formData.fullName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
        };

        if (formData.password.trim()) {
          updateData.password = formData.password;
        }

        const response = await authApi.updateUser(
          editingId,
          updateData
        );

        if (!response.data.succeeded) {
          throw new Error(response.data.message || "Update failed.");
        }

        setMessage("User updated successfully!");
      } else {
        const response = await authApi.register({
          fullName: formData.fullName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });

        if (!response.data.succeeded) {
          throw new Error(response.data.message || "Registration failed.");
        }

        setMessage("Manager account created successfully!");
      }

      setFormData(emptyForm);
      setEditingId(null);

      // Refresh list immediately
      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  // Prepare user for editing
  function handleEdit(user) {
    setEditingId(user.id);

    setFormData({
      fullName: user.fullName || "",
      username: user.username || "",
      email: user.email || "",
      password: "",
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData(emptyForm);
    setMessage("");
    setError("");
  }

  // DELETE
  async function handleDelete(user) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.fullName}?`
    );

    if (!confirmed) return;

    setDeletingId(user.id);
    setMessage("");
    setError("");

    try {
      const response = await authApi.deleteUser(user.id);

      if (!response.data.succeeded) {
        throw new Error(response.data.message || "Delete failed.");
      }

      setMessage("User deleted successfully!");

      if (editingId === user.id) {
        cancelEdit();
      }

      // Refresh list immediately
      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to delete user."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="user-registration-page user-management-page">
      <div className="user-management-container">

        <div className="user-management-heading">
          <div>
            <h2>User Management</h2>
            <p>Create, view, update and manage AgriFlow users.</p>
          </div>

          <button
            type="button"
            className="user-refresh-button"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* CREATE / UPDATE FORM */}
        <div className="registration-card user-management-form">
          <div className="registration-icon">
            {editingId ? <Pencil size={27} /> : <UserPlus size={27} />}
          </div>

          <h2>
            {editingId ? "Edit Manager Account" : "Register New Manager"}
          </h2>

          <p>
            {editingId
              ? "Update the manager's account information."
              : "Create a new AgriFlow manager account."}
          </p>

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

            <label>
              Password {editingId ? "(Leave blank to keep current password)" : ""}
            </label>

            <div className="registration-input">
              <LockKeyhole size={18} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={
                  editingId ? "Optional new password" : "Minimum 6 characters"
                }
                minLength={6}
                required={!editingId}
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
              disabled={saving}
            >
              {saving
                ? "Please wait..."
                : editingId
                  ? "Save Changes"
                  : "Create Manager Account"}
            </button>

            {editingId && (
              <button
                type="button"
                className="user-cancel-button"
                onClick={cancelEdit}
              >
                <X size={17} />
                Cancel Editing
              </button>
            )}
          </form>
        </div>

        {/* READ USERS */}
        <div className="user-list-card">
          <div className="user-list-heading">
            <div>
              <Users size={23} />
              <h2>Registered Users</h2>
            </div>

            <span className="user-count">
              {users.length} Users
            </span>
          </div>

          {loading ? (
            <p className="user-list-status">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="user-list-status">
              No registered users found.
            </p>
          ) : (
            <div className="user-table-wrapper">
              <table className="user-management-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.fullName}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>

                      <td>
                        <span className={`user-role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>

                      <td>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        {user.role?.toLowerCase() === "admin" ? (
                          <span className="protected-user-label">
                            Protected
                          </span>
                        ) : (
                          <div className="user-action-buttons">
                            <button
                              type="button"
                              className="user-edit-button"
                              title="Edit user"
                              onClick={() => handleEdit(user)}
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              className="user-delete-button"
                              title="Delete user"
                              onClick={() => handleDelete(user)}
                              disabled={deletingId === user.id}
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default UserRegistration;