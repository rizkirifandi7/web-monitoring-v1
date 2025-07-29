"use client";

import React from "react";
import useSWR from "swr"; // Import SWR
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardAnalis from "@/components/card-content/card-analisis";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_MATRIKS } from "@/app/constant/sensor-map";
import { getDeviation } from "@/utils/getDeviasi";
import { getStatusAnalisis } from "@/utils/getStatus";
import { ChartTren } from "@/components/chart-content/chart-tren";

// Fetcher function for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

const AnalisisPage = () => {
	const { data, error } = useSWR(
		"/api/sensor-data?type=all&limit=100", // Fetch the latest 100 entries
		fetcher,
		{
			refreshInterval: 2000, // Refresh every 5 seconds
		}
	);

	const loading = !data && !error; // Determine loading state

	const metricsData = data
		? DEFAULT_MATRIKS.map((metric) => {
				const values = data.data
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
						? getStatusAnalisis(average, metric.min, metric.max, metric.unit)
						: { statusType: "unknown", statusText: "Data tidak tersedia" };
				const chartData = data.data.map((item) => ({
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
		  })
		: DEFAULT_MATRIKS.map((m) => ({
				...m,
				average: "Error",
				min: "-",
				max: "-",
				deviation: "-",
				statusType: "unknown",
				statusText: "Gagal mengambil data",
				chartData: [],
		  }));

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
								{loading
									? Array.from({ length: 3 }).map((_, idx) => (
											<Skeleton
												key={idx}
												className="h-[320px] w-full rounded-xl"
											/>
									  ))
									: metricsData.map((metric) => (
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
						</TabsContent>
						<TabsContent value="Analisis Tren">
							<ChartTren />
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
};

export default AnalisisPage;
