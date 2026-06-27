# Mobile UI/UX & Screen Specification: B2B Inventory & Ordering App

This document defines the comprehensive mobile client screen specifications for the B2B Inventory & Ordering application. It aligns directly with the frozen **API Contract Specification** and the PostgreSQL **Database Schema Specification**, focusing on a mobile-first React Native + Expo implementation targeted at users aged 40–70 (e.g., factory owners, distributors, warehouse operators).

---

## 1. Global UI Simplicity Rules (Aged 40–70 Accessibility)

To ensure high usability for users who are comfortable with WhatsApp but struggle with dense enterprise applications:

*   **Large Touch Targets**: All buttons, inputs, list items, and interactive elements must have a minimum touch target size of **56dp × 56dp** to prevent motor-control errors.
*   **Typography Hierarchy ( outfit / Inter )**:
    *   *Primary Value Labels* (e.g., Price totals, stock count): **24sp (Bold)**.
    *   *Body/Item Titles*: **18sp (Semi-Bold)**.
    *   *Secondary/Helper Labels*: **14sp (Regular)**. *Never use font sizes below 14sp.*
*   **High-Contrast Color Palette**:
    *   Primary Background: Solid White (`#FFFFFF`) or Off-White (`#F9F9FA`).
    *   Primary Text: Dark Slate (`#1A1C1E`) for a minimum **7:1 contrast ratio**.
    *   Accents: High-visibility Green (`#1E88E5` or `#2E7D32` for success/paid states) and High-contrast Red (`#C62828` for stockouts/overdue balances).
*   **The 3-Tap Rule**: Any common task (e.g., placing an order, checking customer due balance, dispatching packages) must be reachable and executable in **3 taps or fewer** from the respective home dashboard.
*   **Minimal Typing Input**: Use numeric-only keypads for quantities, toggle elements (plus/minus counters) for matrix quantities, and voice-to-text microphones inside search boxes.
*   **WhatsApp-Style Integrations**: Prominent green action buttons (`#25D366`) to instantly forward invoice PDFs, billing summaries, or ledger aging balances with pre-filled text payloads to customers.

---

## 2. Shared & Navigation Structures

### 2.1 Customer Role Navigation
*   **Bottom Tab Navigation** (3 Flat Tabs):
    1.  `Home` (Catalog list, quick reorder cards).
    2.  `Orders` (Order history lists and delivery progress).
    3.  `Ledger` (Credit limits, dues statement, download invoice option).
*   **Header / Profile Menu**: A top-right Avatar icon opens a single full-screen `Profile` and `Settings` view (containing profile details, logout, language toggle, and manual sync option).
*   **Hidden Menus**: None. All features are fully exposed on tabs or headers to reduce navigation confusion.

### 2.2 Staff Role Navigation
*   **Bottom Tab Navigation** (3 Flat Tabs):
    1.  `Dashboard` (Metrics, Assigned Customers search, Scan QR FAB).
    2.  `Orders` (Approval queues, order creation, active dispatches).
    3.  `Inventory` (Stock search, ATP quantities, item catalog).
*   **Floating Action Button (FAB)**: A large green QR code/Barcode Scanner icon (`56dp` diameter) floating on the `Dashboard` tab to instantly look up items or dispatches.
*   **Profile/Settings**: Located in the top header.

### 2.3 Super Admin Role Navigation
*   **Bottom Tab Navigation** (4 Flat Tabs):
    1.  `Dashboard` (Sales metrics, overdue alerts, pending approvals).
    2.  `Catalog` (Products, categories management, pricing sheets).
    3.  `Inventory` (Adjustment forms, low-stock warnings, history audit).
    4.  `Customers` (Distributor accounts, staff mappings, outstanding ledger list).
*   **Header Settings**: Top-right Gear icon opens full system parameters, staff management, and system reports.

---

## 3. Reusable Components

All screens utilize this set of standardized components to ensure visual consistency:

### 3.1 Product Card (`B2BProductCard`)
*   **Visual Layout**: Horizontal row with a `100dp × 100dp` cached product image, title text (18sp), and category badge.
*   **Interaction**: Tapping the card opens the `Product Details` screen.
*   **Grid Matrix Trigger**: If the user is on the ordering flow, tapping the card expands a dropdown grid showing dimensions (Sizes) along the vertical axis and Finishes along the horizontal axis, with large `+` and `-` buttons for quantity selections.

