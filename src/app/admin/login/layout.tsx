/**
 * Admin Login Layout
 * 
 * This layout overrides the parent admin layout to allow
 * unauthenticated access to the admin login page.
 */

interface AdminLoginLayoutProps {
  children: React.ReactNode;
}

export default function AdminLoginLayout({ children }: AdminLoginLayoutProps) {
  // Simple layout without authentication checks
  // The page component handles redirect if already logged in
  return <>{children}</>;
}
