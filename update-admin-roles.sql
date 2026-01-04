-- Update user roles for admin users
UPDATE "users" 
SET role = 'ADMIN' 
WHERE email IN ( 'bola@bzion.shop');

-- Verify the update
SELECT id, email, role FROM "users" WHERE email IN ('bola@bzion.shop');