### 3.2 Order Card (`B2BOrderCard`)
*   **Visual Layout**: Card layout with a thick border indicating status.
    *   `ORD-XXXXX` identifier (18sp, Bold).
    *   Timestamp and total value.
    *   Customer/Company name.
*   **Status Indicators**: Status text colored by state:
    *   `PENDING_APPROVAL`: Amber (`#F57C00`).
    *   `APPROVED`/`DELIVERED`: Green (`#2E7D32`).
    *   `CANCELLED`: Dark Red (`#C62828`).

### 3.3 Customer Card (`B2BCustomerCard`)
*   **Visual Layout**: Large white card with prominent billing/current outstanding dues.
    *   Company name (18sp, Bold) and city name.
    *   "Dues: ₹XX,XXX" (Red text, 24sp Bold) if positive; "Dues: ₹0" (Green text) if clean.
    *   Available Credit progress bar.
*   **Actions**: Standard button to call assigned sales rep, and a green WhatsApp button to share ledger details.

### 3.4 Ledger Entry Card (`B2BLedgerCard`)
*   **Visual Layout**: Horizontal row mapping debits and credits.
    *   Date (14sp) and reference number (`INV-XXXX` or `PAY-XXXX`).
    *   Entry type label (`DEBIT` in red, `CREDIT` in green).
    *   Right side shows the transaction amount and the running due balance.

### 3.5 Status Badge (`B2BStatusBadge`)
*   **Styling**: High-contrast, rounded tag with padding `8dp` vertical, `12dp` horizontal.
*   **Sizing**: Minimum height `36dp` with text size `14sp` (Bold).

### 3.6 Standard Empty State (`B2BEmptyState`)
*   **Visual Layout**: Centered illustration icon (e.g., empty cart, grayed out inventory box), large headline text (18sp Semi-Bold), helper caption (14sp), and a primary action button (minimum height `56dp`).

---

## 4. Customer Role Screens

### 4.1 Login Screen (`CustomerLogin`)
*   **Purpose**: Log into the application using email and password, triggering JWT and device-ID logging.
*   **UI Components**:
    *   App Logo placeholder.
    *   Email Input: Textbox with helper validation text. Touch target height: `56dp`.
    *   Password Input: Textbox with eye-toggle visibility. Touch target height: `56dp`.
    *   Forgot Password link.
    *   "Log In" Button: Solid dark slate background, white text (18sp, Bold). Height: `56dp`.
*   **API Calls**: `POST /auth/login`
*   **User Actions**:
    *   Tapping "Log In": Validates format, requests credentials, writes tokens locally to secure storage, routes to `CustomerHome`.
    *   Tapping "Forgot Password": Routes to `ForgotPasswordScreen`.
*   **Error States**:
    *   `400 Bad Request`: Input field turns red with text "Enter a valid email address".
    *   `401 Unauthorized`: Top banner alert displaying "Invalid email or password. Please try again."

### 4.2 Home / Catalog Dashboard Screen (`CustomerHome`)
*   **Purpose**: Browse products, check stock visibility, and view active order summaries.
*   **UI Components**:
    *   Welcome banner with Company Name (e.g., "Welcome, Om Colour").
    *   Outstanding Balance bar (Green/Red text, links to Ledger tab).
    *   "Start New Order" FAB (`56dp` height).
    *   Product Categories scroll list (horizontal pills).
    *   Fuzzy Search bar with microphone voice icon.
    *   "Recent Reorder" section listing the last 3 orders with an "Order Again" button.
*   **API Calls**:
    *   `GET /categories` (Loads category scroll list)
    *   `GET /products` (Loads default product catalog)
    *   `GET /orders?limit=3` (Fetches last 3 orders for the reorder section)
*   **User Actions**:
    *   Tapping voice icon: Starts native voice-to-text dictation, populating the search bar.
    *   Tapping "Order Again": Deep links to `CreateOrder` with items pre-filled from that reference order.
    *   Tapping Category pill: Filters product list below.
*   **Empty States**:
    *   If no products match filter: Display `B2BEmptyState` containing text "No products found in this category" and a button "Clear Filters".
*   **Error States**:
    *   If offline, shows top persistent yellow banner: "Offline Mode. Displaying cached products."

