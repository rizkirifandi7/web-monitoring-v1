"use client";

import React from "react";
import {
	FlaskConical,
	Zap,
	Thermometer,
	Droplets,
	GlassWater,
	Sun,
} from "lucide-react";
import CardStatus from "@/components/card-data/card-status";
import { ChartPh } from "@/components/chart-data/chart-ph";

// Fungsi untuk menentukan status dan statusType berdasarkan value (bisa kamu sesuaikan)
const getStatus = (key, value) => {
	switch (key) {
		case "ph":
			if (value >= 5.5 && value <= 6.5)
				return { status: "Normal", statusType: "normal" };
			return { status: "Peringatan", statusType: "warning" };
		case "ec":
			if (value >= 1.2 && value <= 2.5)
				return { status: "Normal", statusType: "normal" };
			return { status: "Peringatan", statusType: "warning" };
		case "temperature":
			if (value >= 20 && value <= 30)
				return { status: "Normal", statusType: "normal" };
			return { status: "Peringatan", statusType: "warning" };
		case "humidity":
			if (value >= 70 && value <= 90)
				return { status: "Normal", statusType: "normal" };
			return { status: "Peringatan", statusType: "warning" };
		case "water_temp":
			if (value >= 25 && value <= 30)
				return { status: "Normal", statusType: "normal" };
			return { status: "Peringatan", statusType: "warning" };
		case "light":
			if (value >= 15000 && value <= 50000)
				return { status: "Normal", statusType: "normal" };
			return { status: "Peringatan", statusType: "warning" };
		default:
			return { status: "Normal", statusType: "normal" };
	}
};

const sensorMap = [
	{ key: "ph", title: "pH Air", icon: FlaskConical, unit: "" },
	{ key: "ec", title: "EC Nutrisi", icon: Zap, unit: "μS/cm" },
	{ key: "temperature", title: "Suhu Udara", icon: Thermometer, unit: "°C" },
	{ key: "humidity", title: "Kelembapan", icon: Droplets, unit: "%" },
	{ key: "water_temp", title: "Suhu Air", icon: GlassWater, unit: "°C" },
	{ key: "light", title: "Intensitas Cahaya", icon: Sun, unit: "lux" },
];

const HomePage = () => {
	const [sensorData, setSensorData] = React.useState({});

	React.useEffect(() => {
		const fetchSensorData = async () => {
			const response = await fetch("/api/sensor-data?type=latest");
			const data = await response.json();
			setSensorData(data);
		};
		fetchSensorData();
		const interval = setInterval(fetchSensorData, 3000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="flex w-full flex-col gap-4 p-4">
			<h1 className="text-2xl font-bold">Home Status Real-time</h1>
			<hr />
			{/* Highlight utama */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{["ph", "ec"].map((key) => {
					const item = sensorMap.find((s) => s.key === key);
					const sensor = sensorData[item.key];
					const value = sensor
						? `${sensor.value}${item.unit ? " " + item.unit : ""}`
						: "-";
					const { status, statusType } = sensor
						? getStatus(item.key, sensor.value)
						: { status: "-", statusType: "normal" };
					return (
						<CardStatus
							key={item.title}
							title={item.title}
							icon={item.icon}
							value={value}
							status={status}
							statusType={statusType}
							highlight // tambahkan prop highlight
						/>
					);
				})}
			</div>
			{/* Sensor lain */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-2">
				{sensorMap
					.filter((item) => item.key !== "ph" && item.key !== "ec")
					.map((item) => {
						const sensor = sensorData[item.key];
						const value = sensor
							? `${sensor.value}${item.unit ? " " + item.unit : ""}`
							: "-";
						const { status, statusType } = sensor
							? getStatus(item.key, sensor.value)
							: { status: "-", statusType: "normal" };
						return (
							<CardStatus
								key={item.title}
								title={item.title}
								icon={item.icon}
								value={value}
								status={status}
								statusType={statusType}
							/>
						);
					})}
			</div>

      <div className="">
        <ChartPh/>
      </div>
		</div>
	);
};

export default HomePage;
