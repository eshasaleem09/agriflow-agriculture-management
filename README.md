# AgriFlow — Agriculture Management System

**Live Demo:** https://agriflow-agriculture-management-qkl3xi46o-esha-saleem.vercel.app/

**GitHub Repository:** https://github.com/eshasaleem09/agriflow-agriculture-management

**U DEVS (SMC-PRIVATE) LIMITED | Full Stack Developer — Batch 6**

AgriFlow is a React-based agriculture management application designed to help farm managers monitor crops, manage buyers, schedule farm activities, track inventory, record financial transactions, and review farm performance through reports.

The project uses React, Redux Toolkit, React Router, localStorage, Recharts, and the Open-Meteo Weather API.

## Project Information

| Item             | Details                                  |
| ---------------- | ---------------------------------------- |
| Project          | Agriculture Management System — AgriFlow |
| Internship       | U DEVS (SMC-PRIVATE) LIMITED             |
| Batch            | Full Stack Developer — Batch 6           |
| Developer        | Esha Saleem                              |
| Frontend         | React, JavaScript, Vite                  |
| State Management | Redux Toolkit, React-Redux               |
| Routing          | React Router                             |
| Charts           | Recharts                                 |
| Icons            | Lucide React                             |
| Storage          | Browser localStorage                     |
| Weather API      | Open-Meteo                               |
| Deployment       | Vercel                                   |

## Features

### 1. Dashboard

* Farm overview and operational summaries.
* Crop health indicators.
* Weather and farm information.
* Charts for visualizing farm data.

### 2. Crop Management

* Add, view, edit, and delete crop records according to the user's role.
* Track crop name, field, available quantity, and health score.
* Search crops by name or field.
* Filter crops by health status.
* Sort by name, quantity, and health.
* Calculate healthy, attention-needed, and critical crop summaries.

### 3. Authentication and Role-Based Interface

* Demo login for Administrator and Farm Manager roles.
* Protected application routes.
* Logout functionality.
* Different interface permissions for selected operations.

**Demo credentials**

| Role          | Username  | Password      |
| ------------- | --------- | ------------- |
| Administrator | `admin`   | `Admin@123`   |
| Farm Manager  | `manager` | `Manager@123` |

These credentials are intended for demonstration only. The current implementation performs client-side credential checks and is not a production authentication system.

### 4. Weather Center

* Current weather information for Lahore, Pakistan.
* Temperature, humidity, wind speed, precipitation, and rain probability.
* Three-day weather forecast.
* Loading and error messages.
* Manual refresh and automatic refresh at a fixed interval.

Weather information is retrieved from the Open-Meteo API. An internet connection is required.

### 5. Buyer Management

* Register buyers and record crop purchases.
* Validate buyer names and CNIC numbers.
* Automatically format CNIC as `12345-1234567-1`.
* Prevent duplicate CNIC entries.
* Upload JPG or PNG buyer photos up to 1 MB.
* Preview uploaded photos.
* Validate purchase quantities against available crop stock.
* Update crop quantities when purchases are recorded.
* Search buyer records.

### 6. Farm Task Scheduler

* Create tasks linked to existing crops.
* Assign task due dates and notes.
* Calculate Pending, Done, and Overdue statuses.
* Search and filter tasks.
* Mark tasks complete.
* Display overdue-task alerts.

### 7. Inventory Management

* Manage seeds, fertilizers, pesticides, tools, fuel, and other supplies.
* Add, edit, and delete inventory records according to the user's role.
* Set minimum stock thresholds.
* Display Low Stock and Out of Stock indicators.
* Record inventory usage and update quantities.
* Maintain usage history.

### 8. Expenses and Profit/Loss

* Record crop-related income and expenses.
* Link financial records to crops.
* View total income, total expenses, and net profit/loss.
* Calculate financial performance for individual crops.
* Search and filter financial transactions.

Financial summaries are calculated from the records entered into the application.

### 9. Reports and Activity Log

* Select a reporting month.
* View monthly income, expenses, and net profit/loss.
* Review farm and inventory summaries.
* Review monthly task statuses.
* Export report data to CSV.
* Print reports or use the browser's Save as PDF option.
* Review supported Redux actions in the activity log, including user, action, entity, and timestamp.

### 10. Additional Modules

* Harvest and orders.
* Buyer records.
* Supplies management.
* Analytics and data visualizations.
* Responsive sidebar navigation.

## Technology Stack

* **React:** Builds the application's reusable user interface.
* **Vite:** Provides the development server and production build.
* **Redux Toolkit:** Manages global application state through slices and reducers.
* **React-Redux:** Connects React components to the Redux store.
* **React Router:** Manages application routes and protected page layouts.
* **Recharts:** Supports charts and data visualizations.
* **Lucide React:** Provides interface icons.
* **localStorage:** Persists supported records in the user's browser.
* **Open-Meteo:** Provides weather information through HTTP requests.