### 4.3 Product Details Screen (`CustomerProductDetails`)
*   **Purpose**: Full description, image view, pricing sheet, and variant grid picker.
*   **UI Components**:
    *   Large product image (support pinch-to-zoom).
    *   Product Name (24sp Bold) and Description text.
    *   **Matrix Grid Selector**:
        *   Vertical column list showing available Sizes (e.g., "128mm", "192mm").
        *   Horizontal row displaying Finishes (e.g., "Black Matt", "Chrome Plated").
        *   Cells contain `[Qty Counter]` (number with large `+` and `-` keys) and ATP stock badges.
    *   "Add to Cart" sticky footer button displaying current item count (e.g., "Add 50 items to Cart | ₹9,000").
*   **API Calls**: `GET /products/:id` (Loads detailed SKU variations).
*   **User Actions**:
    *   Tapping `+` / `-` keys: Increments/decrements quantity in increments of the variant's `boxPackQty` (prevents broken pack orders).
    *   Tapping "Add to Cart": Saves selection to WatermelonDB/SQLite, triggers toast notification "Cart updated".
*   **Error States**:
    *   If a cell variant's ATP stock is 0, displays a small yellow badge: "Backorder Allowed (Refills in 7 days)".

### 4.4 Cart Screen (`CustomerCart`)
*   **Purpose**: Review selected items, adjust quantities, verify credit compatibility, and checkout.
*   **UI Components**:
    *   List of cart items showing: Product image, SKU Name, size/finish, box pack qty, unit price, item subtotal.
    *   Clear All Button.
    *   Order Total summary box: Taxable Value, GST (18%), Gross Total.
    *   Credit Limit indicator bar: Shows if order total fits within remaining credit limit.
    *   "Submit Order" sticky footer button.
*   **API Calls**: None (Runs computations locally against SQLite catalog data).
*   **User Actions**:
    *   Adjusting item counter: Recalculates total values dynamically on the screen.
    *   Tapping "Submit Order": Routes to `CreateOrderConfirmation`.
*   **Empty States**:
    *   If cart is empty: Displays `B2BEmptyState` with text "Your cart is empty" and a button "Start Browsing Catalog" linked back to the home tab.

### 4.5 Create Order Screen (`CreateOrderConfirmation`)
*   **Purpose**: Final check of delivery address, payment terms, and offline client keys before committing the order.
*   **UI Components**:
    *   Customer shipping/billing addresses (read-only).
    *   Payment Terms dropdown (default: "Credit").
    *   Over-Limit Warning Box: Appears in amber if the order total exceeds the customer's credit limit. Text: "Warning: Order exceeds your credit limit. Approval by Suresh Patel (Super Admin) will be required."
    *   "Confirm & Book Order" Button.
*   **API Calls**: `POST /orders`
*   **User Actions**:
    *   Tapping "Confirm & Book Order":
        *   Generates a local `offlineClientId` UUID.
        *   Attempts API post. On success, clears cart, routes to `OrderSuccessScreen`.
        *   If offline, writes order to SQLite queue with `pending_sync: true` and redirects to `OrderSuccessScreen` with offline notice.
*   **Error States**:
    *   `422 Unprocessable Entity` (Stock Shortage): Opens modal displaying: "Stock shortage for [SKU]. Allocate [AvailableQty] now and backorder the remaining [BackorderQty]?" with buttons "Proceed" or "Cancel".

### 4.6 Order History Screen (`CustomerOrderHistory`)
*   **Purpose**: Paginated list of all customer-placed orders.
*   **UI Components**:
    *   Search by Order Number (`ORD-XXXX`).
    *   Status filter tabs (All, Pending, Approved, Completed).
    *   Vertical list of `B2BOrderCard` components.
*   **API Calls**: `GET /orders` (filtered to current user token).
*   **Empty States**:
    *   If no orders placed yet: Display `B2BEmptyState` stating "No orders found" with button "Place Your First Order".

### 4.7 Order Details Screen (`CustomerOrderDetails`)
*   **Purpose**: Detailed tracking, allocated/backorder lists, and links to invoices.
*   **UI Components**:
    *   Header showing Order Number, Date, Status Badge, and Total Amount.
    *   Status Progress Tracker (Visual flow steps: Draft $\rightarrow$ Approved $\rightarrow$ Dispatched $\rightarrow$ Delivered).
    *   List of items: Name, size/finish, Quantity ordered, Qty Allocated, Qty Backordered.
    *   "Linked Invoices" button list.
