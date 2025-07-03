"use client";

import React from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Logout } from "./logout";

const NavHeader = () => {
	const pathname = usePathname();
	const pathSegments = pathname.split("/").filter(Boolean);

	return (
		<header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background w-full">
			<div className="flex items-center gap-2 px-4 w-full">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mr-2 data-[orientation=vertical]:h-4"
				/>
				<div className="flex justify-between items-center w-full">
					<Breadcrumb>
						<BreadcrumbList>
							{pathSegments.map((segment, index) => {
								const isLast = index === pathSegments.length - 1;

								return (
									<React.Fragment key={index}>
										<BreadcrumbItem>
											{isLast ? (
												<BreadcrumbPage
													className={"capitalize test-lg font-semibold"}
												>
													{segment.replace(/-/g, " ")}
												</BreadcrumbPage>
											) : (
												<BreadcrumbLink
													className={"capitalize test-lg font-semibold"}
												>
													{segment.replace(/-/g, " ")}
												</BreadcrumbLink>
											)}
										</BreadcrumbItem>
										{!isLast && <BreadcrumbSeparator />}
									</React.Fragment>
								);
							})}
						</BreadcrumbList>
					</Breadcrumb>
					<Logout />
				</div>
			</div>
		</header>
	);
};

export default NavHeader;
