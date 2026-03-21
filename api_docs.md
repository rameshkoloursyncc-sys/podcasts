# 🎙️ Podcast Guest Management API

A multi-tenant REST API built with **Laravel 13 + Sanctum** for managing podcast guests, episodes, bookings, and pipeline stages. Perfect for podcast producers who need to organize their guest outreach, scheduling, and episode management in one place.

## ✨ Features

- **Multi-tenant architecture** - Each podcast operates in isolation
- **Guest pipeline management** - Track guests through stages from identification to publication
- **Episode management** - Create, schedule, and publish episodes
- **Booking system** - Schedule recording sessions with guests
- **Collaborative notes** - Add notes to guests, episodes, and bookings
- **Team management** - Multiple users per tenant with role-based access
- **RESTful API** - Clean, consistent API endpoints
- **Token authentication** - Secure API access with Laravel Sanctum

## 🛠️ Tech Stack

- **PHP 8.3+**
- **Laravel 13**
- **Laravel Sanctum** (API authentication)
- **MySQL / PostgreSQL / SQLite**
- **Tailwind CSS + Vite** (for any frontend assets)
- **Composer** (dependency management)

## 📋 API Overview

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get token
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/me` - Get current user info
- `PATCH /api/auth/me` - Update current user

### Core Resources

- `GET|POST /api/guests` - Manage podcast guests
- `GET|POST /api/episodes` - Manage podcast episodes
- `GET|POST /api/bookings` - Manage recording bookings
- `GET|POST /api/notes` - Manage notes (polymorphic)
- `GET|POST /api/pipeline-stages` - Manage guest pipeline stages
- `GET|POST /api/users` - Manage team users

### Special Endpoints

- `PATCH /api/guests/{id}/move` - Move guest to different pipeline stage
- `PATCH /api/episodes/{id}/status` - Update episode status
- `PATCH /api/bookings/{id}/confirm|cancel|complete` - Update booking status
- `POST /api/pipeline-stages/reorder` - Reorder pipeline stages
- `GET /api/dashboard` - Get dashboard statistics

## 🚀 Local Setup

### Quick Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd podcast-api

# Run the automated setup script
composer run setup

# Start development servers
composer run dev
```

The setup script will:

- Install PHP dependencies
- Copy `.env.example` to `.env`
- Generate application key
- Run database migrations
- Install Node dependencies
- Build frontend assets

### Manual Setup

```bash
# 1. Install dependencies
composer install
npm install

# 2. Environment configuration
cp .env.example .env
php artisan key:generate

# 3. Database setup
# Configure your database in .env, then:
php artisan migrate

# 4. (Optional) Seed demo data
php artisan db:seed

# 5. Build assets
npm run build

# 6. Start the development server
php artisan serve
# API available at http://localhost:8000/api
```

### Database Options

**MySQL/PostgreSQL:**

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=podcast_api
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

**SQLite (quickest setup):**

```env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/podcast-api/database/database.sqlite
```

Then run: `touch database/database.sqlite`

## 🎯 Demo Data

When you run `php artisan db:seed`, it creates a demo tenant called "The Founders Pod" with:

- **Owner account:** `owner@founderspod.com` / `password`
- **Editor account:** `editor@founderspod.com` / `password`
- Sample guests at different pipeline stages
- Published and upcoming episodes
- Recording bookings
- Example notes

## 📚 API Documentation

### Authentication

All protected endpoints require a Bearer token. Include in headers:

```
Authorization: Bearer your_token_here
```

### Response Format

All responses follow a consistent JSON structure:

```json
{
    "success": true,
    "message": "OK",
    "data": {
        /* resource data */
    }
}
```

### Error Responses

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": {
        "field": ["Validation error messages"]
    }
}
```

### Pagination

List endpoints support pagination:

```
GET /api/guests?page=1&per_page=15
```

Response includes pagination metadata:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "data": [...],
    "links": {...},
    "meta": {
      "current_page": 1,
      "per_page": 15,
      "total": 100
    }
  }
}
```

## 🔧 Development

### Available Commands

```bash
# Start all development services
composer run dev

# Run tests
composer run test

# Code formatting
./vendor/bin/pint

# Start only the API server
php artisan serve

# Start only the asset watcher
npm run dev
```

