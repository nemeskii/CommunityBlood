# 🩸 Community Blood Donation Platform

A full-stack blood donation management platform that connects donors, hospitals, and administrators to make blood requests, donor matching, donation tracking, and communication easier.

The application provides separate workflows for **Donors**, **Hospitals**, and **Administrators**, with authentication, OTP verification, password recovery, blood-request management, donor matching, donation confirmation, and email notifications.

---

## 📁 Project Structure

This repository is a monorepo containing the React frontend and Laravel backend:

```text
CommunityBlood/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/               # Axios API configuration
│   │   ├── components/        # Shared/protected-route components
│   │   ├── pages/             # Application pages
│   │   ├── styles/            # Global/theme styles
│   │   └── utils/              # Utility functions
│   └── package.json
│
├── backend/                   # Laravel REST API
│   ├── app/
│   │   ├── Console/           # Scheduled/console commands
│   │   ├── Http/Controllers/  # API controllers
│   │   └── Models/
│   ├── database/              # Migrations and seeders
│   ├── routes/api.php         # API routes
│   ├── config/                # Laravel configuration
│   └── composer.json
│
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- Lucide React
- jsPDF
- CSS

### Backend

- Laravel 12
- PHP 8.2+
- Laravel Sanctum
- MySQL
- Resend Laravel package for email delivery
- DomPDF for PDF generation
- Doctrine DBAL

### Authentication

The application uses Laravel Sanctum for authenticated API requests.

Separate authentication tokens are maintained for:

- Donors → `donor_token`
- Hospitals → `hospital_token`
- Administrators → `admin_token`

---

## ✨ Main Features

### 🩸 Donor Features

- Donor registration
- OTP verification
- Donor login/logout
- Donor profile completion and updates
- Blood group and location-based donor search
- View blood inventory
- Submit blood requests
- View personal blood requests
- Record/view donation history
- Receive donor match notifications
- Respond to blood-request matches
- Password reset
- Government ID handling
- Reference-card generation

### 🏥 Hospital Features

- Hospital registration
- Hospital login/logout
- Hospital approval workflow
- Hospital profile/session management
- Search/lookup relevant donor and donation information
- View hospital donation history
- Confirm blood requests
- Confirm donations

Hospital accounts are subject to administrator approval before they can be fully used.

### 🛡️ Administrator Features

- Admin login/logout
- Admin password reset
- Dashboard
- Donor management
- Donor profile viewing/updating/deletion
- Government ID access
- Donation management
- Donation status updates
- Blood-request management
- Blood-request status updates
- Suggested donor matching
- Donor match assignment
- Match history
- Resend match notifications
- Acknowledge donor responses
- View unacknowledged match responses
- Hospital management
- Hospital approval/rejection
- Hospital deletion
- Hospital confirmation monitoring

### 📧 Email & Notifications

The backend supports email-based communication for application workflows such as:

- OTP verification
- Password reset
- Blood-request donor matching
- Match notification resending
- Other system notifications

The backend includes support for **Resend** and Laravel's mail configuration.

### 🔗 Donor Match Response Links

Donors can respond to a blood-request match using a secure token-based link without requiring a normal login session.

The platform also supports responding to pending matches directly from the donor portal.

### ⏳ Match Expiration

The backend includes a Laravel console command for expiring blood-request matches:

```bash
php artisan blood-requests:expire-matches
```

Configure your server scheduler/cron to run the command periodically in production.

---

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- Node.js 18+
- PHP 8.2+
- Composer
- MySQL
- Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/nemeskii/CommunityBlood.git
cd CommunityBlood
```

---

## 2. Backend Setup

Move into the Laravel backend:

```bash
cd backend
```

Install PHP dependencies:

```bash
composer install
```

Create your Laravel environment file.

If `.env.example` is available in your local copy:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

If your repository does not contain `.env.example`, create `.env` manually using the Laravel environment configuration appropriate for your installation.

Generate the application key:

```bash
php artisan key:generate
```

### Database Configuration

Update the backend `.env` file with your MySQL configuration:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

Then run the migrations:

```bash
php artisan migrate
```

Start the Laravel development server:

