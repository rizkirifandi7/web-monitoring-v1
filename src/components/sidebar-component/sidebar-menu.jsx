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
import { NavUser } from "./nav-user";
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
				title: "Home",
				url: "/home",
				icon: SquareTerminal,
				isActive: pathname === "/home",
			},
			{
				title: "Analisis Data",
				url: "/analisis",
				icon: BookOpen,
				isActive: pathname === "/analisis",
			},
			{
				title: "Histori",
				url: "/histori",
				icon: History,
				isActive: pathname === "/histori",
			},
			{
				title: "Pengaturan",
				url: "/pengaturan",
				icon: Settings2,
				isActive: pathname === "/pengaturan",
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
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
