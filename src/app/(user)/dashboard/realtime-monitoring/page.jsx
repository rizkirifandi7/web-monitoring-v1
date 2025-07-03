"use client";

import React from "react";
import CardStatus from "@/components/card-content/card-status";
import { ChartHome } from "@/components/chart-content/chart-home";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import TitleContent from "@/components/common-content/title-content";
import { sensorMap } from "@/app/constant/sensor-map";

// Fungsi untuk menentukan status dan statusType berdasarkan value
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

// Komponen reusable untuk render CardStatus
const RenderSensorCards = ({ sensors, sensorData, highlightKeys = [] }) =>
	sensors.map((item) => {
		const valueRaw = sensorData[item.key];
		const value =
			valueRaw !== undefined && valueRaw !== null
				? `${valueRaw}${item.unit ? " " + item.unit : ""}`
				: "-";
		const { status, statusType } =
			valueRaw !== undefined && valueRaw !== null
				? getStatus(item.key, valueRaw)
				: { status: "-", statusType: "normal" };
		return (
			<CardStatus
				key={item.title}
				title={item.title}
				icon={item.icon}
				value={value}
				status={status}
				statusType={statusType}
				highlight={highlightKeys.includes(item.key)}
			/>
		);
	});

const HomePage = () => {
	const [sensorData, setSensorData] = React.useState({});

	React.useEffect(() => {
		const fetchSensorData = async () => {
			const response = await fetch("/api/sensor-data?type=latest");
			const data = await response.json();
			setSensorData(data);
		};
		fetchSensorData();
		const interval = setInterval(fetchSensorData, 5000);
		return () => clearInterval(interval);
	}, []);

	const highlightKeys = ["ph", "ec"];
	const highlightSensors = sensorMap.filter((item) =>
		highlightKeys.includes(item.key)
	);
	const otherSensors = sensorMap.filter(
		(item) => !highlightKeys.includes(item.key)
	);

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
						sensorData={sensorData}
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
