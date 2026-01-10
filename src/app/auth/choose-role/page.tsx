import ChooseRoleContent from './choose-role-content';

/**
 * Role Selection Entry Point
 * 
 * Serves as the primary authentication entry point allowing users to select
 * their role (Customer or Admin) before proceeding to the appropriate login page.
 * 
 * This page:
 * - Is publicly accessible
 * - Redirects authenticated users to their dashboard
 * - Provides clear role descriptions and icons
 * - Routes to `/login` for customers and `/admin/login` for admins
 */
export default function ChooseRolePage() {
  return <ChooseRoleContent />;
}
