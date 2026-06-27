# API Contract Specification: B2B Inventory & Ordering System

This document specifies the REST API contract for the B2B Inventory & Ordering Application. It establishes a production-ready interface that frontend teams (React Native + Expo) and backend teams (NestJS + Prisma) can independently build against.

---

## 12. API Standards & Formats

*To ensure structural consistency across all endpoints, the following conventions are strictly enforced system-wide.*

### 12.1 Naming Conventions
*   **Paths**: Always lowercase, kebab-case (e.g., `/api/v1/product-variants`).
*   **JSON Keys**: Always camelCase (e.g., `companyName`, `creditLimit`).
*   **Database Tables**: Plural and snake_case (e.g., `product_variants`).
*   **Headers**: Kebab-case (e.g., `X-Device-Id`).

### 12.2 Versioning Strategy
*   **URI Versioning**: Every request path must be prefixed with `/api/v1/`.
*   *Breaking changes (such as database migrations altering required fields) will increment the prefix to `/api/v2/`.*

### 12.3 Base URL Structure
*   Development: `http://localhost:3000/api/v1`
*   Staging: `https://staging-api.b2binventory.com/api/v1`
*   Production: `https://api.b2binventory.com/api/v1`

### 12.4 Standard Error Format (RFC 7807)
All non-2xx responses must return a structured JSON object:

```json
{
  "statusCode": 422,
  "timestamp": "2026-06-25T16:50:00.000Z",
  "path": "/api/v1/orders",
  "error": "Unprocessable Entity",
  "message": "Insufficient stock available for allocation.",
  "code": "INVENTORY_SHORTAGE",
  "details": {
    "variantId": "3b2b8c9d-d8e2-411a-8c88-e9db9a95786a",
    "requested": 50,
    "available": 12
  }
}
```

### 12.5 Validation Failure Format
When request payload validation fails (triggered by NestJS `ValidationPipe` using `class-validator`), the server must return a `400 Bad Request` with structured field issues:

```json
{
  "statusCode": 400,
  "timestamp": "2026-06-25T16:51:00.000Z",
  "path": "/api/v1/customers",
  "error": "Bad Request",
  "message": "Validation failed",
  "code": "VALIDATION_FAILED",
  "details": [
    {
      "field": "gstNumber",
      "constraints": ["gstNumber must match regular expression /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/"]
    },
    {
      "field": "email",
      "constraints": ["email must be a valid email address"]
    }
  ]
}
```

### 12.6 Pagination Format (Cursor-Based)
For high-performance list querying, cursor-based pagination is preferred over offset pagination.
*   **Request Params**: `limit` (default: 20, max: 100), `cursor` (UUID string of the last item in the previous page).
*   **Response Structure**:
```json
{
  "data": [],
  "pagination": {
    "limit": 20,
    "nextCursor": "9c12b9d9-2a94-4f05-82df-776269b82199",
    "hasMore": true
  }
}
```

---

## 1. Authentication APIs

### 1.1 POST `/auth/login`
*   **Purpose**: Authenticate user credentials, generate tokens, and register device.
*   **Permissions**: Public.
*   **Request Body**:
```json
{
  "email": "anil.patel@distributor.com",
  "password": "SecurePassword123!",
  "deviceId": "d8a1c890-e55c-4f7f-85ff-221664bf8789",
  "deviceName": "Samsung S21 - Android 12"
}
```
*   **Response Body (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "8f8c8d8b-1188-4444-9999-777788889999",
    "name": "Anil Patel",
    "email": "anil.patel@distributor.com",
    "role": "STAFF",
    "permissions": ["orders:create", "orders:read", "customers:read", "inventory:read"]
  }
}
```
*   **Validation Rules**:
    *   `email`: Required, valid email format, max 255 chars.
    *   `password`: Required, string, min 8 chars.
    *   `deviceId`: Required, UUID format.
    *   `deviceName`: Optional, string, max 100 chars.
*   **Error Responses**:
    *   `400 Bad Request`: Validation failure.
    *   `401 Unauthorized`: `"Invalid credentials"` or `"User account is deactivated"`.

### 1.2 POST `/auth/logout`
*   **Purpose**: Invalidate current refresh token and clear device session.
*   **Permissions**: Authenticated (Any Role).
*   **Request Headers**: `Authorization: Bearer <accessToken>`
*   **Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
*   **Response Body (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```
*   **Validation Rules**:
    *   `refreshToken`: Required, JWT structure.
*   **Error Responses**:
    *   `400 Bad Request`: Token missing or malformed.
    *   `401 Unauthorized`: Token expired or blacklisted.