```bash
php artisan serve
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

The API is served under:

```text
http://127.0.0.1:8000/api
```

---

## 3. Configure Email Services

The backend uses Laravel's mail configuration and includes the Resend Laravel package.

For Resend-based email delivery, configure the required values in `.env`, including:

```env
RESEND_API_KEY=your_resend_api_key
```

Configure the appropriate Laravel mail settings as required by your selected mail transport.

**Do not commit API keys, SMTP passwords, application secrets, or other credentials to GitHub.**

---

## 4. Frontend Setup

Open another terminal and move to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

The frontend uses the Vite environment variable:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Create a frontend `.env` file if required:

```env
VITE_API_URL=http://127.0.0.1:8000
```

The Axios client automatically appends `/api`, so the application communicates with:

```text
http://127.0.0.1:8000/api
```

Start the frontend:

```bash
npm run dev
```

The Vite development server will normally be available at:

```text
http://localhost:5173
```

---

## 5. Running the Application

You need both servers running during local development.

### Terminal 1 — Laravel

```bash
cd backend
php artisan serve
```

### Terminal 2 — React/Vite

```bash
cd frontend
npm run dev
```

Then open the frontend URL shown by Vite.

---

## 🔐 Environment Variables

### Frontend

The frontend currently expects:

```env
VITE_API_URL=http://127.0.0.1:8000
```

For production, set it to the deployed backend URL.

For example:

```env
VITE_API_URL=https://your-backend-domain.com
```

Do not include `/api` in `VITE_API_URL`, because the Axios configuration already adds `/api`.

### Backend

The Laravel backend requires environment configuration for:

- Application key
- Database
- Mail service
- Resend API key, if using Resend
- Other Laravel runtime settings

Example database configuration:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

---

## 🌐 API Overview

The API is organized around three primary roles.

### Public / General

```text
POST   /api/register
POST   /api/donor/login
POST   /api/admin/login
POST   /api/hospital/register
POST   /api/hospital/login

POST   /api/otp/send
POST   /api/otp/verify

POST   /api/contact

GET    /api/blood-inventory
GET    /api/blood-search
POST   /api/blood-requests
```

### Donor

```text
POST   /api/donor/logout
GET    /api/donor/me
PUT    /api/donor/profile

GET    /api/donations
POST   /api/donations

GET    /api/donor/blood-requests

GET    /api/donor/matches/pending
POST   /api/donor/matches/{match}/respond
```

### Hospital

```text
POST   /api/hospital/logout
GET    /api/hospital/me

GET    /api/hospital/lookup
GET    /api/hospital/history

PUT    /api/hospital/donations/{donation}/confirm
PUT    /api/hospital/blood-requests/{bloodRequest}/confirm
```

### Administrator

The admin API includes endpoints for:

- Donor management
- Donation management
- Blood-request management
- Suggested donors
- Donor matching
- Match history
- Match notification resending
- Match acknowledgement
- Hospital management
- Hospital approval/rejection
- Hospital confirmations
- Government ID access

Admin routes are protected by Laravel Sanctum authentication.

---

## 📄 PDF / Reference Card

The frontend includes PDF/reference-card generation using:

```text
jsPDF
```

The backend also includes:

```text
barryvdh/laravel-dompdf
```

These components support document/reference-card functionality within the application.

---

## 🧪 Useful Development Commands

### Backend

```bash
php artisan serve
php artisan migrate
php artisan migrate:fresh
php artisan route:list
php artisan optimize:clear
php artisan test
php artisan blood-requests:expire-matches
```

### Frontend

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

---

## 🏗️ Production Build

Build the frontend:

```bash
cd frontend
npm run build
```

The generated production files will be placed in:

```text
frontend/dist/
```

For production deployment, configure the frontend's `VITE_API_URL` to point to the deployed Laravel backend.

The Laravel backend should also be configured with:

- Production database credentials
- Production `APP_KEY`
- Production mail/Resend credentials
- Appropriate `APP_ENV`
- Appropriate `APP_URL`
- Secure CORS configuration
- HTTPS
- A scheduled task for expiring matches

---

## 🔒 Security Notes

Never commit the following to the repository:

- `.env`
- API keys
- Resend API keys
- SMTP passwords
- Database passwords
- Laravel application keys
- Other private credentials

Before deploying, verify that sensitive configuration is stored in the hosting provider's environment-variable settings.

---

## 📸 Screenshots

Add updated application screenshots here as the UI evolves.

---

## 👤 Author

**Ato Kuotsu**

GitHub: [@nemeskii](https://github.com/nemeskii)

---

## 📄 License

This project was built as part of a Full Stack Web Development (FSWD) course.
