"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  DashboardSidebar,
  DashboardNavItem,
} from "@/components/Sidebar";
import { DashboardNavbar } from "@/components/Navbar";

const primaryNav: DashboardNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Purchase History", href: "/purchase-history", icon: ClipboardList },
];

const secondaryNav: DashboardNavItem[] = [
  { label: "Profile", href: "/profile", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { clinician, accessToken, clearAuth, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && (!accessToken || !clinician)) {
      router.push("/signup");
    }
  }, [accessToken, clinician, _hasHydrated, router]);

  const handleLogout = () => {
    clearAuth();
    router.push("/signup");
  };

  const initials =
    clinician?.clinicianName
      ?.split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("") || "S";

  const firstName = clinician?.ownerName?.split(" ")[0] || "Owner";

  if (!_hasHydrated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F0F8] text-[#2C1B3A]">
      <DashboardSidebar
        primaryNav={primaryNav}
        secondaryNav={secondaryNav}
        pathname={pathname}
        onLogout={handleLogout}
        brandInitial="Z"
        brandName="Zenomi Health"
        brandTagline="Clinician Intelligence"
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardNavbar
          title=""
          subtitle=""
          initials={initials}
          userName={clinician?.ownerName}
          onDashboardClick={() => router.push("/dashboard")}
        />

        <main className="flex-1 overflow-y-auto bg-[#F5F0F8]">
          <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

