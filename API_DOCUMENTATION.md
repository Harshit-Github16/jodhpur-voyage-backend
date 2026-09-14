# 🏰 Jodhpur Voyage API Documentation

> Complete REST API reference for **Jodhpur Voyage** backend services. Built for frontend integration (React, Next.js, Vue, Mobile apps, etc.).

---

## 📌 1. General Information & Setup

- **Base URL:** `http://localhost:5000/api/v1`
- **Server Health Check:** `GET http://localhost:5000/api/v1/health`
- **Content-Type:** `application/json` (except file uploads which use `multipart/form-data`)
- **CORS Allowed Origins:** `http://localhost:3000`, `http://localhost:3001`, `http://localhost:5173`

---

## 🔐 2. Authentication & Authorization

### Token Format
Include the Access Token in the `Authorization` header:
```http
Authorization: Bearer <YOUR_ACCESS_TOKEN>
```

### User Roles
| Role | Access Level |
|---|---|
| `Customer` | Public website user, book tours, view own bookings, submit reviews & enquiries |
| `Editor` | Manage blogs, view enquiries, upload media |
| `Admin` | Full management of tours, cities, categories, bookings, reviews, analytics |
| `Super Admin` | Full administrative control + staff creation/deletion and site settings |

---

## ⚡ 3. Frontend Integration Setup (Axios Client Example)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true, // required for httpOnly refresh cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach JWT access token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh token on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          'http://localhost:5000/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );
        const newToken = data.data.token;
        localStorage.setItem('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 📋 4. All API Endpoints Reference

---

### 🔑 Auth Module (`/auth`)

#### 1. Register New Customer
- **Endpoint:** `POST /auth/register`
- **Auth:** Public
- **Request Body:**
```json
{
  "name": "Harshit Sharma",
  "email": "harshit@example.com",
  "password": "password123",
  "phone": "+91 9876543210"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "6644f1a23e4b5c6d7e8f9012",
      "name": "Harshit Sharma",
      "email": "harshit@example.com",
      "role": "Customer",
      "phone": "+91 9876543210",
      "avatar": "https://..."
    },
    "token": "eyJhbGciOi...",
    "accessToken": "eyJhbGciOi..."
  }
}
```

#### 2. Login User / Staff / Admin
- **Endpoint:** `POST /auth/login`
- **Auth:** Public
- **Request Body:**
```json
{
  "email": "harshit@example.com",
  "password": "password123"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "6644f1a23e4b5c6d7e8f9012",
      "name": "Harshit Sharma",
      "email": "harshit@example.com",
      "role": "Customer",
      "phone": "+91 9876543210",
      "avatar": "https://...",
      "permissions": []
    },
    "token": "eyJhbGciOi...",
    "accessToken": "eyJhbGciOi..."
  }
}
```

#### 3. Refresh Access Token
- **Endpoint:** `POST /auth/refresh`
- **Auth:** Public (Sends refresh token via Cookie or Body `{ refreshToken: "..." }`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOi..."
  }
}
```

#### 4. Get Current User Profile
- **Endpoint:** `GET /auth/me`
- **Auth:** `Bearer Token`
- **Response `200 OK`:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Current user profile retrieved",
  "data": {
    "id": "6644f1a23e4b5c6d7e8f9012",
    "name": "Harshit Sharma",
    "email": "harshit@example.com",
    "role": "Customer",
    "phone": "+91 9876543210",
    "avatar": "https://...",
    "permissions": [],
    "createdAt": "2026-03-01T10:00:00.000Z"
  }
}
```

#### 5. Update Profile
- **Endpoint:** `PUT /auth/profile`
- **Auth:** `Bearer Token`
- **Request Body:**
```json
{
  "name": "Harshit Sharma Updated",
  "phone": "+91 9876543210",
  "avatar": "https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg"
}
```

#### 6. Change Password
- **Endpoint:** `PUT /auth/change-password`
- **Auth:** `Bearer Token`
- **Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### 7. Logout
- **Endpoint:** `POST /auth/logout`
- **Auth:** `Bearer Token`
- **Response `200 OK`:** Clears refresh cookie and revokes session.