### Project Structure

```
app/
├── Models/           # Eloquent models
├── Http/Controllers/ # API controllers
├── Providers/        # Service providers
config/               # Configuration files
database/
├── migrations/       # Database schema
├── seeders/          # Demo data
routes/
└── api.php           # API routes
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `composer run test`
5. Submit a pull request

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are issued on register/login and are **tenant-scoped** — a user can only access data within their own tenant.

---

## API Reference

Base URL: `http://localhost:8000/api`

All responses follow this envelope:

```json
{
  "success": true,
  "message": "OK",
  "data": { ... }
}
```

Errors:

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": { "field": ["message"] }
}
```

---

### 🔐 Auth

| Method | Endpoint         | Auth | Description                  |
| ------ | ---------------- | ---- | ---------------------------- |
| POST   | `/auth/register` | ❌   | Register tenant + owner user |
| POST   | `/auth/login`    | ❌   | Login, returns token         |
| POST   | `/auth/logout`   | ✅   | Revoke current token         |
| GET    | `/auth/me`       | ✅   | Get authenticated user       |
| PATCH  | `/auth/me`       | ✅   | Update profile / password    |

**Register:**

```json
POST /api/auth/register
{
  "tenant_name":  "The Founders Pod",
  "tenant_slug":  "founders-pod",
  "display_name": "Alex Rivera",
  "email":        "alex@founderspod.com",
  "password":     "secret123",
  "password_confirmation": "secret123"
}
```

Creates a new tenant with default pipeline stages (Identified, Outreached, Responded, Confirmed, Recorded, Published).

**Login:**

```json
POST /api/auth/login
{
  "email":    "alex@founderspod.com",
  "password": "secret123"
}
```

---

### 📊 Dashboard

| Method | Endpoint     | Description                                                |
| ------ | ------------ | ---------------------------------------------------------- |
| GET    | `/dashboard` | Stats snapshot: totals, pipeline counts, upcoming bookings |

---

### 👤 Guests

| Method | Endpoint            | Description                              |
| ------ | ------------------- | ---------------------------------------- |
| GET    | `/guests`           | List all guests (paginated)              |
| POST   | `/guests`           | Create a guest                           |
| GET    | `/guests/{id}`      | Get guest with episodes, bookings, notes |
| PATCH  | `/guests/{id}`      | Update guest                             |
| DELETE | `/guests/{id}`      | Soft-delete guest                        |
| PATCH  | `/guests/{id}/move` | Move guest to a different pipeline stage |

**Query params for GET /guests:**

- `stage_id` — filter by pipeline stage UUID
- `search` — search name or email
- `sort_by` — `name`, `created_at`, `updated_at`
- `sort_dir` — `asc`, `desc`
- `per_page` — default 20

**Create Guest:**

```json
POST /api/guests
{
  "name":       "Kunal Shah",
  "email":      "kunal@example.com",
  "bio":        "Founder of CRED.",
  "stage_id":   "uuid-of-stage",
  "avatar_url": "https://..."
}
```

**Move Guest:**

```json
PATCH /api/guests/{id}/move
{
  "stage_id": "uuid-of-target-stage"
}
```

---

### 🎬 Episodes

| Method | Endpoint                | Description                            |
| ------ | ----------------------- | -------------------------------------- |
| GET    | `/episodes`             | List all episodes (paginated)          |
| POST   | `/episodes`             | Create an episode                      |
| GET    | `/episodes/{id}`        | Get episode with guest, booking, notes |
| PATCH  | `/episodes/{id}`        | Update episode                         |
| DELETE | `/episodes/{id}`        | Soft-delete episode                    |
| PATCH  | `/episodes/{id}/status` | Update status only                     |

**Statuses:** `draft` → `scheduled` → `recorded` → `published`

**Query params for GET /episodes:**

- `guest_id`, `status`, `search`, `sort_by`, `sort_dir`, `per_page`

**Create Episode:**

```json
POST /api/episodes
{
  "title":        "Building an Audience from Zero",
  "guest_id":     "uuid",
  "status":       "draft",
  "recorded_at":  "2025-03-10T14:00:00Z",
  "published_at": null
}
```

---

### 📅 Bookings

| Method | Endpoint                  | Description                            |
| ------ | ------------------------- | -------------------------------------- |
| GET    | `/bookings`               | List all bookings (paginated)          |
| POST   | `/bookings`               | Create a booking                       |
| GET    | `/bookings/{id}`          | Get booking with guest, episode, notes |
| PATCH  | `/bookings/{id}`          | Update booking                         |
| DELETE | `/bookings/{id}`          | Soft-delete booking                    |
| PATCH  | `/bookings/{id}/confirm`  | Mark as confirmed                      |
| PATCH  | `/bookings/{id}/cancel`   | Mark as cancelled                      |
| PATCH  | `/bookings/{id}/complete` | Mark as completed                      |

**Statuses:** `pending` → `confirmed` → `completed` / `cancelled`

**Query params for GET /bookings:**

- `guest_id`, `episode_id`, `status`, `from` (date), `to` (date), `sort_by`, `sort_dir`, `per_page`

**Create Booking:**

```json
POST /api/bookings
{
  "guest_id":         "uuid",
  "episode_id":       "uuid",
  "scheduled_at":     "2025-04-15T10:00:00Z",
  "duration_minutes": 60
}
```

---

### 📝 Notes

Notes attach to any entity: `guest`, `episode`, or `booking`.

| Method | Endpoint                                  | Description                        |
| ------ | ----------------------------------------- | ---------------------------------- |
| GET    | `/notes?entity_type=guest&entity_id=uuid` | List notes for an entity           |
| POST   | `/notes`                                  | Add a note                         |
| GET    | `/notes/{id}`                             | Get a single note                  |
| PATCH  | `/notes/{id}`                             | Edit note (author or admin only)   |
| DELETE | `/notes/{id}`                             | Delete note (author or admin only) |

**Create Note:**

```json
POST /api/notes
{
  "entity_type": "guest",
  "entity_id":   "uuid",
  "body":        "Reached out on LinkedIn. Prefers async intro."
}
```

---

### 🔀 Pipeline Stages

| Method | Endpoint                   | Description                               |
| ------ | -------------------------- | ----------------------------------------- |
| GET    | `/pipeline-stages`         | List all stages (with guest counts)       |
| POST   | `/pipeline-stages`         | Create a stage (admin only)               |
| GET    | `/pipeline-stages/{id}`    | Get stage                                 |
| PATCH  | `/pipeline-stages/{id}`    | Update label/order (admin only)           |
| DELETE | `/pipeline-stages/{id}`    | Delete stage — only if empty (admin only) |
| POST   | `/pipeline-stages/reorder` | Bulk reorder stages (admin only)          |

**Reorder:**

```json
POST /api/pipeline-stages/reorder
{
  "stages": ["uuid-1", "uuid-2", "uuid-3"]
}
```

The array order determines the new `order` values (1, 2, 3, etc.).

---

### 👥 Team / Users

| Method | Endpoint      | Description                           |
| ------ | ------------- | ------------------------------------- |
| GET    | `/users`      | List all team members (admin only)    |
| POST   | `/users`      | Invite a team member (admin only)     |
| GET    | `/users/{id}` | Get user                              |
| PATCH  | `/users/{id}` | Update user role/details (admin only) |
| DELETE | `/users/{id}` | Remove team member (admin only)       |

**Roles:** `owner`, `admin`, `editor`

- `owner` — full access, created at registration only
- `admin` — can manage team, stages, all data
- `editor` — can manage guests, episodes, bookings, notes

---

## Multi-Tenancy

Every resource is scoped to a `tenant_id`. Users can only see and modify data within their own tenant. This is enforced at the controller level — all queries include `where('tenant_id', $request->user()->tenant_id)`.

---

## Health Check

```
GET /api/health
```

```json
{
    "status": "ok",
    "service": "Podcast API",
    "version": "1.0.0",
    "time": "2025-03-19T12:00:00+00:00"
}
```

---

## Deployment on Hostinger (shared hosting)

Since this is API-only, configure your `.htaccess` in `public/`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

Point your domain's document root to the `public/` folder.

Set these in `.env` for production:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com
```

Run after deploy:

```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan migrate --force
```