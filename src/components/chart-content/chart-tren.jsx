"use client";

import { useMemo, useState } from "react";
import {
	Area,
	AreaChart,
	Brush,
	CartesianGrid,
	ReferenceArea,
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
import useSWR from "swr";

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
		label: "EC (mS/cm)",
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
};

const SENSOR_OPTIONS = Object.entries(chartConfig).map(
	([value, { label }]) => ({
		value,
		label,
	})
);

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
		const trendLabel = trend.type === "doubleExponential" ? "double eksponensial" : "eksponensial";
		trendText =
			trend.direction === "up"
				? `Data menunjukkan tren ${trendLabel} kenaikan dengan laju ${trend.percent}% per unit waktu.`
				: `Data menunjukkan tren ${trendLabel} penurunan dengan laju ${Math.abs(trend.percent)}% per unit waktu.`;
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

// Fungsi untuk menghitung tren double eksponensial menggunakan metode Holt's linear trend
function calculateDoubleExponentialTrend(data, sensorKey, alpha = 0.3, beta = 0.3) {
	// Filter data yang memiliki nilai sensor
	const validData = data.filter(item => item[sensorKey] != null && !isNaN(item[sensorKey]));
	
	if (validData.length < 2) {
		return null;
	}
	
	// Konversi nilai sensor ke angka
	const points = validData.map((item, index) => ({
		x: index,
		y: parseFloat(item[sensorKey])
	})).filter(point => !isNaN(point.y));
	
	if (points.length < 2) {
		return null;
	}
	
	// Inisialisasi level dan trend
	let level = points[0].y;
	let trend = points.length > 1 ? points[1].y - points[0].y : 0;
	
	// Array untuk menyimpan hasil
	const results = [];
	
	// Hitung double exponential smoothing untuk setiap titik data
	for (let i = 1; i < points.length; i++) {
		const currentValue = points[i].y;
		
		// Persamaan level: l_t = α * y_t + (1 - α) * (l_{t-1} + b_{t-1})
		const newLevel = alpha * currentValue + (1 - alpha) * (level + trend);
		
		// Persamaan trend: b_t = β * (l_t - l_{t-1}) + (1 - β) * b_{t-1}
		const newTrend = beta * (newLevel - level) + (1 - beta) * trend;
		
		// Simpan hasil
		results.push({
			level: newLevel,
			trend: newTrend,
			forecast: level + trend // Forecast untuk periode berikutnya
		});
		
		// Update level dan trend untuk iterasi berikutnya
		level = newLevel;
		trend = newTrend;
	}
	
	// Hitung persentase perubahan tren berdasarkan tren terakhir
	const lastTrend = results[results.length - 1]?.trend || 0;
	const lastLevel = results[results.length - 1]?.level || 1; // Gunakan 1 untuk menghindari pembagian dengan 0
	
	// Persentase perubahan = (trend / level) * 100%
	const percentChange = (lastTrend / lastLevel) * 100;
	
	// Tentukan arah tren
	const direction =
		percentChange > 0.1 ? "up" :
		percentChange < -0.1 ? "down" :
		"neutral";
	
	return {
		type: "doubleExponential",
		percent: percentChange.toFixed(1),
		direction: direction,
		level: level,
		trend: trend
	};
}

const fetcher = (url) => fetch(url).then((res) => res.json());

// Fungsi untuk menentukan jendela agregasi secara dinamis
function getAggregateWindow(timeRange) {
	switch (timeRange) {
		case "90d":
			return "1d"; // Rata-rata per 1 hari
		case "30d":
			return "12h"; // Rata-rata per 12 jam
		case "7d":
			return "1h"; // Rata-rata per 1 jam
		case "24h":
			return "10m"; // Rata-rata per 10 menit
		default:
			return "1h"; // Default
	}
}