---

### 🗺️ Tours & Packages Module (`/tours`)

#### 1. Get All Tours (Filters, Search & Pagination)
- **Endpoint:** `GET /tours`
- **Auth:** Public
- **Query Parameters:**
  - `search`: String (searches title, location, overview, city)
  - `category`: String (e.g. `Royal Heritage`, `Desert Safari`, `Culture & Food`, `Photography & Walks`)
  - `cityId`: String (MongoDB ObjectId)
  - `minPrice`: Number (e.g. `5000`)
  - `maxPrice`: Number (e.g. `25000`)
  - `duration`: String (e.g. `3 Days`)
  - `featured`: Boolean (`true` / `false`)
  - `status`: String (`Active` / `Draft` / `Inactive`, default: `Active`)
  - `sort`: `newest` | `price_asc` | `price_desc` | `rating` | `popular`
  - `page`: Number (default: `1`)
  - `limit`: Number (default: `12`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 6,
  "total": 6,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "id": "67cb1a238f1234567890abcd",
      "title": "Royal Jodhpur & Desert Camp Explorer",
      "slug": "royal-jodhpur-desert-camp-explorer",
      "cityId": "67cb10118f12345678901234",
      "cityName": "Jodhpur",
      "category": "Royal Heritage",
      "price": 14999,
      "originalPrice": 18999,
      "duration": "3 Days / 2 Nights",
      "groupSize": "2-12 Guests",
      "location": "Jodhpur & Osian Dunes",
      "image": "https://images.unsplash.com/photo-...",
      "gallery": ["https://images.unsplash.com/..."],
      "overview": "Immerse in the royal history of Mehrangarh...",
      "highlights": ["Private Mehrangarh tour", "Sunset Camel Safari"],
      "itinerary": [
        {
          "day": 1,
          "title": "Arrival & Blue City Walk",
          "desc": "Check-in at heritage haveli and evening walk.",
          "meals": "Dinner",
          "stay": "Haveli Heritage Stay"
        }
      ],
      "inclusions": ["Accommodation", "All Meals", "Local Guide", "Private AC Cab"],
      "exclusions": ["Monument Entry Tickets", "Flight/Train fares"],
      "faqs": [
        {
          "question": "What is the best season for this tour?",
          "answer": "October to March is ideal."
        }
      ],
      "rating": 4.9,
      "reviewsCount": 38,
      "badge": "Best Seller",
      "featured": true,
      "status": "Active",
      "totalBookings": 42
    }
  ]
}
```

#### 2. Get Single Tour by ID or Slug
- **Endpoint:** `GET /tours/:idOrSlug`
- **Auth:** Public
- **Example:** `GET /tours/royal-jodhpur-desert-camp-explorer` or `GET /tours/67cb1a238f1234567890abcd`

#### 3. Create Tour Package
- **Endpoint:** `POST /tours`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)
- **Request Body:**
```json
{
  "title": "Royal Jodhpur & Desert Camp Explorer",
  "slug": "royal-jodhpur-desert-camp-explorer",
  "cityId": "67cb10118f12345678901234",
  "category": "Royal Heritage",
  "price": 14999,
  "originalPrice": 18999,
  "duration": "3 Days / 2 Nights",
  "groupSize": "2-12 Guests",
  "location": "Jodhpur & Osian Dunes",
  "image": "https://images.unsplash.com/photo-1548013146-72479768bada",
  "gallery": [
    "https://images.unsplash.com/photo-1599661046289-e31897846e41"
  ],
  "overview": "Experience the regal majesty of Rajasthan...",
  "highlights": ["Mehrangarh Fort private access", "Osian dunes desert camp"],
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival in Blue City",
      "desc": "Check-in to luxury haveli and explore old bazaars."
    }
  ],
  "inclusions": ["Accommodation", "Transfers", "Breakfast"],
  "exclusions": ["Airfare", "Personal expenses"],
  "faqs": [
    { "question": "Are meals included?", "answer": "Daily breakfast is included." }
  ],
  "badge": "Featured",
  "featured": true,
  "status": "Active"
}
```

#### 4. Update Tour Package
- **Endpoint:** `PUT /tours/:id`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)
- **Request Body:** Partial update fields matching `createTourSchema`.

#### 5. Delete Tour Package
- **Endpoint:** `DELETE /tours/:id`
- **Auth:** `Bearer Token` (Roles: `Super Admin`)

---

### 🏙️ Cities & Destinations Module (`/cities`)

#### 1. Get All Cities
- **Endpoint:** `GET /cities`
- **Auth:** Public
- **Query Parameters:**
  - `search`: String
  - `categoryId`: String
  - `featured`: Boolean
  - `status`: String (`Published` / `Draft`, default: `Published`)
  - `page`: Number
  - `limit`: Number

#### 2. Get City by ID or Slug
- **Endpoint:** `GET /cities/:idOrSlug`
- **Auth:** Public (e.g. `GET /cities/jodhpur` or `GET /cities/67cb10118f12345678901234`)

#### 3. Create City
- **Endpoint:** `POST /cities`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)
- **Request Body:**
```json
{
  "name": "Jodhpur",
  "slug": "jodhpur",
  "categoryId": "67cb00118f1234567890abcd",
  "state": "Rajasthan",
  "tagline": "The Sun City & The Blue Haven",
  "heroTitle": "Explore the Golden Sands and Cobalt Haveli Streets of Jodhpur",
  "bannerImage": "https://images.unsplash.com/photo-1548013146-72479768bada",
  "gallery": [
    "https://images.unsplash.com/photo-1599661046289-e31897846e41"
  ],
  "highlights": ["Mehrangarh Fort", "Jaswant Thada", "Umaid Bhawan Palace", "Clock Tower Market"],
  "faqs": [
    { "question": "Why is Jodhpur called Blue City?", "answer": "The houses are painted indigo blue to keep them cool." }
  ],
  "featured": true,
  "status": "Published"
}
```

#### 4. Update City
- **Endpoint:** `PUT /cities/:id`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)

#### 5. Delete City
- **Endpoint:** `DELETE /cities/:id`
- **Auth:** `Bearer Token` (Roles: `Super Admin`)

---

### 🏷️ Destination Categories Module (`/destination-categories`)

#### 1. Get All Categories
- **Endpoint:** `GET /destination-categories`
- **Auth:** Public
- **Response `200 OK`:** Returns list of active categories sorted by `order`.

#### 2. Get Category by ID or Slug
- **Endpoint:** `GET /destination-categories/:idOrSlug`
- **Auth:** Public

#### 3. Create Category
- **Endpoint:** `POST /destination-categories`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)
- **Request Body:**
```json
{
  "name": "Royal Heritage",
  "slug": "royal-heritage",
  "tagline": "Step into Palaces and Forts of Rajput Kings",
  "description": "Discover opulent architecture, museum treasures, and rich legacy.",
  "coverImage": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220",
  "order": 1,
  "status": "Active"
}
```

#### 4. Update Category
- **Endpoint:** `PUT /destination-categories/:id`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)

#### 5. Delete Category
- **Endpoint:** `DELETE /destination-categories/:id`
- **Auth:** `Bearer Token` (Roles: `Super Admin`)

---

### 💳 Bookings Module (`/bookings`)

#### 1. Create Booking (Public & Logged-in Users)
- **Endpoint:** `POST /bookings`
- **Auth:** Optional (If user is logged in, booking automatically links to their user ID)
- **Request Body:**
```json
{
  "tourId": "67cb1a238f1234567890abcd",
  "customerName": "Rahul Verma",
  "customerEmail": "rahul@example.com",
  "customerPhone": "+91 9876501234",
  "travelDate": "2026-10-15",
  "guests": {
    "adults": 2,
    "children": 1
  },
  "totalAmount": 29998,
  "paymentMethod": "Razorpay",
  "specialRequests": "Vegetarian meals preferred."
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Booking created successfully",
  "data": {
    "id": "67cb2a998f12345678905678",
    "bookingNumber": "JV-BK-2026-1001",
    "status": "Confirmed",
    "paymentStatus": "Paid",
    "customerName": "Rahul Verma",
    "customerEmail": "rahul@example.com",
    "totalAmount": 29998,
    "travelDate": "2026-10-15T00:00:00.000Z",
    "createdAt": "2026-03-01T10:30:00.000Z"
  }
}
```

#### 2. Get My Bookings (Customer Portal)
- **Endpoint:** `GET /bookings/my-bookings`
- **Auth:** `Bearer Token` (Customer)
- **Response `200 OK`:** Returns array of bookings belonging to the authenticated user.

#### 3. Get Single Booking by ID
- **Endpoint:** `GET /bookings/:id`
- **Auth:** `Bearer Token` (Customer can view their own booking; Admins can view any)

#### 4. Get All Bookings (Admin Panel)
- **Endpoint:** `GET /bookings`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)
- **Query Parameters:**
  - `status`: `Pending` | `Confirmed` | `Completed` | `Cancelled` | `All`
  - `paymentStatus`: `Pending` | `Paid` | `Refunded` | `Failed` | `All`
  - `search`: String (searches name, email, phone, booking number, tour title)
  - `page`: Number
  - `limit`: Number

#### 5. Update Booking Status (Admin)
- **Endpoint:** `PATCH /bookings/:id/status`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)
- **Request Body:**
```json
{
  "status": "Confirmed",
  "paymentStatus": "Paid"
}
```

#### 6. Cancel Booking
- **Endpoint:** `POST /bookings/:id/cancel`
- **Auth:** `Bearer Token`
- **Request Body:**
```json
{
  "reason": "Change of travel plans"
}
```

---

### 📩 Enquiries & Contact Module (`/enquiries`)

#### 1. Submit Enquiry / Contact Form
- **Endpoint:** `POST /enquiries`
- **Auth:** Public
- **Request Body:**
```json
{
  "name": "Pooja Sharma",
  "email": "pooja@example.com",
  "phone": "+91 9988776655",
  "tourId": "67cb1a238f1234567890abcd",
  "travelDate": "2026-11-20",
  "guestsCount": 4,
  "message": "Looking for a luxury desert camp experience with private guide.",
  "type": "Custom Tour"
}
```
*(Valid `type` values: `General Contact`, `Custom Tour`, `Package Booking Enquiry`)*

#### 2. Get All Enquiries (Admin / Staff)
- **Endpoint:** `GET /enquiries`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`, `Editor`)
- **Query Parameters:**
  - `status`: `New` | `In Progress` | `Contacted` | `Converted` | `Closed` | `All`
  - `type`: String
  - `search`: String
  - `page`: Number
  - `limit`: Number