### 1.3 POST `/auth/refresh`
*   **Purpose**: Rotate expired Access Tokens using a valid Refresh Token.
*   **Permissions**: Public (Refreshes credentials).
*   **Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
*   **Response Body (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new...",
  "expiresIn": 900
}
```
*   **Validation Rules**:
    *   `refreshToken`: Required, valid JWT.
*   **Error Responses**:
    *   `401 Unauthorized`: `"Invalid or expired refresh token"`.
    *   `403 Forbidden`: `"Token rotation breach detected"`. *(Triggers automatic revocation of all user tokens if a refresh token is reused).*

### 1.4 POST `/auth/forgot-password`
*   **Purpose**: Request a password reset link/token.
*   **Permissions**: Public.
*   **Request Body**:
```json
{
  "email": "anil.patel@distributor.com"
}
```
*   **Response Body (200 OK)**:
```json
{
  "success": true,
  "message": "If the account exists, a password reset link has been dispatched."
}
```
*   **Validation Rules**:
    *   `email`: Required, valid email string.
*   **Error Responses**:
    *   `400 Bad Request`: Validation failure.

### 1.5 POST `/auth/reset-password`
*   **Purpose**: Reset user password using the token sent via email/SMS.
*   **Permissions**: Public.
*   **Request Body**:
```json
{
  "token": "reset-token-received-in-email",
  "newPassword": "NewStrongPassword123!"
}
```
*   **Response Body (200 OK)**:
```json
{
  "success": true,
  "message": "Password reset completed successfully. You may now log in."
}
```
*   **Validation Rules**:
    *   `token`: Required, alphanumeric string.
    *   `newPassword`: Required, min 8 characters, must contain at least 1 uppercase letter, 1 number, and 1 special character.
*   **Error Responses**:
    *   `400 Bad Request`: Weak password or invalid token schema.
    *   `410 Gone`: `"Reset token has expired (expires in 1 hour)"`.

---

## 2. Customer APIs

### 2.1 POST `/customers`
*   **Purpose**: Create a B2B customer profile and map it to a newly generated user account.
*   **Permissions**: `SUPER_ADMIN`.
*   **Request Body**:
```json
{
  "name": "Rajkot Fittings Corp",
  "email": "billing@rajkotfittings.com",
  "phone": "+919825012345",
  "companyName": "Rajkot Fittings Private Limited",
  "billingAddress": "GIDC Sector 2, Plot 45A, Rajkot, Gujarat, 360003",
  "shippingAddress": "Warehouse B, GIDC Sector 2, Plot 45A, Rajkot, Gujarat, 360003",
  "gstNumber": "24AAAAC1234A1Z5",
  "creditLimit": 500000.00,
  "assignedStaffId": "5f5c8d8b-2299-4444-9999-777788889999"
}
```
*   **Response Body (201 Created)**:
```json
{
  "id": "e2c2b3a1-1234-4a2b-8a8b-123456789abc",
  "userId": "9f9c8d8b-1188-4444-9999-777788889999",
  "companyName": "Rajkot Fittings Private Limited",
  "gstNumber": "24AAAAC1234A1Z5",
  "creditLimit": 500000.00,
  "currentDueBalance": 0.00,
  "assignedStaffId": "5f5c8d8b-2299-4444-9999-777788889999",
  "isActive": true
}
```
*   **Validation Rules**:
    *   `gstNumber`: Optional, must match `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$` (Indian GST format).
    *   `creditLimit`: Required, minimum 0.
    *   `assignedStaffId`: Optional, must be a valid UUID.
*   **Error Responses**:
    *   `400 Bad Request`: Email already registered, or validation failure.
    *   `403 Forbidden`: Non-admin trying to register a customer.

### 2.2 PATCH `/customers/:id`
*   **Purpose**: Update details of a customer (e.g. adjust credit limit, reassign sales rep).
*   **Permissions**: `SUPER_ADMIN`, `STAFF` (Limited to billing/shipping addresses).
*   **Request Body**:
```json
{
  "companyName": "Rajkot Fittings Group LLC",
  "creditLimit": 600000.00,
  "assignedStaffId": "6f6c8d8b-3300-5555-0000-888899990000"
}
```
*   **Response Body (200 OK)**:
```json
{
  "id": "e2c2b3a1-1234-4a2b-8a8b-123456789abc",
  "companyName": "Rajkot Fittings Group LLC",
  "creditLimit": 600000.00,
  "currentDueBalance": 125000.00,
  "assignedStaffId": "6f6c8d8b-3300-5555-0000-888899990000"
}
```
*   **Error Responses**:
    *   `403 Forbidden`: Staff member attempting to modify `creditLimit` (Admin permission required).
    *   `404 Not Found`: Customer ID does not exist.

### 2.3 GET `/customers/:id`
*   **Purpose**: Retrieve full profile detail for a specific customer.
*   **Permissions**: `SUPER_ADMIN`, `STAFF` (only if assigned or admin), `CUSTOMER` (only if matching own profile).
*   **Response Body (200 OK)**:
```json
{
  "id": "e2c2b3a1-1234-4a2b-8a8b-123456789abc",
  "companyName": "Rajkot Fittings Group LLC",
  "billingAddress": "GIDC Sector 2, Plot 45A, Rajkot, Gujarat, 360003",
  "shippingAddress": "Warehouse B, GIDC Sector 2, Plot 45A, Rajkot, Gujarat, 360003",
  "gstNumber": "24AAAAC1234A1Z5",
  "creditLimit": 600000.00,
  "currentDueBalance": 125000.00,
  "user": {
    "name": "Rajesh Mehta",
    "email": "billing@rajkotfittings.com",
    "phone": "+919825012345"
  },
  "assignedStaff": {
    "id": "6f6c8d8b-3300-5555-0000-888899990000",
    "name": "Anil Patel"
  }
}
```

### 2.4 GET `/customers`
*   **Purpose**: Paginated listing of customers with filter parameters.
*   **Permissions**: `SUPER_ADMIN`, `STAFF`.
*   **Query Parameters**:
    *   `limit`: Number, default `20`.
    *   `cursor`: UUID.
    *   `search`: String (Fuzzy search on companyName, contact name, email).
    *   `assignedStaffId`: UUID (Filters to specific sales rep).
    *   `overdue`: Boolean (If `true`, returns customers where `currentDueBalance > creditLimit` or past due dates).
*   **Response Body (200 OK)**:
```json
{
  "data": [
    {
      "id": "e2c2b3a1-1234-4a2b-8a8b-123456789abc",
      "companyName": "Rajkot Fittings Group LLC",
      "currentDueBalance": 125000.00,
      "creditLimit": 600000.00,
      "contactName": "Rajesh Mehta",
      "phone": "+919825012345"
    }
  ],
  "pagination": {
    "limit": 20,
    "nextCursor": "e2c2b3a1-1234-4a2b-8a8b-123456789abc",
    "hasMore": false
  }
}
```

### 2.5 GET `/customers/profile`
*   **Purpose**: Retrieve details of the currently logged-in customer role user.
*   **Permissions**: `CUSTOMER`.
*   **Response Body (200 OK)**:
*(Equivalent output payload schema as 2.3, implicitly fetched using token claims).*

---

## 3. Product APIs

### 3.1 GET `/categories`
*   **Purpose**: Retrieve all active product categories.
*   **Permissions**: Authenticated (Any Role).
*   **Response Body (200 OK)**:
```json
{
  "categories": [
    { "id": "cat-1", "name": "Cabinet Handles", "activeSkuCount": 42 },
    { "id": "cat-2", "name": "Main Door Knobs", "activeSkuCount": 18 },
    { "id": "cat-3", "name": "Concealed Pulls", "activeSkuCount": 24 }
  ]
}
```

### 3.2 GET `/products`
*   **Purpose**: Paginated catalog of products containing nested SKU variant matrix grids and Available-To-Promise (ATP) stock.
*   **Permissions**: Authenticated (Any Role).
*   **Query Parameters**:
    *   `limit`: Number, default `20`.
    *   `cursor`: UUID.
    *   `search`: String (Fuzzy text match on product name or SKU).
    *   `category`: String (Category name filter).
*   **Response Body (200 OK)**:
```json
{
  "data": [
    {
      "id": "a1b2c3d4-1111-2222-3333-444455556666",
      "name": "Classic Brass Handle Model A",
      "description": "Premium solid brass cabinet handle.",
      "category": "Cabinet Handles",
      "imageUrl": "https://s3.amazonaws.com/hardware-images/handle-a.jpg",
      "variants": [
        {
          "id": "v1112223-3333-4444-5555-666677778888",
          "sku": "HDL-A-128-BLK",
          "size": "128mm",
          "finish": "Black Matt",
          "unitPrice": 180.00,
          "boxPackQty": 10,
          "availableStock": 140,
          "version": 1
        },
        {
          "id": "v9998887-3333-4444-5555-666677778888",
          "sku": "HDL-A-128-CP",
          "size": "128mm",
          "finish": "Chrome Plated",
          "unitPrice": 195.00,
          "boxPackQty": 10,
          "availableStock": 0,
          "version": 2
        }
      ]
    }
  ],
  "pagination": {
    "limit": 20,
    "nextCursor": "a1b2c3d4-1111-2222-3333-444455556666",
    "hasMore": false
  }
}
```

### 3.3 POST `/products`
*   **Purpose**: Add a new base product family to the system catalog.
*   **Permissions**: `SUPER_ADMIN`.
*   **Request Body**:
```json
{
  "name": "Zinc Alloy Knob K-2",
  "description": "Sleek round knob for drawers.",
  "category": "Main Door Knobs",
  "imageUrl": "https://s3.amazonaws.com/hardware-images/knob-k2.jpg"
}
```
*   **Response Body (201 Created)**: Returns the created product with assigned UUID.

### 3.4 PATCH `/products/:id`
*   **Purpose**: Update base details of a product (e.g. name, description, image).
*   **Permissions**: `SUPER_ADMIN`.

### 3.5 POST `/products/:id/variants`
*   **Purpose**: Create an SKU variant (Size + Finish combination) for a specific product.
*   **Permissions**: `SUPER_ADMIN`.
*   **Request Body**:
```json
{
  "sku": "KNB-K2-32-SS",
  "size": "32mm",
  "finish": "Satin Stainless",
  "unitPrice": 75.00,
  "boxPackQty": 20
}
```
*   **Response Body (201 Created)**: Returns the newly generated variant mapped to `productId`.

### 3.6 PATCH `/variants/:id`
*   **Purpose**: Update variant pricing or details. Implements optimistic lock prevention using the `version` field.
*   **Permissions**: `SUPER_ADMIN`.
*   **Request Body**:
```json
{
  "unitPrice": 82.50,
  "version": 1
}
```
*   **Response Body (200 OK)**:
```json
{
  "id": "variant-uuid",
  "sku": "KNB-K2-32-SS",
  "unitPrice": 82.50,
  "version": 2
}
```
*   **Error Responses**:
    *   `409 Conflict`: `"Optimistic lock exception. The variant data has changed since last fetched. Please reload."`

### 3.7 POST `/products/:id/image-upload-url`
*   **Purpose**: Generate a presigned S3 upload URL for product variant images to offload processing from NestJS.
*   **Permissions**: `SUPER_ADMIN`, `STAFF`.
*   **Request Body**:
```json
{
  "contentType": "image/jpeg",
  "fileName": "knob-k2.jpg"
}
```
*   **Response Body (200 OK)**:
```json
{
  "uploadUrl": "https://s3.amazonaws.com/hardware-images/knob-k2.jpg?AWSAccessKeyId=AKIA...",
  "publicUrl": "https://s3.amazonaws.com/hardware-images/knob-k2.jpg"
}
```

---

## 4. Inventory APIs

### 4.1 GET `/inventory`
*   **Purpose**: Retrieve detailed physical, reserved, and available stock levels.
*   **Permissions**: `SUPER_ADMIN`, `STAFF`.
*   **Query Parameters**:
    *   `limit`: Number, default `20`.
    *   `cursor`: UUID.
    *   `search`: String (SKU or product name).
    *   `lowStock`: Boolean (Filters items where `availableStock < 50`).
*   **Response Body (200 OK)**:
```json
{
  "data": [
    {
      "variantId": "v1112223-3333-4444-5555-666677778888",
      "sku": "HDL-A-128-BLK",
      "productName": "Classic Brass Handle Model A (128mm / Black Matt)",
      "physicalStock": 150,
      "reservedStock": 10,
      "availableStock": 140,
      "warehouseLocation": "Rack B, Shelf 3"
    }
  ],
  "pagination": {
    "limit": 20,
    "nextCursor": "v1112223-3333-4444-5555-666677778888",
    "hasMore": false
  }
}
```

### 4.2 POST `/inventory/adjust`
*   **Purpose**: Manually adjust physical stock counts for audit reconciliations. Writes to immutable `audit_logs`.
*   **Permissions**: `SUPER_ADMIN`.
*   **Request Body**:
```json
{
  "variantId": "v1112223-3333-4444-5555-666677778888",
  "adjustmentQuantity": -15,
  "reason": "Damaged goods found in packaging area",
  "warehouseLocation": "Rack B, Shelf 3"
}
```
*   **Response Body (200 OK)**:
```json
{
  "variantId": "v1112223-3333-4444-5555-666677778888",
  "sku": "HDL-A-128-BLK",
  "previousPhysical": 150,
  "newPhysical": 135,
  "availableStock": 125,
  "auditLogId": 7824
}
```

### 4.3 GET `/inventory/:variantId/history`
*   **Purpose**: Audit trail displaying physical stock modifications and reservations.
*   **Permissions**: `SUPER_ADMIN`, `STAFF`.
*   **Response Body (200 OK)**:
```json
{
  "variantId": "v1112223-3333-4444-5555-666677778888",
  "history": [
    {
      "timestamp": "2026-06-25T14:30:00Z",
      "action": "INVENTORY_ADJUST",
      "runningPhysical": 135,
      "user": "Suresh Patel (Owner)",
      "reason": "Damaged goods found in packaging area"
    },
    {
      "timestamp": "2026-06-24T10:00:00Z",
      "action": "ORDER_RESERVATION_CREATED",
      "runningPhysical": 150,
      "user": "Anil Patel (Staff)",
      "reason": "Allocated to Order #ORD-10024"
    }
  ]
}
```

---

## 5. Order APIs

*The ordering lifecycle transitions through: `DRAFT` $\rightarrow$ `PENDING_APPROVAL` $\rightarrow$ `APPROVED` $\rightarrow$ `PROCESSING` $\rightarrow$ `DISPATCHED` $\rightarrow$ `DELIVERED` (or `CANCELLED`).*

### 5.1 POST `/orders`
*   **Purpose**: Place a new B2B sales order. Auto-evaluates credit limit thresholds and reserves available stock.
*   **Permissions**: `SUPER_ADMIN`, `STAFF`, `CUSTOMER` (only for self-billing).
*   **Request Body**:
```json
{
  "customerId": "e2c2b3a1-1234-4a2b-8a8b-123456789abc",
  "offlineClientId": "f3b3c4a2-1234-4a2b-8a8b-123456789xyz",
  "paymentTerms": "Credit",
  "items": [
    {
      "variantId": "v1112223-3333-4444-5555-666677778888",
      "quantity": 100,
      "unitPrice": 180.00
    }
  ]
}
```
*   **Response Body (201 Created)**:
```json
{
  "id": "7d7c7b7a-9900-1111-2222-333344445555",
  "orderNumber": "ORD-10024",
  "customerId": "e2c2b3a1-1234-4a2b-8a8b-123456789abc",
  "status": "APPROVED",
  "totalAmount": 18000.00,
  "paymentTerms": "Credit",
  "creditLimitStatus": "APPROVED",
  "items": [
    {
      "id": "item-uuid-1111",
      "variantId": "v1112223-3333-4444-5555-666677778888",
      "quantity": 100,
      "unitPrice": 180.00,
      "allocatedQuantity": 100,
      "backorderQuantity": 0
    }
  ]
}
```
*   **Business Logic & Verification Flow**:
    1.  **Credit Check**: Checks if `customer.currentDueBalance + totalAmount <= customer.creditLimit`. If exceeded, order status defaults to `PENDING_APPROVAL` with metadata: `creditLimitStatus: "EXCEEDED"`.
    2.  **Concurrency Locking**: Runs `SELECT * FROM inventory WHERE variant_id IN (...) FOR UPDATE` to block simultaneous write operations.
    3.  **Stock Allocation**:
        *   If `availableStock >= quantity`: `allocatedQuantity = quantity`, `backorderQuantity = 0`, increments `reserved_stock` by `quantity`.
        *   If `availableStock < quantity`: `allocatedQuantity = availableStock`, `backorderQuantity = quantity - availableStock`, increments `reserved_stock` by `availableStock`.
    4.  All db entries are finalized in a single Postgres transaction boundary.

### 5.2 PATCH `/orders/:id`
*   **Purpose**: Modify items or delivery terms for pending orders.
*   **Permissions**: `SUPER_ADMIN`, `STAFF` (for assigned customers).
*   *Note: Only allowable if status is `DRAFT` or `PENDING_APPROVAL`.*
*   **Request Body**:
```json
{
  "items": [
    {
      "variantId": "v1112223-3333-4444-5555-666677778888",
      "quantity": 120
    }
  ]
}
```
*   **Response Body (200 OK)**:
```json
{
  "id": "7d7c7b7a-9900-1111-2222-333344445555",
  "status": "PENDING_APPROVAL",
  "totalAmount": 21600.00,
  "items": [
    {
      "variantId": "v1112223-3333-4444-5555-666677778888",
      "quantity": 120,
      "allocatedQuantity": 120,
      "backorderQuantity": 0
    }
  ]
}
```

### 5.3 POST `/orders/:id/approve`
*   **Purpose**: Force approve an order held back due to credit limit violations or inventory shortages.
*   **Permissions**: `SUPER_ADMIN`.
*   **Response Body (200 OK)**:
```json
{
  "id": "7d7c7b7a-9900-1111-2222-333344445555",
  "status": "APPROVED",
  "approvedBy": "Suresh Patel"
}
```

### 5.4 POST `/orders/:id/cancel`
*   **Purpose**: Cancel an order and release all allocated reserved stock.
*   **Permissions**: `SUPER_ADMIN`, `STAFF`, `CUSTOMER` (only if order status is still `PENDING_APPROVAL` or `DRAFT`).
*   **Response Body (200 OK)**:
```json
{
  "id": "7d7c7b7a-9900-1111-2222-333344445555",
  "status": "CANCELLED",
  "stockReleased": true
}
```
*   *Backend processes stock release concurrently inside transaction, subtracting `allocatedQuantity` from `inventory.reserved_stock`.*

### 5.5 GET `/orders/:id`
*   **Purpose**: Retrieve full details of an order, line items, allocation states, and linked invoices/dispatches.
*   **Permissions**: Authenticated (Any Role with customer-level isolation).

### 5.6 GET `/orders`
*   **Purpose**: Paginated list of orders with filter queries.
*   **Permissions**: `SUPER_ADMIN`, `STAFF`, `CUSTOMER` (only filters to self).
*   **Query Parameters**:
    *   `limit`: Number.
    *   `cursor`: UUID.
    *   `status`: `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `PROCESSING`, `DISPATCHED`, `DELIVERED`, `CANCELLED`.
    *   `customerId`: UUID.
