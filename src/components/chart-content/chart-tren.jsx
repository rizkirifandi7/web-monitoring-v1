"use client";

import { useEffect, useMemo, useState } from "react";
import {
	Area,
	AreaChart,
	Brush,
	CartesianGrid,
	LabelList,
	ReferenceArea,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
	Thermometer,
	Droplets,
	TestTube,
	Sun,
	Zap,
	CheckCircle2,
	TrendingUp,
	TrendingDown,
	Frown,
	AlertTriangle,
	LineChart,
} from "lucide-react";
import useSWR from "swr"; // Import SWR

// Konfigurasi lengkap untuk semua sensor
const chartConfig = {
	temperature: {
		label: "Suhu (°C)",
		color: "#ef4444",
		icon: Thermometer,
		thresholds: { min: 25, max: 30 },
		impact: {
			low: "dapat memperlambat metabolisme dan pertumbuhan tanaman.",
			high: "dapat menyebabkan stres panas dan membuat daun menjadi layu.",
		},
		solution: {
			low: "Nyalakan pemanas ruangan atau kurangi ventilasi untuk menjaga kehangatan.",
			high: "Aktifkan pendingin atau tingkatkan sirkulasi udara untuk menurunkan suhu.",
		},
	},
	humidity: {
		label: "Lembap (%)",
		color: "#3b82f6",
		icon: Droplets,
		thresholds: { min: 60, max: 80 },
		impact: {
			low: "menyebabkan tanaman stres karena transpirasi berlebih dan risiko dehidrasi.",
			high: "menciptakan lingkungan ideal bagi jamur dan penyakit seperti embun tepung.",
		},
		solution: {
			low: "Lakukan penyemprotan air (misting) secara berkala atau gunakan humidifier.",
			high: "Tingkatkan ventilasi atau nyalakan kipas angin untuk sirkulasi udara.",
		},
	},
	ph: {
		label: "pH",
		color: "#eab308",
		icon: TestTube,
		thresholds: { min: 5.5, max: 6.5 },
		impact: {
			low: "terlalu asam, dapat menghambat penyerapan nutrisi makro seperti Nitrogen dan Kalium.",
			high: "terlalu basa, dapat mengganggu ketersediaan mikronutrien seperti Zat Besi.",
		},
		solution: {
			low: "Tambahkan larutan pH Up (basa) secara bertahap sambil terus memonitor.",
			high: "Tambahkan larutan pH Down (asam) secara bertahap sambil terus memonitor.",
		},
	},
	light: {
		label: "Cahaya (lux)",
		color: "#14b8a6",
		icon: Sun,
		thresholds: { min: 10000, max: 30000 },
		impact: {
			low: "mengganggu proses fotosintesis, menyebabkan pertumbuhan lambat dan tanaman kerdil.",
			high: "dapat membakar daun (leaf scorch) dan merusak klorofil secara permanen.",
		},
		solution: {
			low: "Tambahkan lampu tumbuh (grow light) atau pindahkan tanaman ke area yang lebih terang.",
			high: "Gunakan jaring peneduh (shading net) atau jauhkan sumber cahaya dari tanaman.",
		},
	},
	ec: {
		label: "EC (μS/cm)",
		color: "#8b5cf6",
		icon: Zap,
		thresholds: { min: 1.2, max: 2.5 },
		impact: {
			low: "menandakan kekurangan nutrisi esensial yang dibutuhkan untuk pertumbuhan optimal.",
			high: "menyebabkan penumpukan garam berlebih (nutrient burn) yang dapat merusak akar.",
		},
		solution: {
			low: "Tambahkan larutan nutrisi A&B sesuai takaran yang direkomendasikan.",
			high: "Tambahkan air bersih (air RO atau air suling) untuk mengencerkan larutan nutrisi.",
		},
	},
	water_temp: {
		label: "Suhu Air (°C)",
		color: "#f97316",
		icon: Thermometer,
		thresholds: { min: 26, max: 28 },
		impact: {
			low: "memperlambat metabolisme akar dan kemampuan akar dalam menyerap nutrisi.",
			high: "mengurangi kadar oksigen terlarut dalam air dan memicu penyakit akar busuk.",
		},
		solution: {
			low: "Gunakan pemanas akuarium (water heater) untuk menaikkan suhu air secara perlahan.",
			high: "Gunakan pendingin air (water chiller) atau tambahkan botol es beku ke dalam reservoir.",
		},
	},
	water_level: {
		label: "Level Air (cm)",
		color: "#0ea5e9", // Contoh warna biru langit
		icon: Droplets, // Bisa gunakan icon lain jika ada
		thresholds: { min: 5, max: 15 }, // Asumsi rentang aman
		impact: {
			low: "berisiko membuat pompa berjalan kering dan merusak akar karena kekeringan.",
			high: "dapat mengurangi aerasi pada akar dan memicu pembusukan.",
		},
		solution: {
			low: "Tambahkan air nutrisi ke dalam reservoir hingga mencapai level optimal.",
			high: "Gunakan sebagian air untuk menyiram tanaman lain atau kurangi volume jika perlu.",
		},
	},
};

