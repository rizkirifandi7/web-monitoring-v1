"use client";

import { useEffect, useState } from "react";
import { Droplets, ThermometerSun, TrendingUp } from "lucide-react";
import {
	CartesianGrid,
	LabelList,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "var(--chart-1)",
	},
	mobile: {
		label: "Mobile",
		color: "var(--chart-2)",
	},
};

export function ChartPh() {
	const [chartData, setChartData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const res = await fetch("/api/sensor-data?sensor=ph&type=all");
				const data = await res.json();
				// Format data sesuai kebutuhan chart
				const formatted = data.ph.map((item) => ({
					time: new Date(item.time).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
						hour12: false,
					}),
					value: item.value,
				}));
				setChartData(formatted);
			} catch (err) {
				console.error("Failed to fetch pH data", err);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	return (
		<Card className={"w-full h-full shadow-none bg-background p-0 py-3 pr-3"}>
			{loading ? (
				<div>Loading...</div>
			) : (
				<ChartContainer config={chartConfig}>
					<LineChart
						accessibilityLayer
						data={chartData}
						margin={{
							left: -12,
							right: 15,
							top: 12,
							bottom: 12,
						}}
					>
						<CartesianGrid />
						<XAxis
							dataKey="time"
							tickLine={true}
							axisLine={false}
							tickMargin={12}
						/>
						<YAxis
							dataKey="value"
							tickLine={true}
							axisLine={false}
							tickMargin={12}
						/>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Line
							dataKey="value"
							type="natural"
							stroke="var(--color-desktop)"
							strokeWidth={2}
							dot={true}
						>
							<LabelList
								position="top"
								offset={12}
								className="fill-foreground"
								fontSize={12}
							/>
						</Line>
					</LineChart>
				</ChartContainer>
			)}
		</Card>
	);
}
