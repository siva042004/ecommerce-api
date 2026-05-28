# E-Commerce REST API

A scalable Spring Boot REST API with JWT authentication, covering catalog, cart, orders, and payments — deployed free on Render + Railway MySQL.

## Tech Stack

- **Backend**: Spring Boot 3.2, Java 17
- **Database**: MySQL (Railway free tier)
- **Auth**: JWT (jjwt)
- **Docs**: Swagger / OpenAPI 3
- **Container**: Docker
- **CI/CD**: GitHub Actions
- **Deploy**: Render (free tier)

## API Endpoints (30+)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, get JWT token |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/categories | List all categories |
| GET | /api/categories/{id} | Get category |
| POST | /api/categories | Create (Admin) |
| PUT | /api/categories/{id} | Update (Admin) |
| DELETE | /api/categories/{id} | Delete (Admin) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List all products (paginated) |
| GET | /api/products/{id} | Get product |
| GET | /api/products/category/{id} | By category |
| GET | /api/products/search | Search by keyword/price |
| POST | /api/products | Create (Admin) |
| PUT | /api/products/{id} | Update (Admin) |
| DELETE | /api/products/{id} | Soft delete (Admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cart | Get cart |
| POST | /api/cart/items | Add item |
| PUT | /api/cart/items/{id} | Update quantity |
| DELETE | /api/cart/items/{id} | Remove item |
| DELETE | /api/cart | Clear cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Place order from cart |
| GET | /api/orders/{id} | Get order |
| GET | /api/orders/my-orders | User's orders |
| GET | /api/orders/admin/all | All orders (Admin) |
| PATCH | /api/orders/admin/{id}/status | Update status (Admin) |
| POST | /api/orders/{id}/cancel | Cancel order |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payments | Process payment |
| GET | /api/payments/order/{orderId} | Get payment for order |

## Local Development

### Option 1 — Docker Compose (Recommended)
```bash
docker-compose up --build
```
App: http://localhost:8080  
Swagger: http://localhost:8080/swagger-ui.html

### Option 2 — Run with local MySQL
1. Create database: `CREATE DATABASE ecommerce_db;`
2. Update `application.properties` with your credentials
3. `mvn spring-boot:run`

## Free Deployment Guide

### Step 1 — Free MySQL on Railway
1. Go to https://railway.app → New Project → MySQL
2. Copy the `DATABASE_URL`, `MYSQLUSER`, `MYSQLPASSWORD`

### Step 2 — Deploy on Render
1. Push this repo to GitHub
2. Go to https://render.com → New Web Service → Connect GitHub repo
3. Select **Docker** as runtime
4. Set environment variables:
   ```
   DATABASE_URL=jdbc:mysql://<railway-host>:<port>/railway?useSSL=true&allowPublicKeyRetrieval=true
   DATABASE_USERNAME=<railway-user>
   DATABASE_PASSWORD=<railway-password>
   JWT_SECRET=<any-random-base64-string>
   JWT_EXPIRATION=86400000
   ```
5. Deploy — Swagger UI available at `https://your-app.onrender.com/swagger-ui.html`

### Step 3 — GitHub Actions CI/CD
Add these secrets in GitHub → Settings → Secrets:
```
DOCKER_USERNAME=<dockerhub-username>
DOCKER_PASSWORD=<dockerhub-password>
RENDER_SERVICE_ID=<from render dashboard>
RENDER_API_KEY=<from render account settings>
```

## Default Admin Setup
Register a user, then manually update role in DB:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```
