import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ className, ...props }) {
	return (
		<form className={cn("flex flex-col gap-6", className)} {...props}>
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
						required
						className={"py-5"}
					/>
				</div>
				<div className="grid gap-3">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						required
						placeholder="**********"
						className={"py-5"}
					/>
				</div>
				<Button
					type="submit"
					className="w-full bg-emerald-700 hover:bg-emerald-600 py-5"
				>
					Login
				</Button>
			</div>
		</form>
	);
}