*   **Response Body (200 OK)**: Standardized paginated structure containing base order status, totals, and creation dates.

---

## 6. Dispatch APIs

### 6.1 POST `/dispatches`
*   **Purpose**: Create a dispatch record (packing slip) for picking/shipping order items.
*   **Permissions**: `SUPER_ADMIN`, `STAFF`.
*   **Request Body**:
```json
{
  "orderId": "7d7c7b7a-9900-1111-2222-333344445555",
  "transportName": "VRL Logistics",
  "lrNumber": "LR-2299118",
  "notes": "Store in dry cartons. Call customer before delivery.",
  "items": [
    {
      "orderItemId": "item-uuid-1111",
      "quantityToDispatch": 100
    }
  ]
}
```
*   **Response Body (201 Created)**:
```json
{
  "id": "dispatch-uuid-9999",
  "dispatchNumber": "DISP-10024-1",
  "orderId": "7d7c7b7a-9900-1111-2222-333344445555",
  "status": "SHIPPED",
  "transportName": "VRL Logistics",
  "lrNumber": "LR-2299118",
  "notes": "Store in dry cartons. Call customer before delivery.",
  "items": [
    {
      "orderItemId": "item-uuid-1111",
      "quantityToDispatch": 100
    }
  ]
}
```
*   *Note: Creating a dispatch shifts the Order status to `PROCESSING` or `DISPATCHED` depending on if items are fully shipped.*

