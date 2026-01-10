# BZION Hub - System Summary

This document outlines the user-facing features and key functionalities of the BZION Hub platform.

## 1. What Problem Does BZION Hub Solve?

BZION Hub is a B2B marketplace designed to streamline the procurement process for businesses in the Fast-Moving Consumer Goods (FMCG) industry. It connects wholesale buyers with a wide range of suppliers, offering a digital platform for browsing products, managing orders, and requesting quotes.

The system addresses inefficiencies in a traditionally offline industry by providing:
*   A centralized, searchable product catalog.
*   Tools for direct price negotiation and bulk ordering.
*   Traceability and transparency in the supply chain.

## 2. Key User-Facing Features

*   **Product Discovery:**
    *   Browse products by category and brand.
    *   Full-text search functionality.
    *   View detailed product pages with descriptions and specifications.
*   **Request for Quote (RFQ):**
    *   Add multiple products to a quote list.
    *   Submit a formal quote request to suppliers through a dedicated form.
    *   Receive email and WhatsApp notifications upon submission.
*   **Company & Brand Pages:**
    *   Dedicated pages showcasing information about specific companies and brands.
*   **User Accounts:**
    *   Users can create accounts to manage their orders and profile (inferred from schema).
*   **Informational Pages:**
    *   About, Contact, FAQ, Careers, and Compliance pages provide essential company information.
*   **Real-time Interaction:**
    *   A chat widget (`ClientChatWidget.tsx`) allows for real-time customer support.

## 3. Key Commands and Endpoints

While end-users interact with the web interface, developers and administrators use the following key entry points.

### 3.1. Main API Endpoints

These are the primary endpoints driving the application's functionality.

*   `POST /api/v1/rfq/submit`: The core endpoint for submitting a "Request for Quote."
*   `GET /api/products`: Retrieves a list of all products.
*   `GET /api/products/[slug]`: Retrieves a single product by its unique slug.
*   `GET /api/categories`: Retrieves all product categories.
*   `GET /api/brands`: Retrieves all brands.
*   `POST /api/newsletter-subscribe`: Adds a user to the mailing list.

### 3.2. CLI Commands for Developers

*   `npm run dev`: Run the app in development mode.
*   `npm run build`: Compile and build the app for production.
*   `npm run seed`: Populate the development database with initial data from `prisma/seed.ts`.
*   `npm test`: Execute the automated test suite.

