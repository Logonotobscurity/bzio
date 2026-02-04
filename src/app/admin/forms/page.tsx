import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { USER_ROLES } from "@/lib/auth-constants";

export default async function FormsPage() {
  const session = await getServerSession();
  if (!session || session.user?.role !== USER_ROLES.ADMIN) {
    redirect('/admin/login');
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Forms Management</h2>
          <p className="text-muted-foreground">
            View and manage form submissions
          </p>
        </div>
      </div>
      
      <div className="grid gap-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Form Submissions</h3>
          <p className="text-muted-foreground">Form management functionality coming soon</p>
        </div>
      </div>
    </div>
  );
}
