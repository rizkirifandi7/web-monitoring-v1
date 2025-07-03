"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { auth } from "@/lib/firebase";

export default function ProtectedRoute({ children }) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			const token = Cookies.get("user");
			if (!user || !token) {
				Cookies.remove("user");
				router.replace("/login");
			} else {
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, [router]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="loader"></div>
			</div>
		);
	}

	return children;
}
