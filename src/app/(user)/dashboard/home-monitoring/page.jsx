"use client";

import React from "react";
import useSWR from "swr"; // Import SWR
import { ChartHome } from "@/components/chart-content/chart-home";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { sensorMap } from "@/app/constant/sensor-map";
import { RenderSensorCards } from "@/components/card-content/sensor-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatSensorData } from "@/utils/formatData";

const HomePage = () => {
	const fetcher = (url) => fetch(url).then((res) => res.json());
	const { data: sensorData, error } = useSWR(
		"/api/sensor-data?type=latest",
		fetcher,
		{
			refreshInterval: 2000,
		}
	);

	if (error) return <div>Error loading data</div>;

	if (!sensorData) {
		return (
			<Card className="flex w-full flex-col shadow-none">
				<CardHeader className="p-4 border-b py-0">
					<CardTitle className="text-xl font-bold text-slate-800">
						Dashboard Real-time Monitoring
					</CardTitle>
					<CardDescription>
						Menampilkan data sensor pH Air, EC, dan parameter lainnya secara
						real-time.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4 px-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{Array.from({ length: 2 }).map((_, i) => (
							<Skeleton key={i} className="h-24 w-full rounded-lg" />
						))}
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-24 w-full rounded-lg" />
						))}
					</div>
					<Skeleton className="h-64 w-full rounded-lg" />
				</CardContent>
			</Card>
		);
	}

	const highlightKeys = ["ph", "ec"];
	const highlightSensors = sensorMap.filter((item) =>
		highlightKeys.includes(item.key)
	);
	const otherSensors = sensorMap.filter(
		(item) => !highlightKeys.includes(item.key)
	);

	const formattedSensorData = formatSensorData(sensorData);

	return (
		<Card className="flex w-full flex-col shadow-none">
			<CardHeader className="p-4 border-b py-0">
				<CardTitle className="text-xl font-bold text-slate-800">
					Dashboard Real-time Monitoring
				</CardTitle>
				<CardDescription>
					Menampilkan data sensor pH Air, EC, dan parameter lainnya secara
					real-time.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 px-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<RenderSensorCards
						sensors={highlightSensors}
						sensorData={formattedSensorData}
						highlightKeys={highlightKeys}
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
					<RenderSensorCards sensors={otherSensors} sensorData={sensorData} />
				</div>
				<ChartHome />
			</CardContent>
		</Card>
	);
};

export default HomePage;
