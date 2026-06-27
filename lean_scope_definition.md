# Lean Product Scope Definition: Hardware Fittings App

This document outlines the simplified, lightweight scope for the B2B Ordering & Stock Visibility application. Acting as a startup CTO, we eliminate all complex enterprise/manufacturing ERP modules to focus on low-cost, low-maintenance, and easy-to-use workflows.

---

## 1. RECOMMENDED V1 SCOPE

The V1 product must focus exclusively on facilitating B2B sales transactions:
*   **Simple B2B Product Catalog**: Displaying finished goods, images, and current available stock count.
*   **Product Size Matrix**: Standard grid for entering quantities across multiple dimensions.
*   **Digital Order Placement**: For field sales staff booking orders on-site or dealers placing them directly.
*   **Simple Inbound/Outbound Stock Adjustments**: Quick entry forms to add or subtract stock.
*   **Tax Invoice PDFs**: Generation of basic tax invoices sent automatically via email or WhatsApp.
*   **Outstanding Customer Ledger**: Clean list of customer debits, credits, and overall due balances.

---

## 2. REMOVED & FUTURE FEATURES

### Removed Features (NOT in V1)
*   **Bill of Materials (BOM) & Recipe Management**: Scrap tracking, alloy compositions, and material relationships are cut.
*   **Work Order & Shop-Floor Routing**: Stage-gate tracking for casting, machining, and plating is cut.
*   **WMS Bin Locations & Picking Routes**: Physical mapping (Zone/Aisle/Bin) is replaced with a simple descriptive warehouse name.
*   **Automated Gov Integrations**: Native E-invoice/E-way bill APIs are cut; invoicing will use standard template parameters.

### Future Deferred Features (Deferred to V2/V3)
*   **Payment Gateway Integration**: Direct payments inside the ledger screen.
*   **Automated Shipping Aggregators**: Live tracking with shipping courier APIs.
*   **Demand Forecasting Dashboard**: AI algorithms predicting seasonal trends.

---

## 3. FINAL MODULE LIST & COMPLEXITY SCORE

Each module is evaluated to minimize development complexity:

*   **Product Catalog & Stock (Essential)**: CRUD operations for products, categories, and stock numbers. High business value.
*   **B2B Matrix Ordering Grid (Essential)**: Grid input for different sizes. Reduces tap counts.
*   **Offline Order Queueing (Useful)**: Sales staff can queue orders offline, which auto-sync when online.
*   **Customer Outstanding Ledger (Essential)**: Simple ledger logging debits/credits. Keeps billing clear.
*   **Automatic PDF Invoices (Essential)**: Automatically creates and attaches invoices.
*   **Staff Stock Adjustments (Useful)**: Simplified screen to increment/decrement inventory count manually.
*   **Automated Courier Integrations (Overkill for V1)**: Manual text entry of tracking ID is sufficient.

---

## 4. FINAL USER ROLES (V1 MVP)

1.  **Super Admin (Factory Owner / Owner)**
    *   *Permissions*: Manage products, edit pricing sheets, adjust inventory levels, view sales reports, and create customers.
2.  **Staff (Sales Reps / Warehouse Dispatchers)**
    *   *Permissions*: View stock levels, book orders for assigned customers, record payment collections, and view ledger status.
3.  **Customer (Dealers / Buyers)**
    *   *Permissions*: Self-service product catalog browsing, placing orders, checking their order status, and downloading invoice PDFs.
