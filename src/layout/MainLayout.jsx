import {
  LayoutDashboard,
  Sprout,
  CloudSun,
  ChartNoAxesCombined,
  Package,
  ShoppingCart,
  Settings,
  Search,
  Bell,
  Leaf,
  Menu,
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
];

function MainLayout() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Leaf size={25} />
          </div>

          <div>
            <h2>AgriFlow</h2>
            <span>Farm Management</span>
          </div>
        </div>

        <div className="menu-heading">WORKSPACE</div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                to={item.path}
                key={item.label}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `menu-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>

                {item.label === "Orders" && (
                  <span className="menu-badge">4</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <Sprout size={22} />
            </div>

            <h4>Growing together</h4>

            <p>Manage your farm smarter every day.</p>
          </div>

          <div className="menu-item settings-item">
            <Settings size={19} />
            <span>Settings</span>
          </div>

          <div className="profile">
            <div className="profile-avatar">FA</div>

            <div className="profile-info">
              <strong>Farm Admin</strong>
              <span>Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              type="button"
              aria-label="Menu"
            >
              <Menu size={23} />
            </button>

            <div>
              <p className="breadcrumb">Workspace / Overview</p>
              <h1>AgriFlow Dashboard</h1>
            </div>
          </div>

          <div className="topbar-right">
            <div className="search-box">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search anything..."
                aria-label="Search"
              />
            </div>

            <button
              className="notification-button"
              type="button"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span></span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <Outlet />

          <footer className="footer">
            <p>© 2026 AgriFlow. Growing a better tomorrow.</p>

            <div>
              <span>Made for smarter farming</span>
              <Sprout size={16} />
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default MainLayout;