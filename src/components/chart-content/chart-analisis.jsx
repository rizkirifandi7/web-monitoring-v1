"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, LabelList, LineChart, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "#347433",
	},
};

export function ChartAnalisis({ data, loading, sensorLabel }) {
	// Format data hanya jika data berubah
	const chartData = useMemo(() => {
		if (!Array.isArray(data)) return [];
		const lastTen = data.slice(-10); // Ambil 10 data terakhir
		return lastTen.map((item) => ({
			time: new Date(item.date).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			}),
			[sensorLabel || "value"]: item.value,
		}));
	}, [data, sensorLabel]);

	return (
		<Card className={"w-full h-full shadow-none transition-all duration-300 hover:shadow-lg"}>
			<CardHeader>
				<CardTitle>{sensorLabel}</CardTitle>
				<CardDescription>
					Menampilkan data {sensorLabel} secara realtime.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div>Loading...</div>
				) : (
					<ChartContainer config={chartConfig}>
						<AreaChart
							accessibilityLayer
							data={chartData}
							margin={{
								left: -20,
								right: 12,
							}}
						>
							<CartesianGrid vertical={true} />
							<XAxis
								dataKey="time"
								tickLine={true}
								axisLine={true}
								tickMargin={8}
								tickFormatter={(value) => value}
							/>
							<YAxis tickLine={true} axisLine={true} tickMargin={8} />
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent indicator="line" />}
							/>
							<Area
								dataKey={sensorLabel || "value"}
								type="linear"
								fill="var(--color-desktop)"
								fillOpacity={0.4}
								stroke="var(--color-desktop)"
								dot={{
									stroke: "var(--color-desktop)",
									strokeWidth: 2,
									fill: "white",
								}}
							>
								<LabelList
									dataKey={sensorLabel || "value"}
									position="top"
									fill="var(--color-desktop)"
									fontSize={12}
								/>
							</Area>
						</AreaChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
