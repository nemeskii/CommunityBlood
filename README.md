# 🩸 Community Blood Donation Platform

A full-stack web application that connects blood donors with people and hospitals in need — enabling donor registration, blood request posting, and donor search by blood group and location.

🔗 **Live Demo:** [kuotsu.vercel.app](https://kuotsu.vercel.app/)
🔗 **API (Railway):** [kuotsu-api-production.up.railway.app](https://kuotsu-api-production.up.railway.app)

---

## 📁 Project Structure

This is a monorepo containing both the frontend and backend of the application:

```
CommunityBlood/
├── frontend/     → React + Vite client application
├── backend/      → Laravel API server
└── README.md
```

---

## 🛠️ Tech Stack

**Frontend**
- React (Vite)
- Axios (API requests)
- CSS Modules

**Backend**
- Laravel
- Laravel Sanctum (API authentication)
- Custom middleware (role-based access control)
- MySQL (database)

---

## ✨ Features

- 🔐 Donor & Admin authentication (with OTP verification)
- 🩸 Blood donation request posting
- 🔍 Donor search by blood group and location
- 📋 Donation history tracking
- 🛡️ Admin dashboard for managing donors and requests
- 📧 Email notifications (OTP delivery)

---

## 🚀 Getting Started

> 💡 Want to try it without setting anything up? Just visit the [live demo](https://kuotsu.vercel.app/).

### Prerequisites
- Node.js (v18+)
- PHP (v8.1+)
- Composer
- MySQL

### 1. Clone the repository
```bash
git clone https://github.com/nemeskii/CommunityBlood.git
cd CommunityBlood
```

### 2. Backend Setup (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
Update your `.env` file with your MySQL database credentials, then run:
```bash
php artisan migrate
php artisan serve
```
The API will be available at `http://localhost:8000`.

### 3. Frontend Setup (React + Vite)
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

### 4. Connect Frontend to Backend
Make sure your frontend's API base URL (in `src/api/axios.js`) points to your running Laravel backend (e.g., `http://localhost:8000/api`).

---

## 📸 Screenshots

<img width="1898" height="897" alt="Screenshot 2026-07-30 131556" src="https://github.com/user-attachments/assets/283e04ea-a7a1-42f0-8c2e-07d4a761617b" />


---

## 👤 Author

**Ato Kuotsu**
- GitHub: [@nemeskii](https://github.com/nemeskii)

---

## 📄 License

This project was built as part of a Full Stack Web Development (FSWD) course.