*   **API Calls**: `GET /orders/:id`
*   **Error States**:
    *   `404 Not Found`: "This order details could not be loaded."

### 4.8 Invoice List Screen (`CustomerInvoiceList`)
*   **Purpose**: Retrieve and download generated tax invoices.
*   **UI Components**:
    *   List of invoices showing: INV number, Order Ref, Date, and Gross Amount.
    *   "Download PDF" icon button on each row.
*   **API Calls**: `GET /orders/:id` (contains linked invoices) or custom route from ledger.

### 4.9 Invoice Details Screen (`CustomerInvoiceDetails`)
*   **Purpose**: View taxable amounts, GST breakdowns, and download/share actions.
*   **UI Components**:
    *   Invoice header summary.
    *   Taxable value vs. GST value table.
    *   "Download PDF" button (Height: `56dp`, blue background).
    *   "Share via WhatsApp" button (Height: `56dp`, green background).
*   **API Calls**:
    *   `GET /invoices/:id/pdf` (triggers redirect download).
    *   `POST /invoices/:id/share` (retrieves pre-filled WhatsApp text).

### 4.10 Ledger Screen (`CustomerLedgerView`)
*   **Purpose**: Display overall outstanding dues, credit balance details, and transaction histories.
*   **UI Components**:
    *   **Financial Summary Header**:
        *   Outstanding Balance (24sp Bold Red text if due).
        *   Remaining Credit Limit (18sp text).
    *   Chronological list of `B2BLedgerCard` components.
*   **API Calls**:
    *   `GET /customers/:id/ledger/summary`
    *   `GET /customers/:id/ledger`
*   **User Actions**:
    *   Tapping "Share Ledger" FAB: Triggers native share drawer with formatted WhatsApp ledger balance sheet.
*   **Empty States**:
    *   If no ledger entries exist: Display "No financial transactions logged yet."

### 4.11 Profile Screen (`CustomerProfileScreen`)
*   **Purpose**: View user details, register device status, and trigger manual synchronization.
*   **UI Components**:
    *   User name, email, phone number, company name.
    *   Registered device ID indicator.
    *   "Sync Now" Button: Syncs local SQLite database with the cloud server.
    *   "Log Out" Button: Clear secure storage tokens, redirect to Login.
*   **API Calls**:
    *   `GET /customers/profile`
    *   `POST /auth/logout`

---

## 5. Staff Role Screens

### 5.1 Dashboard Screen (`StaffDashboard`)
*   **Purpose**: Primary landing screen for sales reps. Offers quick search, scanner triggers, and collection summary.
*   **UI Components**:
    *   Welcome card: "Welcome back, Anil Patel".
    *   "Assigned Customer Search": Large textbox, searches by name/city.
    *   Floating Action Button (FAB): Large barcode/QR code scan trigger.
    *   "Pending Dues Collection" widget: Shows total outstanding receivables for their assigned accounts.
    *   "Unread Notifications" card.
*   **API Calls**:
    *   `GET /customers` (fuzzy search query trigger)
    *   `GET /ledger/outstanding` (reps scoped view)
*   **User Actions**:
    *   Tapping FAB: Launches device camera overlays to scan a printed order invoice QR code, navigating to `StaffDispatch` or `StaffOrderDetails`.

### 5.2 Customer List Screen (`StaffCustomerList`)
*   **Purpose**: View and select assigned dealers.
*   **UI Components**:
    *   Search bar.
    *   Filter tabs (All, Overdue Balance).
    *   Scroll list of `B2BCustomerCard` items.
*   **API Calls**: `GET /customers?assignedStaffId=currentUserId`
*   **User Actions**:
    *   Tapping a customer card: Opens `StaffCustomerDetails`.

### 5.3 Customer Details Screen (`StaffCustomerDetails`)
*   **Purpose**: 360-degree view of distributor accounts. Allows placing orders for them, logging collections, or checking ledgers.
*   **UI Components**:
    *   Dealer header: "Om Colour (Rajkot)".
    *   Remaining credit progress bar.
    *   **Action Row** (Large buttons, minimum `56dp × 56dp` layout):
        *   "Book Order": Launches `CreateOrderConfirmation` pre-filled for this customer.
        *   "View Ledger": Routes to `CustomerLedgerView` scoped for this customer ID.
        *   "Call Customer": Launches device telephone dialer.
    *   Recent Orders list.
