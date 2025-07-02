/* eslint-disable no-unused-vars */
import React from "react";
import { Card } from "../ui/card";

const CardStatus = ({
	icon: Icon, // Diubah agar lebih jelas menerima komponen, bukan elemen
	title,
	value,
	status,
	statusType, // Prop baru: 'normal', 'warning', atau 'critical'
}) => {
	// Menentukan warna untuk ikon dan badge berdasarkan statusType
	let iconBgColor, iconTextColor, badgeBgColor, badgeTextColor;

	switch (statusType) {
		case "warning":
			iconBgColor = "bg-yellow-100";
			iconTextColor = "text-yellow-600";
			badgeBgColor = "bg-yellow-100";
			badgeTextColor = "text-yellow-800";
			break;
		case "critical":
			iconBgColor = "bg-red-100";
			iconTextColor = "text-red-600";
			badgeBgColor = "bg-red-100";
			badgeTextColor = "text-red-800";
			break;
		case "normal":
		default:
			iconBgColor = "bg-blue-100";
			iconTextColor = "text-blue-600";
			badgeBgColor = "bg-green-100";
			badgeTextColor = "text-green-800";
			break;
	}

	return (
		<Card
			className={`p-5 flex flex-col justify-between gap-y-6 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 `}
		>
			<div className="flex justify-between items-center gap-x-4">
				<div className={`p-2 rounded-lg ${iconBgColor}`}>
					<Icon size={20} />
				</div>
				<div
					className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeBgColor} ${badgeTextColor}`}
				>
					{status}
				</div>
			</div>

			<div>
				<h3 className="font-bold text-2xl text-gray-800">{value}</h3>
				<p className="text-base text-gray-500 mb-1">{title}</p>
			</div>
		</Card>
	);
};

export default CardStatus;