### 6.2 PATCH `/dispatches/:id`
*   **Purpose**: Update transport credentials (e.g. correct a typo in the LR tracking number).
*   **Permissions**: `SUPER_ADMIN`, `STAFF`.
*   **Request Body**:
```json
{
  "lrNumber": "LR-2299119"
}
```
*   **Response Body (200 OK)**: Returns updated dispatch details.

### 6.3 POST `/dispatches/:id/deliver`
*   **Purpose**: Mark dispatch as delivered. Updates physical warehouse inventory, runs ledger balances, and triggers invoice templates.
*   **Permissions**: `SUPER_ADMIN`, `STAFF`.
*   **Request Body**:
```json
{
  "deliveredAt": "2026-06-25T16:55:00Z",
  "receiverName": "Mr. Mehta (Store Incharge)"
}
```
*   **Response Body (200 OK)**:
```json
{
  "dispatchId": "dispatch-uuid-9999",
  "status": "DELIVERED",
  "orderStatus": "DELIVERED",
  "invoiceCreated": true,
  "invoiceId": "invoice-uuid-777"
}
```
*   **Internal Transaction Workflow**:
    1.  Sets dispatch status to `DELIVERED`.
    2.  For each dispatch item, decrements `physical_stock` and `reserved_stock` in the `inventory` table by `quantityToDispatch` (completes the reservation cycle).
    3.  Creates an `INVOICE` record and a `DEBIT` entry in the `customer_ledger` table.
    4.  Increments the customer's `current_due_balance` by the total invoice amount.