#### 3. Update Enquiry Status
- **Endpoint:** `PATCH /enquiries/:id/status`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`, `Editor`)
- **Request Body:**
```json
{
  "status": "Contacted",
  "note": "Called customer, shared custom itinerary pdf."
}
```

#### 4. Delete Enquiry
- **Endpoint:** `DELETE /enquiries/:id`
- **Auth:** `Bearer Token` (Roles: `Super Admin`)

---

### ⭐ Reviews & Testimonials Module (`/reviews`)

#### 1. Get Reviews
- **Endpoint:** `GET /reviews`
- **Auth:** Public
- **Query Parameters:**
  - `tourId`: String (filter reviews for specific tour)
  - `featured`: Boolean (`true` / `false`)
  - `status`: String (Admin can filter `Pending` / `Approved` / `Rejected`, default: `Approved` for public)

#### 2. Submit Review
- **Endpoint:** `POST /reviews`
- **Auth:** Optional (Logged-in or Guest)
- **Request Body:**
```json
{
  "tourId": "67cb1a238f1234567890abcd",
  "authorName": "Amit Saxena",
  "authorAvatar": "https://...",
  "authorLocation": "Mumbai, India",
  "rating": 5,
  "title": "Unforgettable Blue City experience!",
  "comment": "The Mehrangarh fort walk and desert sunset were majestic.",
  "photos": ["https://images.unsplash.com/..."]
}
```

#### 3. Update Review Status (Admin Moderation)
- **Endpoint:** `PATCH /reviews/:id/status`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`, `Editor`)
- **Request Body:**
```json
{
  "status": "Approved",
  "featured": true
}
```

