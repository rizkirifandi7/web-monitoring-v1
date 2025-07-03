import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Dashboard | Edamame IoT ",
	description: "Dashboard Monitoring Edamame IoT",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={`${inter.className} antialiased`}>
				<Toaster />
				{children}
			</body>
		</html>
	);
}

