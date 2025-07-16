import { NextResponse } from "next/server";

export function middleware(request) {
	const { pathname } = request.nextUrl;

	// Jika user mengakses root "/"
	if (pathname === "/") {
		// Redirect ke halaman login
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// Lanjutkan request jika bukan "/"
	return NextResponse.next();
}

// Optional: Tentukan matcher agar middleware hanya berjalan di root
export const config = {
	matcher: ["/"],
};