#### 4. Delete Review
- **Endpoint:** `DELETE /reviews/:id`
- **Auth:** `Bearer Token` (Roles: `Super Admin`)

---

### 📝 Blogs & Stories Module (`/blogs`)

#### 1. Get All Blogs
- **Endpoint:** `GET /blogs`
- **Auth:** Public
- **Query Parameters:**
  - `category`: String
  - `search`: String
  - `featured`: Boolean
  - `status`: String (`Published` / `Draft`, default: `Published`)
  - `page`: Number
  - `limit`: Number

#### 2. Get Single Blog by ID or Slug
- **Endpoint:** `GET /blogs/:idOrSlug`
- **Auth:** Public (e.g. `GET /blogs/top-10-things-to-do-in-jodhpur`)

#### 3. Create Blog
- **Endpoint:** `POST /blogs`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`, `Editor`)
- **Request Body:**
```json
{
  "title": "Top 10 Hidden Gems in Jodhpur",
  "slug": "top-10-hidden-gems-in-jodhpur",
  "excerpt": "Discover the lesser-known stepwells, secret cafes, and vintage stepwells of Jodhpur.",
  "content": "Full markdown or rich text content of the article...",
  "coverImage": "https://images.unsplash.com/photo-1548013146-72479768bada",
  "category": "Travel Guide",
  "tags": ["Jodhpur", "Rajasthan", "Heritage", "Travel Tips"],
  "author": {
    "name": "Vikram Rathore",
    "avatar": "https://...",
    "role": "Heritage Historian"
  },
  "readTime": "6 min read",
  "featured": true,
  "status": "Published"
}
```

#### 4. Update Blog
- **Endpoint:** `PUT /blogs/:id`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`, `Editor`)

