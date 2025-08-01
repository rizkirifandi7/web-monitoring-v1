"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar-menu";
import NavHeader from "./nav-header";

export default function SidebarPage({ children }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<NavHeader />
				<div className="p-8">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
