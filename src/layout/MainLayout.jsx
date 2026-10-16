
import { useState } from "react";

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
} from "lucide-react";

import { NavLink, Outlet } from "react-router-dom";

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
];

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-container">
      {/* Mobile overlay */}
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
        className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}
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

        <nav className="sidebar-menu" aria-label="Main navigation">
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
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
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

            <div className="profile">
              <div className="profile-avatar">AF</div>

              <div className="profile-info">
                <p>Farm Manager</p>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Current page */}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
