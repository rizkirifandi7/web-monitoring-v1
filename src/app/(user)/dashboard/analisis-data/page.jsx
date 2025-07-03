"use client";

import React, { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {} from "lucide-react";
import CardAnalis from "@/components/card-content/card-analisis";
import { ChartTren } from "@/components/chart-content/chart-tren";
import { DEFAULT_MATRIKS } from "@/app/constant/sensor-map";

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

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch("/api/sensor-data?type=all");
				const data = await res.json();

				const metrics = DEFAULT_MATRIKS.map((metric) => {
					// Ambil semua value untuk metric.key dari array data
					const values = data
						.map((item) => item[metric.key])
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

					// Untuk chartData, ambil array of {date, value}
					const chartData = data.map((item) => ({
						date: item.date,
						value: item[metric.key],
					}));

					return {
						...metric,
						average:
							typeof average === "number" ? Number(average.toFixed(2)) : "-",
						min: minVal,
						max: maxVal,
						deviation,
						statusType,
						statusText,
						chartData,
					};
				});
				setMetricsData(metrics);
			} catch (e) {
				setMetricsData(
					DEFAULT_MATRIKS.map((m) => ({
						...m,
						average: "Error",
						min: "-",
						max: "-",
						deviation: "-",
						statusType: "unknown",
						statusText: "Gagal mengambil data",
						chartData: [],
					}))
				);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	return (
		<div className="flex w-full flex-col gap-4">
			<Card className="flex w-full flex-col gap-4 shadow-none">
				<CardHeader className="p-4 border-b py-0">
					<CardTitle className="text-xl font-bold text-slate-800">
						Dashboard Analisis Data
					</CardTitle>
					<CardDescription>
						Menampilkan analisis data sensor dari berbagai parameter termasuk
						rata-rata, deviasi, dan grafik tren.
					</CardDescription>
				</CardHeader>
				<CardContent className={"flex flex-col gap-4 px-4"}>
					<Tabs defaultValue="Statistik" className={"w-full"}>
						<TabsList className={"w-full mb-2 h-10"}>
							<TabsTrigger value="Statistik">Statistik</TabsTrigger>
							<TabsTrigger value="Analisis Tren">Analisis Tren</TabsTrigger>
						</TabsList>
						<TabsContent value="Statistik">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								{metricsData.map((metric) => (
									<CardAnalis
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
										chartData={metric.chartData}
										loading={loading}
									/>
								))}
							</div>
							{loading && <div>Loading...</div>}
						</TabsContent>
						<TabsContent value="Analisis Tren">
							<div className="">
								<ChartTren />
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
};

export default AnalisisPage;
