# 🎯 Event Income & Expense Tracker

A modern full-stack web application to manage personal or event-based finances — including income sources, expense categories, visual reporting, and export features.

This project was built using:
- 🔧 **React.js (Frontend)**
- 🛠️ **Spring Boot (Backend)**
- 💽 **MySQL (Database)**

> Deployed on:
> - 🌐 [Frontend (Netlify)](https://your-netlify-app-url.netlify.app)
> - ☁️ [Backend (Render)](https://your-render-backend.onrender.com)

---

## 📌 Features

### ✅ Income & Expense Tracking
- Record income and expenses by category and subcategory
- Add notes, descriptions, and filter by time or event

### 📊 Dashboard & Reports
- Interactive dashboard with total balance, summaries
- Pie charts for visual insights
- Date range filters

### 📁 Export & Print
- Export reports to **PDF** or **Excel**
- Print-friendly report views

### 🌙 Dark/Light Theme
- Toggle between dark and light modes with persistent settings

### 📂 Organized Structure
- Frontend and backend live inside the same project root
- Clear separation using `/frontend` and `/backend` folders

---

## 🗂 Project Structure
project-root/
├── backend/ # Spring Boot API
│ ├── src/
│ ├── pom.xml
│ └── ...
├── frontend/ # React.js client
│ ├── public/
│ ├── src/
│ └── package.json
└── README.md