#### 5. Delete Blog
- **Endpoint:** `DELETE /blogs/:id`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)

---

### 👥 Customer & Staff Management Module

#### 1. Get Customer List (Admin)
- **Endpoint:** `GET /customers`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)
- **Query Parameters:** `search`, `status` (`Active` / `Blocked`), `page`, `limit`
- **Response:** List of customers along with aggregated metrics (`totalBookings`, `totalSpent`, `lastBookingDate`).

#### 2. Get Staff List (Super Admin)
- **Endpoint:** `GET /users/staff`
- **Auth:** `Bearer Token` (Roles: `Super Admin`)

#### 3. Create Staff Member (Super Admin)
- **Endpoint:** `POST /users/staff`
- **Auth:** `Bearer Token` (Roles: `Super Admin`)
- **Request Body:**
```json
{
  "name": "Rajendra Singh",
  "email": "rajendra@jodhpurvoyage.com",
  "password": "staffPassword123",
  "role": "Admin",
  "permissions": ["tours", "bookings", "enquiries"]
}
```

#### 4. Toggle User Status (Block / Unblock)
- **Endpoint:** `PATCH /users/:id/status`
- **Auth:** `Bearer Token` (Roles: `Super Admin`)
- **Request Body:**
```json
{
  "status": "Blocked"
}
```

#### 5. Delete Staff Member
- **Endpoint:** `DELETE /users/:id`
- **Auth:** `Bearer Token` (Roles: `Super Admin`)

---

### 👳 Team & Guides Module (`/team`)

#### 1. Get Active Team Members (Public)
- **Endpoint:** `GET /team`
- **Auth:** Public

#### 2. Get All Team Members (Admin)
- **Endpoint:** `GET /team/admin`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)

#### 3. Add Team Member
- **Endpoint:** `POST /team`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)
- **Request Body:**
```json
{
  "name": "Gaj Singh Rathore",
  "role": "Chief Heritage Guide",
  "bio": "Certified historian with 15+ years guiding royal delegations in Mehrangarh.",
  "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  "experienceYears": 15,
  "socials": {
    "instagram": "https://instagram.com/...",
    "linkedin": "https://linkedin.com/..."
  },
  "order": 1,
  "status": "Active"
}
```

