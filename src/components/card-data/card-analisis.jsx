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
import { ChartPh } from "../chart-data/chart-ph";

// Fungsi untuk memformat angka besar dengan pemisah ribuan
const formatNumber = (num) => {
	if (typeof num === "number") {
		return num.toLocaleString("id-ID");
	}
	return num;
};

const DataCard = ({
	icon: Icon, // Menerima komponen ikon sebagai prop
	title,
	subtitle,
	average,
	unit,
	max,
	min,
	deviation,
	statusText,
	statusType, // 'normal' atau 'warning'
	chartData
}) => {
	// Menentukan warna dan ikon status berdasarkan statusType
	const isNormal = statusType === "normal";
	const statusBgColor = isNormal ? "bg-green-100" : "bg-yellow-100";
	const statusTextColor = isNormal ? "text-green-800" : "text-yellow-800";
	const StatusIcon = isNormal ? ShieldCheck : ShieldAlert;

	return (
		<Card className="flex flex-col h-full bg-white p-6 font-sans border border-gray-100">
			{/* Header */}
			<div className="flex justify-between items-center mb-4">
				<div>
					<h2 className="text-xl font-bold text-gray-800">{title}</h2>
					<p className="text-sm text-gray-500">{subtitle}</p>
				</div>
				<Icon className="" size={24} strokeWidth={2} />
			</div>

			{/* Nilai Rata-rata */}
			<div className="text-center my-2">
				<p className="text-gray-600 text-base mb-2">Rata-rata</p>
				<p className="text-2xl md:text-3xl font-bold text-emerald-700 tracking-tight">
					{formatNumber(average)}
					<span className="text-xl md:text-2xl ml-2 text-gray-400 font-medium">
						{unit}
					</span>
				</p>
			</div>

			{/* Detail Statistik */}
			<div className="grid grid-cols-3 gap-4 text-center mb-2">
				<div>
					<p className="text-gray-500 text-sm flex items-center justify-center">
						<ArrowUp className="h-4 w-4 mr-1" /> Maks
					</p>
					<p className="font-semibold text-xl text-gray-800">
						{formatNumber(max)}
					</p>
				</div>
				<div>
					<p className="text-gray-500 text-sm flex items-center justify-center">
						<ArrowDown className="h-4 w-4 mr-1" /> Min
					</p>
					<p className="font-semibold text-xl text-gray-800">
						{formatNumber(min)}
					</p>
				</div>
				<div>
					<p className="text-gray-500 text-sm">Deviasi</p>
					<p className="font-semibold text-xl text-gray-800 flex items-center justify-center">
						<Diff className="h-4 w-4" strokeWidth={2.5} />
						<span className="ml-0.5">{formatNumber(deviation)}</span>
					</p>
				</div>
			</div>

			<div className="">
				<ChartPh />
			</div>

			{/* Indikator Status (Dinamis) */}
			<div className="mt-auto pt-4">
				<div
					className={`flex items-center justify-center text-sm font-medium px-4 py-2 rounded-full ${statusBgColor} ${statusTextColor}`}
				>
					<StatusIcon className="mr-2 h-5 w-5" strokeWidth={2} />
					<span>{statusText}</span>
				</div>
			</div>
		</Card>
	);
};

export default DataCard;
