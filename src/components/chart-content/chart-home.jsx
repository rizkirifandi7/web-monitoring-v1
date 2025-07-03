"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, useMemo } from "react";

export function ChartHome() {
	const [timeRange, setTimeRange] = useState("90d");
	const [sensorData, setSensorData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			try {
				const res = await fetch("/api/sensor-data?type=all");
				const json = await res.json();
				// Data sudah berupa array of objects, langsung mapping
				const merged = json.map((item) => ({
					date: item.date,
					ph: item.ph,
					ec: item.ec,
				}));
				setSensorData(merged);
			} catch (e) {
				setSensorData([]);
			}
			setLoading(false);
		}
		fetchData();
	}, []);

	const filteredData = useMemo(() => {
		if (!sensorData.length) return [];
		const referenceDate = new Date(sensorData[sensorData.length - 1]?.date);
		let daysToSubtract = 90;
		if (timeRange === "30d") daysToSubtract = 30;
		else if (timeRange === "7d") daysToSubtract = 7;
		const startDate = new Date(referenceDate);
		startDate.setDate(startDate.getDate() - daysToSubtract);
		return sensorData.filter((item) => new Date(item.date) >= startDate);
	}, [sensorData, timeRange]);

	const chartConfig = {
		ph: { label: "pH Air", color: "var(--chart-1)" },
		ec: { label: "EC", color: "var(--chart-2)" },
	};

	return (
		<Card className="pt-0 shadow-none">
			<CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
				<div className="grid flex-1 gap-1">
					<CardTitle>Real-time Monitoring (pH Air & EC)</CardTitle>
					<CardDescription>
						Menampilkan data pH Air & EC dari sensor
					</CardDescription>
				</div>
				<Select value={timeRange} onValueChange={setTimeRange}>
					<SelectTrigger
						className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
						aria-label="Select a value"
					>
						<SelectValue placeholder="Last 3 months" />
					</SelectTrigger>
					<SelectContent className="rounded-xl">
						<SelectItem value="90d" className="rounded-lg">
							Last 3 months
						</SelectItem>
						<SelectItem value="30d" className="rounded-lg">
							Last 30 days
						</SelectItem>
						<SelectItem value="7d" className="rounded-lg">
							Last 7 days
						</SelectItem>
					</SelectContent>
				</Select>
			</CardHeader>
			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				{loading ? (
					<div className="text-center py-10">Loading...</div>
				) : (
					<ChartContainer
						config={chartConfig}
						className="aspect-auto h-[250px] w-full"
					>
						<AreaChart
							data={filteredData}
							accessibilityLayer
							margin={{
								left: -32,
								right: 12,
								top: 0,
								bottom: 0,
							}}
						>
							<defs>
								<linearGradient id="fillPh" x1="0" y1="0" x2="0" y2="1">
									<stop
										offset="5%"
										stopColor="var(--color-ph)"
										stopOpacity={0.8}
									/>
									<stop
										offset="95%"
										stopColor="var(--color-ph)"
										stopOpacity={0.1}
									/>
								</linearGradient>
								<linearGradient id="fillEc" x1="0" y1="0" x2="0" y2="1">
									<stop
										offset="5%"
										stopColor="var(--color-ec)"
										stopOpacity={0.8}
									/>
									<stop
										offset="95%"
										stopColor="var(--color-ec)"
										stopOpacity={0.1}
									/>
								</linearGradient>
							</defs>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="date"
								tickLine={true}
								axisLine={true}
								tickMargin={8}
								minTickGap={32}
								tickFormatter={(value) => {
									const date = new Date(value);
									return date.toLocaleTimeString("id-ID", {
										hour: "2-digit",
										minute: "2-digit",
									});
								}}
							/>
							<YAxis
								dataKey="value"
								tickLine={true}
								axisLine={true}
								
								tickMargin={8}
								minTickGap={32}
							/>
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										labelFormatter={(value) => {
											return new Date(value).toLocaleString("id-ID", {
												month: "short",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											});
										}}
										indicator="dot"
									/>
								}
							/>
							<Area
								dataKey="ph"
								type="natural"
								fill="url(#fillPh)"
								stroke="var(--color-ph)"
								stackId="a"
								dot={{
									stroke: "var(--color-ph)",
									strokeWidth: 2,
									fill: "var(--color-ph)",
									r: 3,
								}}
								activeDot={{
									stroke: "var(--color-ph)",
									strokeWidth: 2,
									fill: "var(--color-ph)",
									r: 4,
								}}
							/>
							<Area
								dataKey="ec"
								type="natural"
								fill="url(#fillEc)"
								stroke="var(--color-ec)"
								stackId="a"
								dot={{
									stroke: "var(--color-ec)",
									strokeWidth: 2,
									fill: "var(--color-ec)",
									r: 3,
								}}
								activeDot={{
									stroke: "var(--color-ec)",
									strokeWidth: 2,
									fill: "var(--color-ec)",
									r: 4,
								}}
							/>

							<ChartLegend content={<ChartLegendContent />} />
						</AreaChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
