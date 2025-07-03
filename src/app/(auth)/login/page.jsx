import { LoginForm } from "@/components/login-content/login-form";
import { LineChart, Bell, History } from "lucide-react";

// Definisikan fitur-fitur utama dalam sebuah array agar kode lebih rapi
const features = [
	{
		icon: LineChart,
		title: "Monitoring Real-time",
		description: "Pantau kondisi tanaman Anda secara langsung dari mana saja.",
	},
	{
		icon: Bell,
		title: "Notifikasi Cerdas",
		description: "Dapatkan peringatan ketika parameter melebihi batas normal.",
	},
	{
		icon: History,
		title: "Data Historis",
		description:
			"Analisis perkembangan tanaman dari waktu ke waktu untuk keputusan yang lebih baik.",
	},
];

export default function LoginPage() {
	return (
		<div className="grid min-h-svh w-full lg:grid-cols-2">
			{/* Kolom Kiri: Panel Informasi Visual */}
			<div className="relative hidden lg:flex">
				{/* Latar Belakang Gambar */}
				<div className="absolute inset-0 bg-cover bg-center" />
				{/* Lapisan Gelap untuk Kontras */}
				<div className="absolute inset-0 bg-emerald-700" />

				{/* Konten Teks */}
				<div className="relative z-10 flex flex-col justify-center p-14 text-white max-w-2xl mx-auto">
					<h2 className="text-3xl font-bold">Edamame IoT</h2>
					<p className="mt-2 max-w-lg text-base text-emerald-100">
						Sistem monitoring dan analisis tanaman edamame berbasis IoT yang
						membantu Anda meningkatkan produktivitas pertanian.
					</p>

					{/* Daftar Fitur dengan Ikon */}
					<div className="mt-12 space-y-8">
						{features.map((feature) => (
							<div key={feature.title} className="flex items-start gap-x-4">
								<div className="rounded-full bg-white/10 p-3">
									<feature.icon className="h-6 w-6 text-white" />
								</div>
								<div>
									<h3 className="text-lg font-semibold">{feature.title}</h3>
									<p className="mt-1 text-emerald-100">{feature.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			{/* Kolom Kanan: Form Login */}
			<div className="flex flex-col items-center justify-center p-6 md:p-10">
				<div className="w-full max-w-sm">
					<LoginForm />
				</div>
			</div>
		</div>
	);
}
