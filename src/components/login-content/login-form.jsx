"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";

export function LoginForm({ className, ...props }) {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		if (!email || !password) {
			toast.error("Email dan password tidak boleh kosong.");
			setLoading(false);
			return;
		}
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			if (userCredential) {
				Cookies.set(
					"user",
					JSON.stringify({
						uid: userCredential.user.uid,
					}),
					{ expires: 24 * 60 * 60 } // 1 day
				);
				toast.success("Login berhasil!");
				return router.push("/dashboard/home-monitoring");
			}
		} catch (error) {
			console.error("Login failed:", error);
			toast.error("Login gagal. Periksa email dan password Anda.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			{...props}
			onSubmit={handleSubmit}
		>
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="text-3xl font-bold">Selamat Datang</h1>
				<p className="text-muted-foreground text-base">
					Masuk untuk mengakses Edamame IoT Dashboard.
				</p>
			</div>
			<div className="grid gap-6">
				<div className="grid gap-3">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="m@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className={"py-5"}
					/>
				</div>
				<div className="grid gap-3">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="**********"
						className={"py-5"}
					/>
				</div>
				<Button
					type="submit"
					className="w-full bg-emerald-700 hover:bg-emerald-600 py-5"
				>
					{loading ? "Loading..." : "Login"}
				</Button>
			</div>
		</form>
	);
}
