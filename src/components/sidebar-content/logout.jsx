"use client";

import { LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export function Logout() {
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await signOut(auth);
			Cookies.remove("user");
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
			toast.error("Logout gagal, coba lagi.");
		}
	};

	return (
		<Button onClick={handleLogout} variant="outline" className="w-fit">
			<LogOut className="mr-2 h-4 w-4" />
			Keluar
		</Button>
	);
}
