/* eslint-disable no-unused-vars */
import React from "react";
import {
	ArrowUp,
	ArrowDown,
	Diff,
	ShieldCheck,
	ShieldAlert,
} from "lucide-react";
import { Card } from "../ui/card";
import { ChartAnalisis } from "../chart-content/chart-analisis";

// Fungsi helper untuk memformat angka (tidak berubah)
const formatNumber = (num) =>
	typeof num === "number" ? num.toLocaleString("id-ID") : num;

// Komponen kecil untuk menampilkan item statistik (Maks, Min, Deviasi)
// Memecah UI menjadi komponen kecil membuat kode utama lebih bersih.
const StatItem = ({ icon: Icon, label, value }) => (
	<div className="px-2">
		<p className="mb-0.5 flex items-center justify-center gap-x-1.5 text-xs text-slate-500">
			<Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
			{label}
		</p>
		<p className="text-base font-semibold text-slate-800">
			{formatNumber(value)}
		</p>
	</div>
);

// --- Komponen Utama CardAnalis yang Ditingkatkan ---
const CardAnalis = ({
	icon: Icon,
	title,
	subtitle,
	average,
	unit,
	max,
	min,
	deviation,
	statusText,
	statusType,
	chartData,
	loading,
}) => {
	// Konfigurasi gaya untuk status, membuatnya lebih rapi dan mudah dikelola
	const statusConfig = {
		normal: {
			bgColor: "bg-emerald-50",
			textColor: "text-emerald-800",
			Icon: ShieldCheck,
		},
		warning: {
			bgColor: "bg-amber-50",
			textColor: "text-amber-800",
			Icon: ShieldAlert,
		},
	};

	const styles = statusConfig[statusType] || statusConfig.normal;
	const StatusIcon = styles.Icon;

	return (
		<Card className="flex h-full flex-col bg-white p-5 shadow-none transition-all duration-300 hover:shadow-lg">
			{/* 1. Header: Lebih terstruktur dengan ikon di kiri */}
			<div className=" flex items-center gap-x-4">
				<div className="flex-shrink-0 rounded-lg bg-slate-100 p-3">
					<Icon className="h-6 w-6 text-slate-600" />
				</div>
				<div>
					<h2 className="text-lg font-bold text-slate-800">{title}</h2>
					<p className="text-sm text-slate-500">{subtitle}</p>
				</div>
			</div>

			{/* 2. Nilai Rata-rata: Tampil lebih menonjol dan rata kiri */}
			<div className=" text-center">
				<p className="mb-1 text-sm text-slate-500">Rata-rata</p>
				<p className="text-2xl font-bold text-center tracking-tight text-slate-900">
					{formatNumber(average)}
					<span className="ml-1.5 text-xl font-medium text-slate-400">
						{unit}
					</span>
				</p>
			</div>

			{/* 3. Grafik Analisis */}
			<div>
				<ChartAnalisis data={chartData} loading={loading} sensorLabel={title} />
			</div>

			{/* 4. Detail Statistik: Dikelompokkan dalam satu boks yang rapi */}
			<div className=" grid grid-cols-3 divide-x divide-slate-200 rounded-lg bg-slate-50 p-3 text-center">
				<StatItem icon={ArrowUp} label="Maks" value={max} />
				<StatItem icon={ArrowDown} label="Min" value={min} />
				<StatItem icon={Diff} label="Deviasi" value={deviation} />
			</div>

			{/* 5. Indikator Status: Menempati sisa ruang di bagian bawah */}
			<div className="mt-auto">
				<div
					className={`flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold ${styles.bgColor} ${styles.textColor}`}
				>
					<StatusIcon className="mr-2 h-5 w-5" strokeWidth={2.5} />
					<span>{statusText}</span>
				</div>
			</div>
		</Card>
	);
};

export default CardAnalis;