## Redux State Architecture

The Redux store contains the following state sections:

```text
store
├── crops
│   └── Crop records and health data
├── auth
│   └── Current demo user and authentication state
├── weather
│   ├── data
│   ├── status
│   └── error
├── tasks
│   └── Farm tasks and completion statuses
├── inventory
│   └── Stock records and usage history
├── expenses
│   └── Income and expense records
├── buyers
│   └── Buyer and purchase records
└── activity
    └── Recent supported application activities
```

## Redux Data Flow

The application's Redux data flow follows this pattern:

```text
User Interaction
      |
      v
React Component
      |
      v
Redux Action / Async Thunk
      |
      v
Slice Reducer
      |
      v
Redux Store
      |
      v
React-Redux Selector
      |
      v
Updated User Interface
```

The Weather module uses a Redux async thunk to request data from Open-Meteo.

The activity logger middleware observes configured Redux actions and records supported operations. The store subscription saves supported application records in localStorage.

## Local Storage

The application uses browser localStorage for supported client-side persistence.

| Key                  | Purpose                     |
| -------------------- | --------------------------- |
| `agriflow-crops`     | Crop records                |
| `agriflow-session`   | Demo login session          |
| `agriflow-buyers`    | Buyer and purchase records  |
| `agriflow-tasks`     | Farm task records           |
| `agriflow-inventory` | Inventory and usage history |
| `agriflow-expenses`  | Financial records           |
| `agriflow-activity`  | Activity log                |

Data stored in localStorage belongs to the current browser and device. It is not a shared server-side database.

## Project Structure

```text
src/
├── app/
│   ├── store.js
│   └── activityLogger.js
├── components/
│   └── auth/
│       └── ProtectedRoute.jsx
├── features/
│   ├── auth/
│   │   └── authSlice.js
│   ├── crops/
│   │   └── cropsSlice.js
│   ├── weather/
│   │   └── weatherSlice.js
│   ├── tasks/
│   │   └── tasksSlice.js
│   ├── inventory/
│   │   └── inventorySlice.js
│   ├── expenses/
│   │   └── expensesSlice.js
│   ├── buyers/
│   │   └── buyersSlice.js
│   └── activity/
│       └── activitySlice.js
├── layout/
│   └── MainLayout.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Crops.jsx
│   ├── Buyers.jsx
│   ├── Weather.jsx
│   ├── Tasks.jsx
│   ├── Inventory.jsx
│   ├── Expenses.jsx
│   ├── Reports.jsx
│   ├── Analytics.jsx
│   ├── Supplies.jsx
│   ├── Orders.jsx
│   └── HarvestOrders.jsx
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## Installation and Setup

### Prerequisites

* Node.js and npm.
* Git.
* A modern web browser.
* An internet connection for the Weather API.

### 1. Clone the Repository

Replace the repository URL below with your actual GitHub repository URL if needed.

```bash
git clone https://github.com/eshasaleem09/agriflow-agriculture-management.git
```

### 2. Open the Project

```bash
cd agriflow-agriculture-management
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### 5. Create a Production Build

```bash
npm run build
```

### 6. Preview the Production Build

```bash
npm run preview
```

## Application Routes

| Route             | Page                     |
| ----------------- | ------------------------ |
| `/login`          | Demo login               |
| `/`               | Dashboard                |
| `/crops`          | Crop Management          |
| `/weather`        | Weather Center           |
| `/buyers`         | Buyer Management         |
| `/tasks`          | Farm Task Scheduler      |
| `/inventory`      | Inventory Management     |
| `/expenses`       | Expenses and Profit/Loss |
| `/reports`        | Reports and Activity Log |
| `/analytics`      | Analytics                |
| `/supplies`       | Supplies                 |
| `/orders`         | Orders                   |
| `/harvest-orders` | Harvest and Orders       |

## Screenshots

Add genuine screenshots of the running application before final submission. Recommended screenshots include:

* Dashboard
* Crop Management
* Weather Center
* Buyer Management
* Farm Task Scheduler
* Inventory Management
* Expenses and Profit/Loss
* Reports and Activity Log

Store the screenshots in a folder such as `docs/screenshots/` and include them in this section.

## Known Limitations

* Authentication is a client-side demonstration, not secure production authentication.
* Application records are stored in browser localStorage and are not shared between users or devices.
* Role restrictions implemented in frontend components are not a substitute for backend authorization.
* Weather data requires network connectivity.
* Financial calculations depend on the records entered by the user.
* The activity log covers configured Redux operations; any legacy operations that do not dispatch the tracked Redux actions need separate integration.

## Developer

**Esha Saleem**
Full Stack Developer Intern — Batch 6
U DEVS (SMC-PRIVATE) LIMITED

## License

This project was developed as an internship assignment for U DEVS (SMC-PRIVATE) LIMITED.