---

## 7. Invoice APIs

### 7.1 POST `/invoices`
*   **Purpose**: Manually generate a tax invoice (if not auto-generated by the delivery check).
*   **Permissions**: `SUPER_ADMIN`, `STAFF`.
*   **Request Body**:
```json
{
  "orderId": "7d7c7b7a-9900-1111-2222-333344445555"
}
```
*   **Response Body (201 Created)**:
```json
{
  "id": "invoice-uuid-777",
  "invoiceNumber": "INV-10024",
  "orderId": "7d7c7b7a-9900-1111-2222-333344445555",
  "taxableValue": 15254.24,
  "gstValue": 2745.76,
  "totalAmount": 18000.00,
  "pdfStorageUrl": "https://s3.amazonaws.com/hardware-invoices/INV-10024.pdf",
  "createdAt": "2026-06-25T16:55:01Z"
}
```

### 7.2 GET `/invoices/:id/pdf`
*   **Purpose**: Get the pre-rendered PDF invoice. Returns HTTP 307 redirecting directly to the Amazon S3 secure presigned URL.
*   **Permissions**: Authenticated (Customer role isolated to own invoices).
*   **Response (307 Temporary Redirect)**:
    *   *Headers*: `Location: https://s3.amazonaws.com/hardware-invoices/INV-10024.pdf?Signature=...`