// Fungsi untuk menghitung tren eksponensial menggunakan regresi logaritmik
function calculateExponentialTrend(data, sensorKey) {
	// Filter data yang memiliki nilai sensor
	const validData = data.filter(item => item[sensorKey] != null && !isNaN(item[sensorKey]));
	
	if (validData.length < 2) {
		return null;
	}
	
	// Konversi tanggal ke timestamp dan nilai sensor ke angka
	const points = validData.map((item, index) => ({
		x: index, // Gunakan index sebagai waktu untuk menyederhanakan perhitungan
		y: parseFloat(item[sensorKey])
	})).filter(point => !isNaN(point.y));
	
	if (points.length < 2) {
		return null;
	}
	
	// Transformasi logaritmik untuk nilai y
	const logPoints = points.map(point => ({
		x: point.x,
		y: Math.log(point.y)
	})).filter(point => !isNaN(point.y));
	
	if (logPoints.length < 2) {
		return null;
	}
	
	// Hitung regresi linear pada data log-transformed
	const n = logPoints.length;
	let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
	
	for (const point of logPoints) {
		sumX += point.x;
		sumY += point.y;
		sumXY += point.x * point.y;
		sumXX += point.x * point.x;
	}
	
	// Hitung slope dan intercept
	const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
	
	// Konversi slope ke persentase laju perubahan eksponensial
	// Laju perubahan eksponensial = (e^slope - 1) * 100%
	const percentChange = (Math.exp(slope) - 1) * 100;
	
	// Tentukan arah tren berdasarkan slope
	const direction =
		percentChange > 0.1 ? "up" :
		percentChange < -0.1 ? "down" :
		"neutral";
	
	return {
		percent: percentChange.toFixed(1),
		direction: direction,
		slope: slope
	};
}

