import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { Bell, Home, Package2, ShoppingCart, Users, FileText, Mail, BarChart3 } from "lucide-react";
import { USER_ROLES } from "@/lib/auth-constants";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayoutClient from "./_components/admin-layout-client";

export default async function AdminLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
  const session = await getServerSession();
  if (!session || session.user?.role !== USER_ROLES.ADMIN) {
    redirect('/admin/login');
  }
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Package2 className="h-6 w-6" />
                <span className="">BZION HUB</span>
              </Link>
              <AdminLayoutClient />
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/products"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Products
                </Link>
                <Link
                  href="/admin/customers"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Users className="h-4 w-4" />
                  Customers
                </Link>
                
                <div className="my-2 border-t" />
                
                <Link
                  href="/admin/quotes"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <FileText className="h-4 w-4" />
                  Quotes
                </Link>
                <Link
                  href="/admin/newsletter"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Mail className="h-4 w-4" />
                  Newsletter
                </Link>
                <Link
                  href="/admin/forms"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Bell className="h-4 w-4" />
                  Forms
                </Link>
                <Link
                  href="/admin/analytics"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Link>
              </nav>
            </div>
            <div className="mt-auto p-4">
              <Card x-chunk="dashboard-02-chunk-0">
                <CardHeader className="p-2 pt-0 md:p-4">
                  <CardTitle>Upgrade to Pro</CardTitle>
                  <CardDescription>
                    Unlock all features and get unlimited access to our support
                    team.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                  <Link href="/pricing" className="w-full block">
                    <Button size="sm" className="w-full">
                      Upgrade
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
            {children}
        </div>
    </div>
    )
  }