### 7.3 POST `/invoices/:id/share`
*   **Purpose**: Return a pre-formatted template string optimized for fast copy-pasting or direct integration sharing via WhatsApp.
*   **Permissions**: `SUPER_ADMIN`, `STAFF`.
*   **Response Body (200 OK)**:
```json
{
  "recipientPhone": "+919825012345",
  "messagePayload": "Dear Om Colour, your invoice INV-10024 for ₹18,000.00 is generated. View/Download statement here: https://s3.amazonaws.com/hardware-invoices/INV-10024.pdf"
}
```

---

## 8. Ledger APIs

### 8.1 GET `/customers/:id/ledger/summary`
*   **Purpose**: Fetch a B2B customer's real-time financial limits.
*   **Permissions**: `SUPER_ADMIN`, `STAFF` (assigned reps), `CUSTOMER` (own ledger).
*   **Response Body (200 OK)**:
```json
{
  "customerId": "e2c2b3a1-1234-4a2b-8a8b-123456789abc",
  "creditLimit": 600000.00,
  "currentDueBalance": 125000.00,
  "availableCredit": 475000.00,
  "overdueBalance": 0.00
}
```

### 8.2 GET `/customers/:id/ledger`
*   **Purpose**: Paginated list of ledger entry records (DEBIT/CREDIT transactions).
*   **Permissions**: `SUPER_ADMIN`, `STAFF` (assigned reps), `CUSTOMER` (own ledger).
*   **Query Parameters**:
    *   `limit`: Number, default `50`.
    *   `cursor`: UUID.
