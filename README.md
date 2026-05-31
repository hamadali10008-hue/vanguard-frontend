# Vanguard SaaS Platform - Frontend Dashboard

This is the frontend dashboard for the Vanguard project management platform. It is built using Next.js, TypeScript, and Tailwind CSS. 

The application is designed to be multi-tenant, meaning it securely manages data, routing, and custom layouts for different clients using the same interface.

## Key Features
* **Multi-Tenant Routing:** Uses React Context to track the active workspace (`tenantId`) and user permissions across pages.
* **Dynamic Styling:** Automatically adjusts theme colors and branding based on the active tenant.
* **Custom API Interceptor:** Uses a custom Axios instance to automatically attach headers (`X-Tenant-Id`, `X-User-Role`, and `X-User-Name`) to every backend API request.
* **Clean UI:** Built with modular Tailwind components (modals, dropdown menus, and expanding task grids).

##  Tech Stack
* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **HTTP Client:** Axios

##  How to Run Locally

1. **Clone the project:**
   ```bash
   git clone [https://github.com/hamadali10008-hue/vanguard-frontend.git](https://github.com/hamadali10008-hue/vanguard-frontend.git)
   cd vanguard-frontend
