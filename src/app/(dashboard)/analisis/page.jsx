"use client";

import React, { useEffect, useState } from "react";
import DataCard from "@/components/card-data/card-analisis";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	FlaskConical,
	Zap,
	Thermometer,
	Droplets,
	GlassWater,
	Sun,
} from "lucide-react";

// Konfigurasi metrik & rentang normal
const defaultMetrics = [
	{
		icon: FlaskConical,
		title: "pH Air",
		subtitle: "Keasaman Air Hidroponik",
		key: "ph",
		unit: "",
		min: 5.5,
		max: 6.5,
	},
	{
		icon: Zap,
		title: "Electrical Conductivity",
		subtitle: "Kadar nutrisi dalam air",
		key: "ec",
		unit: "μS/cm",
		min: 1.2,
		max: 2.5,
	},
	{
		icon: Thermometer,
		title: "Suhu Udara",
		subtitle: "Suhu lingkungan sekitar",
		key: "temperature",
		unit: "°C",
		min: 25,
		max: 30,
	},
	{
		icon: Droplets,
		title: "Kelembaban",
		subtitle: "Tingkat kelembaban udara",
		key: "humidity",
		unit: "%",
		min: 60,
		max: 80,
	},
	{
		icon: GlassWater,
		title: "Suhu Air",
		subtitle: "Suhu larutan nutrisi",
		key: "water_temp",
		unit: "°C",
		min: 26,
		max: 28,
	},
	{
		icon: Sun,
		title: "Intensitas Cahaya",
		subtitle: "Tingkat pencahayaan",
		key: "light",
		unit: "lux",
		min: 10000,
		max: 30000,
	},
];

function getDeviation(values, avg) {
	if (!Array.isArray(values) || values.length === 0) return "-";
	const dev = Math.sqrt(
		values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / values.length
	);
	return dev.toFixed(2);
}

function getStatus(value, min, max, unit) {
	if (typeof value !== "number")
		return { statusType: "unknown", statusText: "Data tidak tersedia" };
	if (value < min || value > max) {
		return {
			statusType: "warning",
			statusText: `Nilai di luar rentang (${min} - ${max}${unit})`,
		};
	}
	return {
		statusType: "normal",
		statusText: `Dalam rentang normal (${min} - ${max}${unit})`,
	};
}

const AnalisisPage = () => {
	const [metricsData, setMetricsData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [sensorData, setSensorData] = useState({}); // simpan semua data sensor

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch("/api/sensor-data?type=all");
				const data = await res.json();
				setSensorData(data); // simpan data sensor di state

				const metrics = defaultMetrics.map((metric) => {
					const arr = Array.isArray(data[metric.key]) ? data[metric.key] : [];
					const values = arr
						.map((item) => item.value)
						.filter((v) => typeof v === "number");
					const average = values.length
						? values.reduce((a, b) => a + b, 0) / values.length
						: "-";
					const minVal = values.length ? Math.min(...values) : "-";
					const maxVal = values.length ? Math.max(...values) : "-";
					const deviation = values.length ? getDeviation(values, average) : "-";
					const { statusType, statusText } =
						typeof average === "number"
							? getStatus(average, metric.min, metric.max, metric.unit)
							: { statusType: "unknown", statusText: "Data tidak tersedia" };

					return {
						...metric,
						average:
							typeof average === "number" ? Number(average.toFixed(2)) : "-",
						min: minVal,
						max: maxVal,
						deviation,
						statusType,
						statusText,
					};
				});
				setMetricsData(metrics);
			} catch (e) {
				setMetricsData(
					defaultMetrics.map((m) => ({
						...m,
						average: "Error",
						min: "-",
						max: "-",
						deviation: "-",
						statusType: "unknown",
						statusText: "Gagal mengambil data",
					}))
				);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	return (
		<div className="flex w-full flex-col gap-4 p-4">
			<h1 className="text-2xl font-bold">Analisis Edamame IoT</h1>
			<hr />
			<Card className="flex w-full flex-col gap-4 p-4">
				<Tabs defaultValue="Statistik" className={"w-full"}>
					<TabsList className={"w-full mb-2 h-12"}>
						<TabsTrigger value="Statistik">Statistik</TabsTrigger>
						<TabsTrigger value="Analisis">Analisis Tren</TabsTrigger>
					</TabsList>
					<TabsContent value="Statistik">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{metricsData.map((metric) => (
								<DataCard
									key={metric.title}
									icon={metric.icon}
									title={metric.title}
									subtitle={metric.subtitle}
									average={metric.average}
									unit={metric.unit}
									max={metric.max}
									min={metric.min}
									deviation={metric.deviation}
									statusText={metric.statusText}
									statusType={metric.statusType}
									chartData={sensorData[metric.key] || []} // pass data sensor sesuai key
								/>
							))}
						</div>
						{loading && <div>Loading...</div>}
					</TabsContent>
					<TabsContent value="Analisis">
						<div className=" grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							<p>test</p>
						</div>
					</TabsContent>
				</Tabs>
			</Card>
		</div>
	);
};

export default AnalisisPage;