const SENSOR_OPTIONS = Object.entries(chartConfig).map(
	([value, { label }]) => ({
		value,
		label,
	})
);

// Fungsi helper untuk menghitung tanggal awal berdasarkan range
function getStartDate(range) {
	const days = range === "90d" ? 90 : range === "7d" ? 7 : 30;
	const d = new Date();
	d.setDate(d.getDate() - days);
	return d;
}

// Fungsi untuk mendapatkan rekomendasi berdasarkan nilai sensor
function getRecommendation(sensorKey, value, trend) {
	const config = chartConfig[sensorKey];
	if (value == null || !config || !config.thresholds) {
		return {
			title: "Data Tidak Tersedia",
			text: "Belum ada data terbaru untuk dianalisis.",
			status: "neutral",
			icon: Frown,
		};
	}

	const { min, max } = config.thresholds;
	const { impact, solution } = config;

	let status,
		title,
		analysisText = "";
	let trendText = "";

	if (trend && trend.direction !== "neutral") {
		trendText =
			trend.direction === "up"
				? `Data menunjukkan tren kenaikan ${trend.percent}%.`
				: `Data menunjukkan tren penurunan ${Math.abs(trend.percent)}%.`;
	}

	if (value < min) {
		status = "warning";
		title = `${config.label} Terlalu Rendah`;
		const diff = (min - value).toFixed(1);
		analysisText = `Nilai saat ini ${value}, yaitu ${diff} di bawah batas normal (${min}). Kondisi ini ${impact.low} ${solution.low}`;
	} else if (value > max) {
		status = "critical";
		title = `${config.label} Terlalu Tinggi`;
		const diff = (value - max).toFixed(1);
		analysisText = `Nilai saat ini ${value}, yaitu ${diff} di atas batas normal (${max}). Kondisi ini ${impact.high} ${solution.high}`;
	} else {
		status = "normal";
		title = `${config.label} Optimal`;
		analysisText = `Nilai ${value} berada dalam rentang aman (${min} - ${max}). ${
			trendText || "Kondisi terpantau stabil."
		}`;
	}

	if (status !== "normal" && trendText) {
		analysisText += ` ${trendText}`;
	}

	return {
		title,
		text: analysisText,
		status,
		icon: status === "normal" ? CheckCircle2 : AlertTriangle,
	};
}