*   **API Calls**: `GET /customers/:id`
*   **User Actions**:
    *   Tapping "Book Order": Pre-fills the cart with customer context, routes to the product catalog view.

### 5.4 Orders Listing Screen (`StaffOrdersList`)
*   **Purpose**: Monitor active orders, approval statuses, and dispatches.
*   **UI Components**:
    *   Status filter tabs (All, Pending Approval, Active, Shipped).
    *   Vertical listing of orders.
*   **API Calls**: `GET /orders`

### 5.5 Order Approval Screen (`StaffOrderApproval`)
*   **Purpose**: Review details of orders held back due to credit limits or stock shortages.
*   *Note: Super Admin permissions required to override/approve, Staff can view and request edits.*
*   **UI Components**:
    *   Order items list showing requested vs. allocated stock.
    *   Customer credit limits alert widget.
    *   "Approve Order (Super Admin only)" button.
    *   "Cancel/Reject Order" button (red).
*   **API Calls**:
    *   `POST /orders/:id/approve`
    *   `POST /orders/:id/cancel`

### 5.6 Dispatch Screen (`StaffDispatchForm`)
*   **Purpose**: Create packing slips, transport logs, and LR number entries for dispatches.
*   **UI Components**:
    *   Order Reference card (showing customer name and shipping address).
    *   List of items with input fields for `Quantity to Ship` (numeric input only).
    *   Transport Name input textbox (e.g., "VRL Logistics").
    *   LR / Tracking Number input textbox.
    *   Delivery Notes text box.
    *   "Ship Dispatch" Button.
*   **API Calls**: `POST /dispatches`
*   **User Actions**:
    *   Tapping "Ship Dispatch": Submits transport details, creates packing slip, sets order to `PROCESSING` or `DISPATCHED`.

### 5.7 Inventory View Screen (`StaffInventoryView`)
*   **Purpose**: Check real-time stock levels of hardware fittings.
*   **UI Components**:
    *   Search catalog bar.
    *   Filters: Category, low stock alert flag.
    *   List view showing variants, SKU name, size/finish, and ATP stock (green text for active, red for out of stock).
*   **API Calls**: `GET /inventory`

---

## 6. Super Admin (Owner) Screens

### 6.1 Dashboard Screen (`AdminDashboard`)
*   **Purpose**: At-a-glance visibility of revenue, pending approvals, and ledger dues.
*   **UI Components**:
    *   **KPI Grid (Large numeric values)**:
        *   Today's Sales (₹X,XX,XXX)
        *   Dues Outstanding (₹X,XX,XXX, colored red)
        *   Pending Approvals (count badge, e.g., "12 Pending")
    *   "Pending Approvals Queue": Shows orders awaiting credit overrides.
    *   "Recent Notifications" feed.
*   **API Calls**:
    *   `GET /ledger/outstanding` (Calculates dashboard aggregates)
    *   `GET /orders?status=PENDING_APPROVAL` (Loads approval lists)

### 6.2 Products Catalog Management (`AdminProducts`)
*   **Purpose**: CRUD operations for catalogs and SKU variants.
*   **UI Components**:
    *   "Add Base Product" Button.
    *   Category filters.
    *   Product listing row with edit icon.
*   **API Calls**:
    *   `POST /products`
    *   `PATCH /products/:id`

### 6.3 Categories Screen (`AdminCategories`)
*   **Purpose**: Manage product categories.
*   **UI Components**:
    *   Add Category modal inputs.
    *   Category list with active SKU count tags.
*   **API Calls**: `GET /categories`

### 6.4 Inventory Management Screen (`AdminInventoryPanel`)
*   **Purpose**: View inventory levels and perform manual stock adjustments.
*   **UI Components**:
    *   Inventory lookup list.
    *   **Manual Adjustment Form Overlay**:
        *   Variant selector.
        *   Adjustment Quantity counter (supports negative values for damage write-offs).
        *   Reason dropdown (e.g., "Physical Audit Difference", "Damaged goods").
        *   "Commit Adjustment" Button.
*   **API Calls**:
    *   `GET /inventory`
    *   `POST /inventory/adjust`

### 6.5 Orders Screen (`AdminOrdersPanel`)
*   **Purpose**: Complete lookup of all client transactions. Allows manual overrides or cancellations.
*   **UI Components**:
    *   Fuzzy Search (by order ID or client company name).
    *   Status filter dropdowns.
    *   List of orders.
