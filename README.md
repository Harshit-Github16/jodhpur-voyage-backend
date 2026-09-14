# 🚀 Jodhpur Voyage - Backend REST API

Production-ready backend API service for **Jodhpur Voyage** luxury and experiential travel platform. Built with Node.js (ES Modules), Express.js, MongoDB (Mongoose), JWT authentication with RBAC, Cloudinary image uploads, and security best practices.

---

## 📑 Features

- **Authentication & RBAC**: JWT Access & Refresh Token rotation with HttpOnly cookies, password hashing with bcrypt, role-based access (`Super Admin`, `Admin`, `Editor`, `Customer`).
- **13 Complete Modules**:
  - `Auth & User Profiles`
  - `Destination Categories (Regions)`
  - `Cities & Destinations` (Full-text search, SEO tags, FAQs)
  - `Tour Packages` (Itineraries, pricing filters, reviews aggregation)
  - `Bookings & Orders` (Booking numbers, status pipelines, confirmation emails)
  - `Enquiries & Leads` (CRM lead status, notes timeline)
  - `Reviews & Ratings` (Automatic rating calculation)
  - `Blogs & Articles` (Markdown/HTML, views counter, tag filtering)
  - `Customer & Staff Management` (Booking metrics aggregation, permission controls)
  - `Team Members` (Guides, explorers, experience)
  - `Site Settings` (Global site info, social links, currency)
  - `Analytics & Reports` (Dashboard metrics, 6-month revenue trends, category popularity)
  - `Media & Image Uploads` (Cloudinary single & batch uploads)
- **Security**: Helmet HTTP headers, CORS origin whitelist, MongoDB query sanitization against NoSQL injection, HPP parameter pollution protection, express rate limiting.
- **Robust Error Handling**: Standardized `ApiError`, `ApiResponse`, and `asyncHandler` envelope.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js v18+ (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & BcryptJS
- **Validation**: Zod
- **File Storage**: Cloudinary & Multer
- **Email Service**: Nodemailer

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your MongoDB connection string is set (e.g. `MONGO_URI=mongodb://127.0.0.1:27017/jodhpur_voyage`).

### 3. Seed Initial Database
Seed initial admin user, categories, cities, tours, reviews, blogs, and settings:
```bash
npm run seed
```

**Default Super Admin Credentials:**
- **Email**: `admin@jodhpurvoyage.com`
- **Password**: `jodhpur@2025`

### 4. Start Server
```bash
# Development mode with hot-reload
npm run dev

# Production mode
npm start
```

---

## 📡 API Base URL & Endpoints

Base URL: `http://localhost:5000/api/v1`

| Module | Method | Endpoint | Access |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/health` | Public |
| **Auth** | `POST` | `/auth/login` | Public |
| **Auth** | `POST` | `/auth/register` | Public |
| **Auth** | `GET` | `/auth/me` | Authenticated |
| **Categories**| `GET` | `/destination-categories` | Public |
| **Cities** | `GET` | `/cities` | Public |
| **Cities** | `GET` | `/cities/:idOrSlug` | Public |
| **Tours** | `GET` | `/tours` | Public |
| **Tours** | `GET` | `/tours/:idOrSlug` | Public |
| **Bookings** | `POST` | `/bookings` | Public / Customer |
| **Bookings** | `GET` | `/bookings` | Admin |
| **Bookings** | `GET` | `/bookings/my-bookings`| Customer |
| **Enquiries**| `POST` | `/enquiries` | Public |
| **Enquiries**| `GET` | `/enquiries` | Admin / Staff |
| **Reviews** | `GET` | `/reviews` | Public |
| **Reviews** | `POST` | `/reviews` | Public / Customer |
| **Blogs** | `GET` | `/blogs` | Public |
| **Blogs** | `GET` | `/blogs/:idOrSlug` | Public |
| **Customers**| `GET` | `/customers` | Admin |
| **Staff** | `GET` | `/users/staff` | Super Admin |
| **Team** | `GET` | `/team` | Public |
| **Settings** | `GET` | `/settings` | Public |
| **Analytics**| `GET` | `/analytics/dashboard`| Admin |
| **Upload** | `POST` | `/upload/single` | Staff / Admin |

---

## 🔗 Connecting with Next.js Frontend

In your Next.js frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```
# jodhpur-voyage-backend
# jodhpur-voyage-backend
