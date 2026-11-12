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
  Plus,
  Pencil,
  CheckCircle2,
  Package,
  Filter,
  X,
} from "lucide-react";

export default function ActivityLog() {
  const dispatch = useDispatch();

  const activities = useSelector((state) => state.activity || []);
  const user = useSelector((state) => state.auth?.user);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");

  const isAdmin =
    String(user?.role || "").toLowerCase() === "admin";

  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        String(item.user || "").toLowerCase().includes(query) ||
        String(item.entity || "").toLowerCase().includes(query) ||
        String(item.details || "").toLowerCase().includes(query);

      const matchesAction =
        actionFilter === "All" ||
        String(item.action || "").toLowerCase() ===
          actionFilter.toLowerCase();

      const matchesRole =
        roleFilter === "All" ||
        String(item.role || "").toLowerCase() ===
          roleFilter.toLowerCase();

      return matchesSearch && matchesAction && matchesRole;
    });
  }, [activities, search, actionFilter, roleFilter]);

  const handleClearActivity = () => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all activity records?"
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

  const getActionClass = (action) => {
    const value = String(action || "").toLowerCase();

    if (value.includes("add") || value.includes("creat")) {
      return "activity-badge-added";
    }

    if (value.includes("updat") || value.includes("edit")) {
      return "activity-badge-updated";
    }

    if (value.includes("delet") || value.includes("remov")) {
      return "activity-badge-deleted";
    }

    if (value.includes("complet")) {
      return "activity-badge-completed";
    }

    return "activity-badge-default";
  };

  const getActionIcon = (action) => {
    const value = String(action || "").toLowerCase();

    if (value.includes("add") || value.includes("creat")) {
      return <Plus size={17} />;
    }

    if (value.includes("updat") || value.includes("edit")) {
      return <Pencil size={17} />;
    }

    if (value.includes("delet") || value.includes("remov")) {
      return <Trash2 size={17} />;
    }

    if (value.includes("complet")) {
      return <CheckCircle2 size={17} />;
    }

    return <Activity size={17} />;
  };

  const activeUsers = new Set(
    activities.map((item) => item.user).filter(Boolean)
  ).size;

  const todayActivities = activities.filter((item) => {
    if (!item.timestamp) return false;

    const date = new Date(item.timestamp);
    const today = new Date();

    return date.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="page-container activity-page">

      <style>{`

        .activity-page {
          padding-bottom: 35px;
        }

        .activity-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .activity-heading h1 {
          font-size: 28px;
          font-weight: 750;
          margin: 0 0 8px;
        }

        .activity-heading p {
          margin: 0;
          opacity: .65;
          font-size: 14px;
        }

        .activity-clear-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 11px 17px;
          border: none;
          border-radius: 10px;
          background: #dc4444;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: .2s;
        }

        .activity-clear-btn:hover {
          background: #bd2929;
          transform: translateY(-2px);
        }

        .activity-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 25px;
        }

        .activity-stat-card {
          display: flex;
          align-items: center;
          gap: 17px;
          padding: 22px;
          border-radius: 15px;
          border: 1px solid var(--border-color, rgba(128,128,128,.2));
          background: var(--card-bg, rgba(128,128,128,.04));
          transition: .2s;
        }

        .activity-stat-card:hover {
          transform: translateY(-3px);
        }

        .activity-stat-icon {
          width: 49px;
          height: 49px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          flex-shrink: 0;
        }

        .activity-stat-icon.purple {
          background: rgba(139,92,246,.13);
          color: #a78bfa;
        }

        .activity-stat-icon.blue {
          background: rgba(59,130,246,.13);
          color: #60a5fa;
        }

        .activity-stat-icon.orange {
          background: rgba(249,115,22,.13);
          color: #fb923c;
        }

        .activity-stat-card h3 {
          font-size: 25px;
          font-weight: 750;
          margin: 0 0 4px;
        }

        .activity-stat-card p {
          font-size: 13px;
          opacity: .65;
          margin: 0;
        }

        .activity-toolbar {
          display: flex;
          gap: 13px;
          align-items: center;
          flex-wrap: wrap;
          padding: 17px;
          border: 1px solid var(--border-color, rgba(128,128,128,.2));
          background: var(--card-bg, rgba(128,128,128,.04));
          border-radius: 14px;
          margin-bottom: 22px;
        }

        .activity-search {
          flex: 1;
          min-width: 220px;
          position: relative;
        }

        .activity-search svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          opacity: .55;
        }

        .activity-search input,
        .activity-toolbar select {
          width: 100%;
          height: 43px;
          border: 1px solid var(--border-color, rgba(128,128,128,.25));
          background: var(--input-bg, transparent);
          color: inherit;
          border-radius: 9px;
          outline: none;
          font-size: 13px;
        }

        .activity-search input {
          padding: 0 38px;
        }

        .activity-toolbar select {
          width: 155px;
          padding: 0 12px;
        }

        .activity-search input:focus,
        .activity-toolbar select:focus {
          border-color: #8b5cf6;
        }

        .activity-reset {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border-color, rgba(128,128,128,.25));
          border-radius: 9px;
          background: transparent;
          color: inherit;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .activity-section {
          border: 1px solid var(--border-color, rgba(128,128,128,.2));
          background: var(--card-bg, rgba(128,128,128,.04));
          border-radius: 15px;
          overflow: hidden;
        }

        .activity-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 22px;
          border-bottom: 1px solid var(--border-color, rgba(128,128,128,.2));
          gap: 12px;
        }

        .activity-section-header h2 {
          font-size: 17px;
          margin: 0;
          font-weight: 700;
        }

        .activity-count {
          font-size: 12px;
          padding: 6px 11px;
          border-radius: 20px;
          background: rgba(139,92,246,.13);
          color: #a78bfa;
          font-weight: 650;
        }

        .activity-timeline {
          padding: 5px 22px;
        }

        .activity-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 0;
          border-bottom: 1px solid var(--border-color, rgba(128,128,128,.15));
        }

        .activity-row:last-child {
          border-bottom: none;
        }

        .activity-row-icon {
          width: 41px;
          height: 41px;
          flex-shrink: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(139,92,246,.13);
          color: #a78bfa;
        }

        .activity-row-main {
          flex: 1;
          min-width: 0;
        }

        .activity-row-main h3 {
          font-size: 14px;
          font-weight: 650;
          margin: 2px 0 10px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .activity-row-meta {
          display: flex;
          gap: 13px;
          flex-wrap: wrap;
          align-items: center;
          font-size: 12px;
          opacity: .7;
        }

        .activity-row-meta span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .activity-date {
          display: block;
          margin-top: 10px;
          font-size: 11px;
          opacity: .55;
        }

        .activity-action-badge {
          flex-shrink: 0;
          padding: 7px 11px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .activity-badge-added {
          color: #22c55e;
          background: rgba(34,197,94,.12);
        }

        .activity-badge-updated {
          color: #60a5fa;
          background: rgba(59,130,246,.12);
        }

        .activity-badge-deleted {
          color: #f87171;
          background: rgba(239,68,68,.12);
        }

        .activity-badge-completed {
          color: #a78bfa;
          background: rgba(139,92,246,.12);
        }

        .activity-badge-default {
          color: #f59e0b;
          background: rgba(245,158,11,.12);
        }

        .activity-empty {
          padding: 65px 20px;
          text-align: center;
        }

        .activity-empty-icon {
          width: 65px;
          height: 65px;
          margin: 0 auto 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: rgba(139,92,246,.12);
          color: #a78bfa;
        }

        .activity-empty h3 {
          margin: 0 0 8px;
          font-size: 17px;
        }

        .activity-empty p {
          margin: 0;
          font-size: 13px;
          opacity: .6;
        }

        @media(max-width: 750px) {
          .activity-stats {
            grid-template-columns: 1fr;
          }

          .activity-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .activity-search {
            width: 100%;
          }

          .activity-toolbar select {
            width: 100%;
          }

          .activity-reset {
            width: 100%;
          }
        }

        @media(max-width: 480px) {
          .activity-row {
            flex-wrap: wrap;
          }

          .activity-action-badge {
            margin-left: 57px;
          }

          .activity-heading h1 {
            font-size: 23px;
          }

          .activity-section-header {
            padding: 16px;
          }

          .activity-timeline {
            padding: 5px 15px;
          }
        }

      `}</style>

      {/* HEADER */}

      <div className="activity-heading">
        <div>
          <h1>Activity Log</h1>
          <p>
            Monitor and track all activities across your farm.
          </p>
        </div>

        {isAdmin && activities.length > 0 && (
          <button
            type="button"
            className="activity-clear-btn"
            onClick={handleClearActivity}
          >
            <Trash2 size={16} />
            Clear History
          </button>
        )}
      </div>

      {/* STATISTICS */}

      <div className="activity-stats">

        <div className="activity-stat-card">
          <div className="activity-stat-icon purple">
            <Activity size={23} />
          </div>

          <div>
            <h3>{activities.length}</h3>
            <p>Total Activities</p>
          </div>
        </div>

        <div className="activity-stat-card">
          <div className="activity-stat-icon blue">
            <User size={23} />
          </div>

          <div>
            <h3>{activeUsers}</h3>
            <p>Active Users</p>
          </div>
        </div>

        <div className="activity-stat-card">
          <div className="activity-stat-icon orange">
            <Clock size={23} />
          </div>

          <div>
            <h3>{todayActivities}</h3>
            <p>Today's Activities</p>
          </div>
        </div>

      </div>

      {/* FILTERS */}

      <div className="activity-toolbar">

        <div className="activity-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search activities, users or modules..."
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

        {(search || actionFilter !== "All" || roleFilter !== "All") && (
          <button
            className="activity-reset"
            type="button"
            title="Reset filters"
            onClick={() => {
              setSearch("");
              setActionFilter("All");
              setRoleFilter("All");
            }}
          >
            <X size={17} />
          </button>
        )}

      </div>

      {/* ACTIVITY LIST */}

      <div className="activity-section">

        <div className="activity-section-header">
          <h2>Recent Activities</h2>

          <span className="activity-count">
            {filteredActivities.length} Records
          </span>
        </div>

        {filteredActivities.length === 0 ? (

          <div className="activity-empty">
            <div className="activity-empty-icon">
              <ClipboardList size={30} />
            </div>

            <h3>No activities found</h3>

            <p>
              {activities.length === 0
                ? "Activities will appear here when users perform actions."
                : "Try changing your search or filter settings."}
            </p>
          </div>

        ) : (

          <div className="activity-timeline">

            {filteredActivities.map((item, index) => (

              <div
                className="activity-row"
                key={item.id || `${item.timestamp}-${index}`}
              >

                <div className="activity-row-icon">
                  {getActionIcon(item.action)}
                </div>

                <div className="activity-row-main">

                  <h3>
                    {item.details || "Activity recorded"}
                  </h3>

                  <div className="activity-row-meta">

                    <span>
                      <User size={13} />
                      {item.user || "Unknown user"}
                    </span>

                    <span>
                      <Package size={13} />
                      {item.entity || "General"}
                    </span>

                    <span>
                      <ClipboardList size={13} />
                      {item.role || "Unknown role"}
                    </span>

                  </div>

                  <small className="activity-date">
                    <Clock
                      size={12}
                      style={{
                        display: "inline",
                        marginRight: "5px",
                      }}
                    />
                    {formatDate(item.timestamp)}
                  </small>

                </div>

                <span
                  className={`activity-action-badge ${getActionClass(
                    item.action
                  )}`}
                >
                  {item.action || "Activity"}
                </span>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}