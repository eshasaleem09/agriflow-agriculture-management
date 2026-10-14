import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./layout/MainLayout.jsx";

import Dashboard from "./pages/Dashboard";
import Crops from "./pages/Crops";
import Weather from "./pages/Weather";
import Analytics from "./pages/Analytics";
import Supplies from "./pages/Supplies";
import Orders from "./pages/Orders";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="crops" element={<Crops />} />

          <Route path="weather" element={<Weather />} />

          <Route path="analytics" element={<Analytics />} />

          <Route path="supplies" element={<Supplies />} />

          <Route path="orders" element={<Orders />} />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;