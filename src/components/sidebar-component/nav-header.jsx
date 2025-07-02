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

const NavHeader = () => {
	const pathname = usePathname();
	const pathSegments = pathname.split("/").filter(Boolean);

	return (
		<header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mr-2 data-[orientation=vertical]:h-4"
				/>
				<Breadcrumb>
					<BreadcrumbList>
						{pathSegments.map((segment, index) => {
							const isLast = index === pathSegments.length - 1;

							return (
								<React.Fragment key={index}>
									<BreadcrumbItem>
										{isLast ? (
											<BreadcrumbPage>{segment}</BreadcrumbPage>
										) : (
											<BreadcrumbLink>{segment}</BreadcrumbLink>
										)}
									</BreadcrumbItem>
									{!isLast && <BreadcrumbSeparator />}
								</React.Fragment>
							);
						})}
					</BreadcrumbList>
				</Breadcrumb>
			</div>
		</header>
	);
};

export default NavHeader;
