import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Sprout,
  CloudSun,
  ChartNoAxesCombined,
  Package,
  ShoppingCart,
  Search,
  Bell,
  Leaf,
  Menu,
  Users,
  CalendarDays,
  X,
  ClipboardList,
  Wallet,
  FileText,
} from "lucide-react";

import { logout } from "../features/auth/authSlice.js";
const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Crops",
    path: "/crops",
    icon: Sprout,
  },
  {
    label: "Weather",
    path: "/weather",
    icon: CloudSun,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Supplies",
    path: "/supplies",
    icon: Package,
  },
  {
    label: "Orders",
    path: "/orders",
    icon: ShoppingCart,
  },
  {
    label: "Buyers",
    path: "/buyers",
    icon: Users,
  },
  {
    label: "Harvest & Orders",
    path: "/harvest-orders",
    icon: CalendarDays,
  },
  {
    label: "Farm Tasks",
    path: "/tasks",
    icon: ClipboardList,
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: Package,
  },
  {
    label: "Expenses & Profit/Loss",
    path: "/expenses",
    icon: Wallet,
  },
  {
  label: "Reports & Activity Log",
  path: "/reports",
  icon: FileText,
},
];

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  function handleLogout() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className="app-container">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${
          isSidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Leaf size={25} />
          </div>

          <div className="logo-text">
            <h2>AgriFlow</h2>
            <span>Agriculture Management</span>
          </div>

          <button
            type="button"
            className="sidebar-close"
            aria-label="Close menu"
            onClick={closeSidebar}
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation links */}
        <nav
          className="sidebar-menu"
          aria-label="Main navigation"
        >
          <p className="menu-heading">MAIN MENU</p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                to={item.path}
                key={item.label}
                end={item.path === "/"}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `menu-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-icon">
            <Sprout size={20} />
          </div>

          <div>
            <p>Grow Smarter</p>
            <span>Manage your farm efficiently</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {/* Top navigation bar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu"
              aria-label={
                isSidebarOpen ? "Close menu" : "Open menu"
              }
              aria-expanded={isSidebarOpen}
              onClick={() =>
                setIsSidebarOpen((open) => !open)
              }
            >
              {isSidebarOpen ? (
                <X size={23} />
              ) : (
                <Menu size={23} />
              )}
            </button>

            <div className="page-heading">
              <h1>Farm Dashboard</h1>

              <p className="breadcrumb">
                Home / <span>Overview</span>
              </p>
            </div>
          </div>

          <div className="topbar-right">
            <div className="search-box">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search..."
                aria-label="Search"
              />
            </div>

            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="notification-dot" />
            </button>

            {/* User profile */}
            <div className="profile">
              <div className="profile-avatar">
                {user?.name?.charAt(0) || "A"}
              </div>

              <div className="profile-info">
                <p>{user?.name || "Farm User"}</p>
                <span>{user?.role || "User"}</span>
              </div>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Active page renders here */}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;