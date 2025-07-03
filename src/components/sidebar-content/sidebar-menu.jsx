"use client";

import * as React from "react";
import {
	BookOpen,
	Bot,
	Command,
	Settings2,
	History,
	SquareTerminal,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./logout";
import { NavMain } from "./nav-main";
import { usePathname } from "next/navigation";

export function AppSidebar({ ...props }) {
	const pathname = usePathname();

	const data = {
		user: {
			name: "shadcn",
			email: "m@example.com",
			avatar: "/avatars/shadcn.jpg",
		},
		navMain: [
			{
				title: "Dashboard",
				url: "/dashboard/realtime-monitoring",
				icon: SquareTerminal,
				isActive: pathname === "/dashboard/realtime-monitoring",
			},
			{
				title: "Analisis Data",
				url: "/dashboard/analisis-data",
				icon: BookOpen,
				isActive: pathname === "/dashboard/analisis-data",
			},
			{
				title: "Histori",
				url: "/dashboard/histori",
				icon: History,
				isActive: pathname === "/dashboard/histori",
			},
			{
				title: "Pengaturan",
				url: "/dashboard/pengaturan",
				icon: Settings2,
				isActive: pathname === "/dashboard/pengaturan",
			},
		],
	};

	return (
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<a href="#">
								<div className="bg-emerald-700 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<Command className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">Edamame IoT</span>
									<span className="truncate text-xs">Dashboard Monitoring</span>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} pathname={pathname} />
			</SidebarContent>
		</Sidebar>
	);
}