*   **Response Body (200 OK)**:
```json
{
  "data": [
    {
      "id": "ledger-entry-uuid-2",
      "entryDate": "2026-06-25T16:55:01Z",
      "entryType": "DEBIT",
      "amount": 18000.00,
      "referenceInvoiceId": "invoice-uuid-777",
      "referenceInvoiceNumber": "INV-10024",
      "description": "Invoice issued for Order ORD-10024",
      "runningBalance": 125000.00
    },
    {
      "id": "ledger-entry-uuid-1",
      "entryDate": "2026-06-20T11:00:00Z",
      "entryType": "CREDIT",
      "amount": 50000.00,
      "referenceInvoiceId": null,
      "referenceInvoiceNumber": null,
      "description": "Payment received via Bank Transfer Ref: TXN-998877",
      "runningBalance": 107000.00
    }
  ],
  "pagination": {
    "limit": 50,
    "nextCursor": "ledger-entry-uuid-1",
    "hasMore": false
  }
}
```

### 8.3 GET `/ledger/outstanding`
*   **Purpose**: Aggregated dashboard overview of outstanding accounts receivable.
*   **Permissions**: `SUPER_ADMIN`, `STAFF`.
*   **Query Parameters**:
    *   `agingDays`: Number (e.g. `30`, filters to customers with dues older than 30 days).
*   **Response Body (200 OK)**:
```json
{
  "totalOutstandingReceivables": 4520000.00,
  "agingTiers": {
    "current_0_30": 3000000.00,
    "overdue_31_60": 1020000.00,
    "overdue_61_90": 350000.00,
    "delinquent_90_plus": 150000.00
  },
  "customers": [
    {
      "customerId": "e2c2b3a1-1234-4a2b-8a8b-123456789abc",
      "companyName": "Rajkot Fittings Group LLC",
      "totalDue": 125000.00,
      "oldestInvoiceDate": "2026-05-10T12:00:00Z"
    }
  ]
}
```

---

## 9. Notification APIs

### 9.1 GET `/notifications`
*   **Purpose**: Retrieve transactional alerts (such as backorder updates or approval flags).
*   **Permissions**: Authenticated (Any Role).
*   **Query Parameters**:
    *   `onlyUnread`: Boolean.
*   **Response Body (200 OK)**:
```json
{
  "notifications": [
    {
      "id": "notif-uuid-123",
      "title": "Stock Alert: Backorder Scheduled",
      "message": "Order ORD-10024 has 10 backordered items of SKU HDL-A-128-CP.",
      "isRead": false,
      "createdAt": "2026-06-25T16:00:00Z",
      "metadata": {
        "orderId": "7d7c7b7a-9900-1111-2222-333344445555"
      }
    }
  ]
}
```

### 9.2 PATCH `/notifications/:id/read`
*   **Purpose**: Toggle a single notification's read state.
*   **Permissions**: Authenticated (Scope limited to owner).

### 9.3 POST `/notifications/read-all`
*   **Purpose**: Mark all notification items for the authenticated user as read.
*   **Permissions**: Authenticated.

---

## 10. Sync APIs

*Used to support offline-first operations on the mobile app (sqlite cache). Sync uses timestamp delta matching.*

### 10.1 GET `/sync/pull`
*   **Purpose**: Pull all changes (created, updated, deleted records) modified since the device's last pull.
*   **Permissions**: `SUPER_ADMIN`, `STAFF`.
*   **Query Parameters**:
    *   `lastPulledAt`: Number (Unix millisecond timestamp).
*   **Response Body (200 OK)**:
```json
{
  "serverTime": 1782400000000,
  "changes": {
    "products": {
      "created": [],
      "updated": [
        {
          "id": "a1b2c3d4-1111-2222-3333-444455556666",
          "name": "Classic Brass Handle Model A - Revised",
          "updatedAt": "2026-06-25T15:00:00Z"
        }
      ],
      "deleted": ["d9c8b7a6-1111-2222-3333-444455556666"]
    },
    "productVariants": {
      "created": [],
      "updated": [],
      "deleted": []
    },
    "inventory": {
      "created": [],
      "updated": [
        {
          "variantId": "v1112223-3333-4444-5555-666677778888",
          "physicalStock": 135,
          "reservedStock": 10,
          "updatedAt": "2026-06-25T14:30:00Z"
        }
      ]
    }
  }
}
```

### 10.2 POST `/sync/push`
*   **Purpose**: Push offline-created mutations (such as orders queued while the sales representative was at a remote shop) up to the cloud.
*   **Permissions**: `SUPER_ADMIN`, `STAFF`.
*   **Request Body**:
```json
{
  "changes": {
    "orders": {
      "created": [
        {
          "id": "offline-uuid-9999",
          "offlineClientId": "offline-uuid-9999",
          "customerId": "e2c2b3a1-1234-4a2b-8a8b-123456789abc",
          "paymentTerms": "Credit",
          "createdAt": "2026-06-25T14:00:00Z",
          "items": [
            {
              "variantId": "v1112223-3333-4444-5555-666677778888",
              "quantity": 10,
              "unitPrice": 180.00
            }
          ]
        }
      ]
    }
  }
}
```
*   **Response Body (200 OK)**:
```json
{
  "success": {
    "orders": ["offline-uuid-9999"]
  },
  "errors": {
    "orders": []
  }
}
```

