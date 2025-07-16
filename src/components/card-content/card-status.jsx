/* eslint-disable no-unused-vars */
import React from "react";
import { Card } from "../ui/card"; // Asumsi menggunakan komponen dari shadcn/ui atau sejenisnya

/**
 * Komponen CardStatus yang disempurnakan secara visual.
 * Menampilkan data statistik dengan indikator status yang jelas.
 */
const CardStatus = ({
	icon: Icon,
	title,
	value,
	status,
	statusType = "normal", // Prop 'statusType' bisa: 'normal', 'warning', atau 'critical'
}) => {
	// --- Konfigurasi Gaya (Lebih Rapi & Mudah Dikelola) ---
	// Menggunakan objek untuk menyimpan gaya membuat kode lebih bersih daripada switch-case.
	// Ini juga memudahkan jika ingin menambah varian status baru di kemudian hari.
	const statusStyles = {
		normal: {
			border: "border-l-emerald-500",
			iconBg: "bg-emerald-100",
			iconText: "text-emerald-600",
			badgeBg: "bg-emerald-100",
			badgeText: "text-emerald-800",
		},
		warning: {
			border: "border-l-amber-400",
			iconBg: "bg-amber-100",
			iconText: "text-amber-600",
			badgeBg: "bg-amber-100",
			badgeText: "text-amber-800",
		},
		critical: {
			border: "border-l-red-500",
			iconBg: "bg-red-100",
			iconText: "text-red-600",
			badgeBg: "bg-red-100",
			badgeText: "text-red-800",
		},
	};

	// Pilih set gaya berdasarkan `statusType`, dengan 'normal' sebagai default.
	const styles = statusStyles[statusType] || statusStyles.normal;

	return (
		// --- Kontainer Kartu ---
		// Efek transisi yang halus, bayangan yang lebih lembut, dan border kiri berwarna
		// untuk indikator status yang jelas.
		<Card
			className={`relative flex h-full flex-col justify-between gap-y-4 overflow-hidden
                  bg-white p-5 shadow-none transition-all duration-300
                 hover:-translate-y-1 hover:shadow-lg`}
		>
			{/* Elemen Dekoratif: Ikon besar di latar belakang untuk menambah kedalaman visual */}
			<div className="absolute -right-4 -bottom-4 z-0 opacity-15">
				<Icon size={80} className={styles.iconText} />
			</div>

			{/* Konten Utama */}
			<div className="z-10 flex flex-col gap-y-4">
				{/* --- Bagian Atas: Ikon Utama & Badge Status --- */}
				<div className="flex items-center justify-between">
					<div
						className={`rounded-full p-2 ${styles.iconBg} ${styles.iconText}`}
					>
						<Icon size={20} />
					</div>
					<div
						className={`rounded-full px-3 py-1 text-xs font-semibold
                       ${styles.badgeBg} ${styles.badgeText}`}
					>
						{status}
					</div>
				</div>

				{/* --- Bagian Bawah: Nilai & Judul --- */}
				<div>
					<h3 className="text-xl font-bold text-slate-800">{value}</h3>
					<p className="text-sm font-medium text-slate-500">{title}</p>
				</div>
			</div>
		</Card>
	);
};

export default CardStatus;