// Komponen utama ChartTren
export function ChartTren() {
	const [primarySensor, setPrimarySensor] = useState("temperature");
	const [timeRange, setTimeRange] = useState("30d");
	const { data: allData, error } = useSWR(
		"/api/sensor-data?type=all&limit=100"
	); // Menggunakan SWR untuk fetch data
	const loading = !allData && !error; // Menentukan loading state

	const { filteredData, summaryStats, insights } = useMemo(() => {
		if (!allData || !allData.data || !allData.data.length)
			return { filteredData: [], summaryStats: {}, insights: {} };

		const startDate = getStartDate(timeRange);
		const dataInRange = allData.data.filter(
			(item) => new Date(item.date) >= startDate
		);
		const primaryValues = dataInRange
			.map((item) => item[primarySensor])
			.filter((v) => v != null);

		// Hitung statistik dasar
		const stats = {
			avg:
				primaryValues.length > 0
					? (
							primaryValues.reduce((a, b) => a + b, 0) / primaryValues.length
					  ).toFixed(1)
					: "N/A",
			max:
				primaryValues.length > 0
					? Math.max(...primaryValues).toFixed(1)
					: "N/A",
			min:
				primaryValues.length > 0
					? Math.min(...primaryValues).toFixed(1)
					: "N/A",
		};

		// Hitung tren data
		let trendData = null;
		if (primaryValues.length > 1) {
			const first = primaryValues[0];
			const last = primaryValues[primaryValues.length - 1];
			if (first !== 0) {
				const percent = ((last - first) / Math.abs(first)) * 100;
				if (!isNaN(percent)) {
					trendData = {
						percent: percent.toFixed(1),
						direction:
							percent > 0.1 ? "up" : percent < -0.1 ? "down" : "neutral",
					};
				}
			}
		}

		return {
			filteredData: dataInRange,
			summaryStats: stats,
			insights: { trend: trendData },
		};
	}, [allData, timeRange, primarySensor]);

	const recommendation = getRecommendation(
		primarySensor,
		filteredData.length > 0
			? filteredData[filteredData.length - 1][primarySensor]
			: null,
		insights.trend
	);

	const unit =
		chartConfig[primarySensor]?.label.match(/\(([^)]+)\)/)?.[1] || "";

	return (
		<Card className="p-4 shadow-none border">
			<CardHeader className="flex items-center gap-2 space-y-0 border-b pb-5 sm:flex-row">
				<div className="grid flex-1 gap-1">
					<CardTitle>Analisis Tren</CardTitle>
					<CardDescription>
						Analisis data cerdas untuk deteksi anomali dan tren.
					</CardDescription>
				</div>
				<div className="flex gap-2">
					<Select value={primarySensor} onValueChange={setPrimarySensor}>
						<SelectTrigger className="w-[150px] rounded-lg">
							<SelectValue placeholder="Sensor Utama" />
						</SelectTrigger>
						<SelectContent>
							{SENSOR_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={timeRange} onValueChange={setTimeRange}>
						<SelectTrigger className="w-[120px] rounded-lg">
							<SelectValue placeholder="Waktu" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="90d">3 Bulan</SelectItem>
							<SelectItem value="30d">30 Hari</SelectItem>
							<SelectItem value="7d">7 Hari</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>

			<CardContent className="py-6">
				{loading ? (
					<ChartSkeleton />
				) : error ? (
					<ErrorDisplay error={error.message} />
				) : (
					<div className="flex flex-col gap-4 w-full">
						<StatsRow stats={summaryStats} unit={unit} />
						<p className="text-base text-center font-semibold text-slate-700">
							{chartConfig[primarySensor]?.label}
						</p>
						<div className="text-sm text-center text-slate-500">
							Terakhir update:{" "}
							{filteredData.length > 0
								? new Date(
										filteredData[filteredData.length - 1].date
								  ).toLocaleString("id-ID")
								: "-"}
						</div>
						<ChartVisualization
							data={filteredData}
							primarySensor={primarySensor}
						/>
						<RecommendationBox recommendation={recommendation} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// Komponen untuk menampilkan statistik
function StatsRow({ stats, unit }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
			<StatCard
				title="Rata-rata"
				value={stats.avg}
				icon={LineChart}
				unit={unit}
			/>
			<StatCard
				title="Tertinggi"
				value={stats.max}
				icon={TrendingUp}
				unit={unit}
			/>
			<StatCard
				title="Terendah"
				value={stats.min}
				icon={TrendingDown}
				unit={unit}
			/>
		</div>
	);
}

// Komponen stat card individual
function StatCard({ icon: Icon, title, value, unit, trend }) {
	const TrendIcon =
		trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;
	const trendColor = trend === "up" ? "text-green-500" : "text-red-500";

	return (
		<div className="flex items-center p-4 bg-slate-50 rounded-lg border">
			<div className="p-3 bg-slate-200 rounded-md mr-4">
				<Icon className="w-6 h-6 text-slate-600" />
			</div>
			<div>
				<p className="text-sm text-slate-500">{title}</p>
				<p className="text-2xl font-bold text-slate-800 flex items-center gap-2">
					{value}{" "}
					<span className="text-base font-medium text-slate-400">{unit}</span>
					{TrendIcon && <TrendIcon className={`w-5 h-5 ${trendColor}`} />}
				</p>
			</div>
		</div>
	);
}

// Komponen visualisasi chart
function ChartVisualization({ data, primarySensor }) {
	return (
		<ChartContainer
			config={chartConfig}
			className="aspect-video h-[400px] w-full mt-6"
		>
			<AreaChart
				data={data}
				margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
			>
				<defs>
					<linearGradient
						id={`fill_${primarySensor}`}
						x1="0"
						y1="0"
						x2="0"
						y2="1"
					>
						<stop
							offset="5%"
							stopColor={chartConfig[primarySensor]?.color}
							stopOpacity={0.8}
						/>
						<stop
							offset="95%"
							stopColor={chartConfig[primarySensor]?.color}
							stopOpacity={0.1}
						/>
					</linearGradient>
				</defs>
				<CartesianGrid strokeDasharray="3 3" vertical={true} />
				<XAxis
					dataKey="date"
					tickFormatter={(v) =>
						new Date(v).toLocaleDateString("id-ID", {
							hour: "2-digit",
							minute: "2-digit",
							month: "short",
							day: "2-digit",
						})
					}
					tickLine={true}
					axisLine={true}
					tickMargin={8}
				/>
				<YAxis
					yAxisId="left"
					stroke={chartConfig[primarySensor]?.color}
					tickLine={true}
					axisLine={true}
				/>
				<ChartTooltip
					cursor={true}
					content={
						<ChartTooltipContent
							indicator="dot"
							labelFormatter={(label) =>
								new Date(label).toLocaleString("id-ID", {
									dateStyle: "medium",
									timeStyle: "short",
								})
							}
						/>
					}
				/>
				<ReferenceArea
					yAxisId="left"
					y1={chartConfig[primarySensor].thresholds.min}
					y2={chartConfig[primarySensor].thresholds.max}
					stroke="none"
					fill="#10b981" // Warna hijau untuk zona aman
					fillOpacity={0.1}
				/>
				<Area
					yAxisId="left"
					type="monotone"
					dataKey={primarySensor}
					name={chartConfig[primarySensor]?.label}
					fill={`url(#fill_${primarySensor})`}
					stroke={chartConfig[primarySensor]?.color}
					strokeWidth={2.5}
					dot={true}
					activeDot={{ r: 6 }}
				>
					<LabelList
						position="top"
						offset={12}
						className="fill-foreground"
						fontSize={12}
					/>
				</Area>
				<Brush
					dataKey="date"
					height={30}
					stroke={chartConfig[primarySensor]?.color}
					tickFormatter={(v) => new Date(v).toLocaleDateString("id-ID")}
				/>
				<ChartLegend content={<ChartLegendContent />} />
			</AreaChart>
		</ChartContainer>
	);
}

// Komponen rekomendasi
function RecommendationBox({ recommendation }) {
	const statusClasses = {
		normal: {
			bg: "bg-emerald-50",
			border: "border-emerald-200",
			text: "text-emerald-900",
			icon: "text-emerald-500",
		},
		warning: {
			bg: "bg-amber-50",
			border: "border-amber-200",
			text: "text-amber-900",
			icon: "text-amber-500",
		},
		critical: {
			bg: "bg-red-50",
			border: "border-red-200",
			text: "text-red-900",
			icon: "text-red-500",
		},
		neutral: {
			bg: "bg-slate-50",
			border: "border-slate-200",
			text: "text-slate-800",
			icon: "text-slate-500",
		},
	};

	const { icon: Icon, text, title, status } = recommendation;
	const classes = statusClasses[status] || statusClasses.neutral;

	return (
		<div
			className={`mt-6 p-4 rounded-lg border ${classes.border} ${classes.bg} ${classes.text}`}
		>
			<div className="flex items-center gap-3">
				<Icon className={`w-6 h-6 ${classes.icon}`} />
				<h3 className="text-lg font-semibold">{title}</h3>
			</div>
			<p className="mt-2 text-sm">{text}</p>
		</div>
	);
}