*   **API Calls**: `GET /orders`

### 6.6 Customers Screen (`AdminCustomers`)
*   **Purpose**: Manage dealer accounts, adjust credit parameters, and map sales staff.
*   **UI Components**:
    *   "Add New Customer" Button.
    *   Distributor search input.
    *   Edit form fields: Company Name, Credit Limit input (numeric only), assigned staff dropdown.
*   **API Calls**:
    *   `POST /customers`
    *   `PATCH /customers/:id`

### 6.7 Staff Management Screen (`AdminStaffPanel`)
*   **Purpose**: Invite and manage sales rep user accounts.
*   **UI Components**:
    *   "Create Staff User" Button.
    *   List of staff showing: Name, email, role tag (`STAFF`), status toggle (Active/Inactive).
*   **API Calls**: Custom user signup endpoints matching general auth framework.

### 6.8 Reports Screen (`AdminReports`)
*   **Purpose**: Financial statements and sales analytics downloads.
*   **UI Components**:
    *   Date Range picker.
    *   "Outstanding Receivables Aging Report" button.
    *   "Top Selling SKU Report" button.
    *   "Export CSV/PDF" button actions.
*   **API Calls**: Custom query endpoints mapped to `/ledger/outstanding`.

### 6.9 Settings Screen (`AdminSettings`)
*   **Purpose**: Configure system thresholds.
*   **UI Components**:
    *   Standard Tax rate configurations (GST % default).
    *   Low stock threshold counters (default item numbers).
    *   Save button.

---

## 7. Offline Mode Visual UX Specification

*The mobile application runs on an offline-first architecture powered by SQLCipher / SQLite. The UI must adapt to network state changes without breaking.*

```
┌────────────────────────────────────────────────────────┐
│ [!] No Internet. Displaying cached data. (Sync counter: 4) │ (Top banner: #F57C00)
├────────────────────────────────────────────────────────┤
│                       PRODUCTS                         │
│                                                        │
│   HDL-A-128-BLK                 [ Available: 140 ]     │
│   Classic Brass Handle          Price: ₹180.00         │
│   ┌────────────────────────────────────────────────┐   │
│   │ [!] Offline Booking will queue order.          │   │ (Yellow box)
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

1.  **Persistent Status Banner**:
    *   When the network state changes to offline, a solid Amber Banner (`#F57C00`) slides down from the top header containing text: **"No Internet Connection. Work is saved offline."**
    *   The banner shows a count of pending sync mutations: **"4 changes waiting to upload."**
2.  **Visual Cues on Lists & Actions**:
    *   Product catalog prices or stock values show a small gray clock icon indicating: "Data cached from [Timestamp]".
    *   Buttons like "Confirm Order" remain active but display a helper tooltip below: "Order will queue offline and submit once internet returns."
3.  **Local Queue Indicator**:
    *   A small sync progress pill is displayed next to the header profile menu.
    *   On reconnecting, the pill turns into a rotating loop icon: "Syncing..." and changes to a solid checkmark when completed.

---

## 8. Notification Flows

All transactional alerts are mapped to user roles, supporting deep linking to relevant screens upon click:

### 8.1 Approval Required Alert
*   **Trigger**: A sales rep places an order that exceeds the customer's credit limit.
*   **Recipient**: `SUPER_ADMIN` (Owner).
*   **Push Notification Text**: `"Order ORD-10024 for Om Colour (₹2,45,000) exceeds credit limit. Approval required."`
*   **Deep Link**: Clicking notification opens `StaffOrderApproval` screen loaded with `ORD-10024` context.

### 8.2 Backorder Registered Alert
*   **Trigger**: An order is approved with items allocated to backorder.
*   **Recipient**: `STAFF` (Assigned Rep) & `CUSTOMER`.
*   **Push Notification Text**: `"Order ORD-10024 has 20 items of SKU HDL-A-128-BLK on backorder."`
*   **Deep Link**: Opens `CustomerOrderDetails` screen.

### 8.3 Payment Received confirmation
*   **Trigger**: Owner logs payment collection check entry.
*   **Recipient**: `CUSTOMER`.
*   **Push Notification Text**: `"Payment of ₹50,000 credited to ledger. Balance due: ₹1,25,000."`
*   **Deep Link**: Opens `CustomerLedgerView` screen.