// Komponen utama ChartTren
export function ChartTren() {
	const [primarySensor, setPrimarySensor] = useState("temperature");
	const [timeRange, setTimeRange] = useState("7d");
	const [trendType, setTrendType] = useState("doubleExponential");

	// Fetch data dengan SWR, URL dibuat di dalam hook untuk reaktivitas
	const { data: allData, error } = useSWR(() => {
		const aggregateWindow = getAggregateWindow(timeRange);
		return `/api/sensor-data/analisis?sensor=${primarySensor}&range=-${timeRange}&aggregateWindow=${aggregateWindow}`;
	}, fetcher);

	const loading = !allData && !error;

	const { filteredData, summaryStats, insights } = useMemo(() => {
		if (!allData || !allData.data || !allData.data.length)
			return { filteredData: [], summaryStats: {}, insights: {} };

		const dataInRange = allData.data;
		const primaryValues = dataInRange
			.map((item) => item[primarySensor])
			.filter((v) => v != null);

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

		// Hitung tren berdasarkan pilihan trendType
		let trend = null;
		if (trendType === "exponential") {
			trend = calculateExponentialTrend(dataInRange, primarySensor);
		} else if (trendType === "doubleExponential") {
			trend = calculateDoubleExponentialTrend(dataInRange, primarySensor);
		}

		return {
			filteredData: dataInRange,
			summaryStats: stats,
			insights: {
				trend
			},
		};
	}, [allData, primarySensor, trendType]);

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
							<SelectItem value="24h">24 Jam</SelectItem>
						</SelectContent>
					</Select>
					<Select value={trendType} onValueChange={setTrendType}>
						<SelectTrigger className="w-[180px] rounded-lg">
							<SelectValue placeholder="Tipe Tren" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="exponential">Tren Eksponensial</SelectItem>
							<SelectItem value="doubleExponential">Tren Double Eksponensial</SelectItem>
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
							trend={insights.trend}
							trendType={trendType}
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
function ChartVisualization({ data, primarySensor, trend, trendType }) {
	// Prepare trend data for visualization
	const trendData = useMemo(() => {
		if (!trend || !data || data.length === 0) return data;
		
		// For exponential trend, we can show the trend line
		if (trendType === "exponential" && trend.slope !== undefined) {
			// Create trend line data based on the exponential trend calculation
			return data.map((item, index) => {
				// Calculate trend value using the exponential formula
				// y = a * e^(bx) where b is the slope from our calculation
				const baseValue = item[primarySensor];
				if (baseValue === undefined || baseValue === null) return item;
				
				// For display purposes, we'll create a trend line that starts from the first data point
				// and follows the exponential trend
				const firstValue = data[0][primarySensor];
				if (firstValue === undefined || firstValue === null) return item;
				
				// Calculate the trend value: y = initial_value * e^(slope * index)
				const trendValue = firstValue * Math.exp(trend.slope * index);
				
				return {
					...item,
					[`${primarySensor}_trend`]: trendValue
				};
			});
		}
		
		// For double exponential trend, we can show forecasted values
		if (trendType === "doubleExponential" && trend.level !== undefined && trend.trend !== undefined) {
			// Create a copy of the original data
			const trendDataPoints = [...data];
			
			// Add forecast points for the next 5 time periods
			const lastDataPoint = data[data.length - 1];
			const lastDate = new Date(lastDataPoint.date);
			
			for (let i = 1; i <= 5; i++) {
				const forecastDate = new Date(lastDate);
				// Simple forecast increment (you might want to adjust based on your time range logic)
				forecastDate.setHours(forecastDate.getHours() + i);
				
				trendDataPoints.push({
					date: forecastDate.toISOString(),
					[primarySensor]: trend.level + i * trend.trend,
					isForecast: true
				});
			}
			
			return trendDataPoints;
		}
		
		return data;
	}, [data, primarySensor, trend, trendType]);
	
	return (
		<ChartContainer
			config={chartConfig}
			className="aspect-video h-[400px] w-full mt-6"
		>
			<AreaChart
				data={trendData}
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
					{/* Define a different color for forecast data */}
					<linearGradient
						id={`fill_${primarySensor}_forecast`}
						x1="0"
						y1="0"
						x2="0"
						y2="1"
					>
						<stop
							offset="5%"
							stopColor="#94a3b8"
							stopOpacity={0.8}
						/>
						<stop
							offset="95%"
							stopColor="#94a3b8"
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
					fill="#10b981"
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
					dot={false} // Matikan dot default untuk performa
					activeDot={{ r: 6 }}
				/>
				{/* Add trend line for exponential trend */}
				{trendType === "exponential" && trend && trend.slope !== undefined && (
					<Area
						yAxisId="left"
						type="monotone"
						dataKey={`${primarySensor}_trend`}
						name={`${chartConfig[primarySensor]?.label} (Tren Eksponensial)`}
						stroke="#94a3b8"
						strokeWidth={1.5}
						dot={false}
						activeDot={false}
						fill="none"
						strokeDasharray="3 3"
					/>
				)}
				{/* Add forecast line for double exponential trend */}
				{trendType === "doubleExponential" && trend && trend.level !== undefined && (
					<Area
						yAxisId="left"
						type="monotone"
						dataKey={primarySensor}
						name={`${chartConfig[primarySensor]?.label} (Prediksi)`}
						fill={`url(#fill_${primarySensor}_forecast)`}
						stroke="#94a3b8"
						strokeWidth={1.5}
						dot={false}
						activeDot={false}
						isForecast={true}
					/>
				)}
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

// Komponen skeleton untuk loading
function ChartSkeleton() {
	return (
		<div className="flex flex-col gap-4 w-full">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
				<Skeleton className="h-20 w-full rounded-lg" />
				<Skeleton className="h-20 w-full rounded-lg" />
				<Skeleton className="h-20 w-full rounded-lg" />
			</div>
			<Skeleton className="h-10 w-1/3 self-center rounded-lg" />
			<Skeleton className="h-5 w-1/2 self-center rounded-lg" />
			<Skeleton className="h-[400px] w-full rounded-lg mt-2" />
			<Skeleton className="h-24 w-full rounded-lg" />
		</div>
	);
}

// Komponen untuk menampilkan pesan error
function ErrorDisplay({ error }) {
	return (
		<div className="flex flex-col items-center justify-center h-[600px] text-red-500 bg-red-50 rounded-lg border border-red-200">
			<AlertTriangle className="w-12 h-12 mb-4" />
			<p className="text-lg font-semibold">Gagal Memuat Data Grafik</p>
			<p className="text-sm text-red-700">{error}</p>
		</div>
	);
}