#### 4. Update Team Member
- **Endpoint:** `PUT /team/:id`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)

#### 5. Delete Team Member
- **Endpoint:** `DELETE /team/:id`
- **Auth:** `Bearer Token` (Roles: `Super Admin`)

---

### ⚙️ Site Settings Module (`/settings`)

#### 1. Get Site Settings
- **Endpoint:** `GET /settings`
- **Auth:** Public
- **Response `200 OK`:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Site settings retrieved",
  "data": {
    "siteName": "Jodhpur Voyage",
    "siteTagline": "Luxury Heritage Travel & Royal Experiences in Blue City",
    "supportEmail": "concierge@jodhpurvoyage.com",
    "supportPhone": "+91 291 254 8900",
    "address": "Haveli Tower, Clock Tower Road, Old City, Jodhpur, Rajasthan 342001",
    "currency": "INR",
    "currencySymbol": "₹",
    "maintenanceMode": false
  }
}
```

#### 2. Update Site Settings
- **Endpoint:** `PUT /settings`
- **Auth:** `Bearer Token` (Roles: `Super Admin`)
- **Request Body:** Full or partial settings object.

---

### 📊 Analytics & Metrics Module (`/analytics`)

#### 1. Get Executive Dashboard Metrics
- **Endpoint:** `GET /analytics/dashboard`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)
- **Response `200 OK`:** Returns `totalRevenue`, `revenueGrowth`, `totalBookings`, `bookingsGrowth`, `totalCustomers`, `activePackages`, `totalCities`, `pendingEnquiries`, `averageRating`, `recentBookings`, and `recentEnquiries`.

#### 2. Get Revenue Trend (Last 6 Months)
- **Endpoint:** `GET /analytics/revenue`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)
- **Response `200 OK`:** Array of monthly revenue and booking volumes for chart rendering.

#### 3. Get Category Popularity Breakdown
- **Endpoint:** `GET /analytics/popularity`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`)
- **Response `200 OK`:** Distribution of bookings and revenue across tour categories.

---

### ☁️ File & Media Upload Module (`/upload`)

#### 1. Upload Single Image
- **Endpoint:** `POST /upload/single`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`, `Editor`)
- **Content-Type:** `multipart/form-data`
- **Form Field Name:** `image` (File: jpg, png, webp, jpeg - Max 5MB)
- **Response `200 OK`:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/.../image.webp",
    "public_id": "jodhpur_voyage/media/xyz123",
    "format": "webp",
    "bytes": 245120
  }
}
```

#### 2. Upload Multiple Images (Up to 10)
- **Endpoint:** `POST /upload/multiple`
- **Auth:** `Bearer Token` (Roles: `Super Admin`, `Admin`, `Editor`)
- **Content-Type:** `multipart/form-data`
- **Form Field Name:** `images` (Multiple Files - Max 10)
- **Response `200 OK`:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "3 images uploaded successfully",
  "data": [
    { "url": "https://res.cloudinary.com/.../img1.webp", "public_id": "..." },
    { "url": "https://res.cloudinary.com/.../img2.webp", "public_id": "..." }
  ]
}
```

---

## 🛑 Common Error Status Codes & Response Format

All error responses adhere to standard JSON error format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Error / Invalid credentials / Not found",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

| HTTP Status | Meaning | Reason |
|---|---|---|
| `200 OK` | Success | Successful retrieval or update |
| `201 Created` | Resource Created | Successful creation of booking, user, tour, enquiry |
| `400 Bad Request` | Validation Failure | Missing or invalid parameters in request body/query |
| `401 Unauthorized` | Not Logged In | Token missing, invalid, or expired |
| `403 Forbidden` | Access Denied | Role does not have permission for the endpoint |
| `404 Not Found` | Not Found | Requested tour, city, user, or route doesn't exist |
| `409 Conflict` | Conflict | Email or tour slug already exists |
| `429 Too Many Requests`| Rate Limited | Too many requests in short period |
| `500 Server Error` | Internal Server Error | Unhandled server exception |
