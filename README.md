# 🌱 AgriFlow – Agriculture Management System

AgriFlow is a full-stack Agriculture Management System designed to simplify and organize agricultural operations through a centralized, user-friendly dashboard.

The application helps farmers manage crops, buyers, harvest orders, farm tasks, inventory, expenses, workers, attendance, equipment, and maintenance.

It uses React and Redux Toolkit for the frontend, Node.js and Express.js for the backend, and PostgreSQL for database management.

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
- Automatically synchronize maintenance costs with expenses.
- Monitor equipment service dates.

### 10. Reports & Activity Log
- View agricultural and financial summaries.
- Generate reports.
- Export report data.
- Track important system activities.

### 11. Authentication & Role-Based Access
- Admin and Farm Manager roles.
- Secure login and signup.
- JWT-based authentication.
- Protected API endpoints.
- Role-based authorization.

## 🛠️ Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- Redux Toolkit
- React-Redux
- React Router
- CSS
- Recharts
- Lucide React
- Axios

### Backend
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JSON Web Tokens (JWT)
- bcryptjs
- Multer
- Helmet
- CORS
- Morgan
- Express Rate Limit

### Development Tools
- Git and GitHub
- VS Code
- Nodemon
- Vercel

## 📁 Project Structure

AgriFlow is organized into two separate repositories.

### Frontend Structure

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

### Backend Structure

```text
agriflow-backend/
│
├── Controllers/
├── middleware/
├── Model/
├── public/
│   └── Images/
├── Routes/
├── scripts/
│
├── app.js
├── db.js
├── testConnection.js
├── package.json
└── .env
```

## ⚙️ Installation & Setup

### Prerequisites

Install the following:
- Node.js
- npm
- PostgreSQL

### 1. Clone the Frontend Repository

```bash
git clone https://github.com/eshasaleem09/agriflow-agriculture-management.git
```

Open the frontend folder:

```bash
cd agriflow-agriculture-management
```

Install dependencies:

```bash
npm install
```

### 2. Clone the Backend Repository

Open another terminal:

```bash
git clone https://github.com/eshasaleem09/agriflow-backend.git
```

Open the backend folder:

```bash
cd agriflow-backend
```

Install dependencies:

```bash
npm install
```

### 3. Configure Backend Environment Variables

Create a `.env` file inside the backend folder.

For a hosted PostgreSQL database:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=your_frontend_url
PORT=5000
```

Alternatively, for a local PostgreSQL database:

```env
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432

JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=http://localhost:5173
PORT=5000
```

Use either the hosted database configuration or the local database configuration.

**Important:** Never upload your actual `.env` file, database password, or JWT secret to GitHub.

### 4. Start the Backend Server

Inside the backend folder:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Database connection and Sequelize synchronization happen automatically when the server starts.

### 5. Configure the Frontend

Create a `.env` file inside the frontend folder if needed:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Start the Frontend

Inside the frontend folder:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

### 7. Build for Production

Inside the frontend folder:

```bash
npm run build
```

## 🔗 Backend API Configuration

Base API URL:

```text
http://localhost:5000/api
```

Health Check:

```text
http://localhost:5000/
```

Authentication Routes:

```text
/api/auth
```

Application Routes:

```text
/api
```

The backend uses a consistent JSON response structure:

```json
{
  "succeeded": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Buyer images are served through:

```text
/images
```

## 🗄️ Database Management

AgriFlow uses PostgreSQL as its relational database.

Sequelize ORM manages:
- Database models.
- Data creation and updates.
- Database queries.
- Model relationships.
- Database synchronization.

JWT authentication protects API endpoints, while role-based authorization controls access to administrative operations.

## 🌐 Live Demo

[Visit AgriFlow](https://agriflow-agriculture-management-qkl3xi46o-esha-saleem.vercel.app/)

## 📂 GitHub Repositories

**Frontend:**

https://github.com/eshasaleem09/agriflow-agriculture-management

**Backend:**

https://github.com/eshasaleem09/agriflow-backend

## 👩‍💻 Developer

**Esha Saleem**

Full Stack Developer Intern – U Devs Batch 6

Project: Agriculture Management System (AgriFlow)

---

*AgriFlow – Simplifying Agriculture Management Through Technology.*