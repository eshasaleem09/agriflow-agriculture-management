# 🌱 AgriFlow – Agriculture Management System

AgriFlow is a web-based Agriculture Management System designed to help farmers manage their agricultural activities through a centralized and user-friendly dashboard.

The system provides tools for managing crops, buyers, harvest orders, farm tasks, inventory, expenses, workers, attendance, equipment, and maintenance.

## 🚀 Features

### 1. Dashboard
- Overview of agricultural activities.
- Crop and inventory summaries.
- Workforce and equipment information.
- Important alerts and statistics.

### 2. Crop Management
- Add, update, view, and delete crops.
- Monitor crop information and health.
- Manage crop-related records.

### 3. Harvest & Orders
- Manage harvest records.
- Create and manage customer orders.
- Track order status.
- Maintain crop stock consistency.

### 4. Buyer Management
- Add and manage buyer information.
- Store buyer contact details.
- Upload buyer photos.
- Search and manage buyer records.

### 5. Farm Task Scheduler
- Create and assign farm tasks.
- Track task status and deadlines.
- Manage daily agricultural activities.

### 6. Inventory Management
- Manage agricultural supplies.
- Monitor available stock.
- Identify low-stock items.

### 7. Expense Management
- Record income and expenses.
- Track agricultural costs.
- Calculate net profit and loss.

### 8. Workers & Attendance
- Manage farm workers.
- Record daily attendance.
- Calculate monthly wages.

### 9. Equipment & Maintenance
- Maintain equipment records.
- Track equipment status.
- Record maintenance activities.
- Monitor service dates and maintenance costs.

### 10. Reports & Activity Log
- View agricultural and financial summaries.
- Generate reports.
- Export report data.
- Track important system activities.

### 11. Authentication & Role-Based Access
- Admin and Farm Manager roles.
- Protected application routes.
- Role-based permissions.

## 🛠️ Technologies Used

- React.js
- Vite
- JavaScript
- Redux Toolkit
- React-Redux
- React Router
- Bootstrap / CSS
- Recharts
- Lucide React
- LocalStorage
- Open-Meteo Weather API

## 📁 Project Structure

```text
agriculture-management-system/
│
├── public/
├── src/
│   ├── app/
│   │   └── redux/
│   │       ├── actions/
│   │       ├── api/
│   │       ├── middleware/
│   │       ├── reducers/
│   │       ├── selectors/
│   │       └── store/
│   │
│   ├── components/
│   ├── features/
│   ├── layout/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── package.json
└── README.md
```

## ⚙️ Installation & Setup

Follow these steps to run AgriFlow locally.

### 1. Clone the repository

```bash
git clone https://github.com/eshasaleem09/agriflow-agriculture-management.git
```

### 2. Open the project folder

```bash
cd agriflow-agriculture-management
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

## 💾 Data Storage

AgriFlow uses browser LocalStorage for local data persistence. Redux Toolkit manages application state, while persistence functionality helps retain saved records after refreshing the application.

Weather information is retrieved using the Open-Meteo API.

## 🌐 Live Demo

[Visit AgriFlow](https://agriflow-agriculture-management-qkl3xi46o-esha-saleem.vercel.app/)

## 📂 GitHub Repository

[View Source Code](https://github.com/eshasaleem09/agriflow-agriculture-management)

## 👩‍💻 Developer

**Esha Saleem**

Full Stack Developer Intern – U Devs Batch 6

Project: Agriculture Management System (AgriFlow)

---

*AgriFlow – Simplifying Agriculture Management Through Technology.*