### 10.3 Offline Sync Architecture Detail
1.  **Push Sync & De-duplication**:
    *   To prevent double-insertion of orders on network reconnect retries, the server sets a unique database key constraint on the `offline_client_id` column.
    *   If the connection drops mid-request and the app resubmits the same push payload, the database returns a unique key violation. The API controller catches this error gracefully, loads the existing transaction with that `offline_client_id`, and returns a `200 OK` success block instead of failing.
2.  **Conflict Resolution**:
    *   **Catalog Conflicts (Products/Pricing)**: The server acts as the source of truth. The database uses `version` integers for optimistic locking (Section 3.6). If a mobile write has an outdated version, it fails with `409 Conflict`, prompting the mobile client to pull changes first.
    *   **Inventory / Credit Shortages**: If the rep registers an order offline that exceeds the customer's credit limit, the server creates the order in the database but transitions its state to `PENDING_APPROVAL` and fires a Push notification alert to both the representative and the administrator.

---

## 11. Role-Based Access Control (RBAC) Matrix

*Detailed permissions for every API endpoint specified. Cells mark whether a request with a valid role token is `Allowed` or `Denied`.*

| Endpoint Path | Method | Super Admin | Staff | Customer |
| :--- | :---: | :---: | :---: | :---: |
| `/auth/login` | POST | **Allowed** | **Allowed** | **Allowed** |
| `/auth/logout` | POST | **Allowed** | **Allowed** | **Allowed** |
| `/auth/refresh` | POST | **Allowed** | **Allowed** | **Allowed** |
| `/auth/forgot-password` | POST | **Allowed** | **Allowed** | **Allowed** |
| `/auth/reset-password` | POST | **Allowed** | **Allowed** | **Allowed** |
| `/customers` | POST | **Allowed** | Denied | Denied |
| `/customers/:id` | PATCH | **Allowed** | **Allowed** *(1)* | Denied |
| `/customers/:id` | GET | **Allowed** | **Allowed** *(2)* | **Allowed** *(3)* |
| `/customers` | GET | **Allowed** | **Allowed** | Denied |
| `/customers/profile` | GET | Denied | Denied | **Allowed** |
| `/categories` | GET | **Allowed** | **Allowed** | **Allowed** |
| `/products` | GET | **Allowed** | **Allowed** | **Allowed** |
| `/products` | POST | **Allowed** | Denied | Denied |
| `/products/:id` | PATCH | **Allowed** | Denied | Denied |
| `/products/:id/variants` | POST | **Allowed** | Denied | Denied |
| `/variants/:id` | PATCH | **Allowed** | Denied | Denied |
| `/products/:id/image-upload-url`| POST | **Allowed** | **Allowed** | Denied |
| `/inventory` | GET | **Allowed** | **Allowed** | Denied |
| `/inventory/adjust` | POST | **Allowed** | Denied | Denied |
| `/inventory/:id/history` | GET | **Allowed** | **Allowed** | Denied |
| `/orders` | POST | **Allowed** | **Allowed** | **Allowed** *(4)* |
| `/orders/:id` | PATCH | **Allowed** | **Allowed** *(2)* | Denied |
| `/orders/:id/approve` | POST | **Allowed** | Denied | Denied |
| `/orders/:id/cancel` | POST | **Allowed** | **Allowed** *(2)* | **Allowed** *(3)* |
| `/orders/:id` | GET | **Allowed** | **Allowed** *(2)* | **Allowed** *(3)* |
| `/orders` | GET | **Allowed** | **Allowed** | **Allowed** *(3)* |
| `/dispatches` | POST | **Allowed** | **Allowed** | Denied |
| `/dispatches/:id` | PATCH | **Allowed** | **Allowed** | Denied |
| `/dispatches/:id/deliver` | POST | **Allowed** | **Allowed** | Denied |
| `/invoices` | POST | **Allowed** | **Allowed** | Denied |
| `/invoices/:id/pdf` | GET | **Allowed** | **Allowed** | **Allowed** *(3)* |
| `/invoices/:id/share` | POST | **Allowed** | **Allowed** | Denied |
| `/customers/:id/ledger/summary` | GET | **Allowed** | **Allowed** *(2)* | **Allowed** *(3)* |
| `/customers/:id/ledger` | GET | **Allowed** | **Allowed** *(2)* | **Allowed** *(3)* |
| `/ledger/outstanding` | GET | **Allowed** | **Allowed** | Denied |
| `/notifications` | GET | **Allowed** | **Allowed** | **Allowed** |
| `/notifications/:id/read` | PATCH | **Allowed** | **Allowed** | **Allowed** |
| `/notifications/read-all` | POST | **Allowed** | **Allowed** | **Allowed** |
| `/sync/pull` | GET | **Allowed** | **Allowed** | Denied |
| `/sync/push` | POST | **Allowed** | **Allowed** | Denied |

*Notes on Exceptions:*
*   *(1)*: Staff can only edit basic customer contact fields, but are denied from modifying the customer `creditLimit`.
*   *(2)*: Staff are isolated to customers directly assigned to them.
*   *(3)*: Customers are isolated to their own records. Access to records of other customer accounts results in `403 Forbidden`.
*   *(4)*: Customers can place orders for themselves only. The request payload `customerId` must match their logged-in session ID.
