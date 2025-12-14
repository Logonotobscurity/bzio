# Verification Plan: Self-Service User Registration

This document outlines the steps to verify that the new user registration feature, including password strength feedback and backend validation, is working correctly.

### I. Frontend Verification (User Interface)

1.  **Navigate to the Registration Page:**
    *   Go to the `/login` page.
    *   Click the "Sign up" link.
    *   **Expected:** You are redirected to the `/register` page.

2.  **Test the Password Strength Meter:**
    *   Enter a password in the "Password" field.
    *   **Test Case 1 (Too weak):** Type `abc` -> **Expected:** The meter appears and shows a "Too weak" or "Weak" state.
    *   **Test Case 2 (Medium):** Type `abcABC1` -> **Expected:** The meter color and label change to "Medium".
    *   **Test Case 3 (Strong):** Type `abcABC123!` -> **Expected:** The meter color and label change to "Strong" or "Very Strong".

3.  **Test Form Validation (Client-Side):**
    *   **Test Case 1 (Mismatched Passwords):**
        *   Enter `ValidPass123` in "Password".
        *   Enter `DifferentPass456` in "Confirm Password".
        *   Click "Create Account".
        *   **Expected:** A toast notification appears with the error "Passwords do not match."
    *   **Test Case 2 (Incomplete Form):**
        *   Leave the "Full Name" or "Email" field blank.
        *   Click "Create Account".
        *   **Expected:** The browser's default HTML5 validation should prevent form submission and highlight the required fields.

### II. Backend Verification (API and Database)

1.  **Test Successful Registration:**
    *   Fill out the registration form with valid data (e.g., Name: `Test User`, Email: a unique email, Company: `Test Corp`, Password: `ValidPass123!`).
    *   Click "Create Account".
    *   **Expected:** You are redirected to the `/login` page and a "Registration Successful" toast appears.

2.  **Test Backend Validation Rules:**
    *   Use a tool like Postman or `curl` to send a direct request to the `/api/auth/register` endpoint.
    *   **Test Case 1 (Weak Password):** Send a request with the password `weak`.
        *   **Expected:** The API returns a `400 Bad Request` status with an error message indicating the password does not meet the requirements.
    *   **Test Case 2 (Duplicate Email):** Send a request using an email address that has already been registered.
        *   **Expected:** The API returns a `400 Bad Request` status with the error "Email already registered".

3.  **Verify Data in the Database:**
    *   After a successful registration, connect to your PostgreSQL database.
    *   Run the following SQL query: `SELECT "firstName", email, "companyName", "passwordHash" FROM users WHERE email = '[the email you registered with]';`
    *   **Expected:**
        *   A new record exists with the correct `firstName`, `email`, and `companyName`.
        *   The `passwordHash` field is populated with a long, hashed string, **not** the plain-text password.

By following these steps, you can be fully confident that the new registration feature is secure, functional, and correctly integrated into the application and database.
