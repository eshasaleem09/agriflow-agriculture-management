import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearActivity } from "../features/activity/activitySlice";
import {
  Activity,
  Search,
  Trash2,
  Clock,
  User,
  ClipboardList,
} from "lucide-react";

export default function ActivityLog() {
  const dispatch = useDispatch();

  const activities = useSelector((state) => state.activity || []);
  const user = useSelector((state) => state.auth?.user);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        (item.user || "").toLowerCase().includes(query) ||
        (item.entity || "").toLowerCase().includes(query) ||
        (item.details || "").toLowerCase().includes(query);

      const matchesAction =
        actionFilter === "All" || item.action === actionFilter;

      const matchesRole =
        roleFilter === "All" || item.role === roleFilter;

      return matchesSearch && matchesAction && matchesRole;
    });
  }, [activities, search, actionFilter, roleFilter]);

  const handleClearActivity = () => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all activity records? This cannot be undone."
    );

    if (confirmed) {
      dispatch(clearActivity());
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="page-container activity-page">
      <div className="page-header">
        <div>
          <h1>Activity Log</h1>
          <p>Track recent activities and changes across your farm.</p>
        </div>

        {isAdmin && activities.length > 0 && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleClearActivity}
          >
            <Trash2 size={16} />
            Clear Activity
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Activity size={22} />
          <div>
            <h3>{activities.length}</h3>
            <p>Total Activities</p>
          </div>
        </div>

        <div className="stat-card">
          <User size={22} />
          <div>
            <h3>
              {new Set(activities.map((item) => item.user)).size}
            </h3>
            <p>Active Users</p>
          </div>
        </div>

        <div className="stat-card">
          <Clock size={22} />
          <div>
            <h3>{activities.length ? "Recorded" : "None"}</h3>
            <p>Activity History</p>
          </div>
        </div>
      </div>

      <div className="activity-filters">
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by user, entity or details..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={actionFilter}
          onChange={(event) => setActionFilter(event.target.value)}
        >
          <option value="All">All Actions</option>
          <option value="Added">Added</option>
          <option value="Updated">Updated</option>
          <option value="Deleted">Deleted</option>
          <option value="Completed">Completed</option>
          <option value="Recorded usage">Recorded usage</option>
        </select>

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
        </select>
      </div>

      <div className="activity-list">
        {filteredActivities.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={42} />

            <h3>No activities found</h3>

            <p>
              {activities.length === 0
                ? "Activities will appear here when users make changes."
                : "Try changing your search or filters."}
            </p>
          </div>
        ) : (
          filteredActivities.map((item) => (
            <div className="activity-item" key={item.id}>
              <div className="activity-icon">
                <Activity size={18} />
              </div>

              <div className="activity-content">
                <h3>{item.details || "Activity recorded"}</h3>

                <div className="activity-meta">
                  <span>{item.user || "Unknown user"}</span>
                  <span>{item.role || "Unknown role"}</span>
                  <span>{item.entity || "Activity"}</span>
                </div>

                <small>{formatDate(item.timestamp)}</small>
              </div>

              <span className="activity-action">
                {item.action || "Activity"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}