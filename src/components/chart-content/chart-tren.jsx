"use client";

import { useEffect, useMemo, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ReferenceDot,
	ReferenceLine,
	XAxis,
	YAxis,
	Dot,
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
	AlertTriangle,
	CheckCircle2,
	TrendingUp,
	TrendingDown,
	LineChart,
	Frown,
	TrendingNeutral,
	Link2,
	ShieldQuestion,
	BarChart4,
} from "lucide-react";

// --- KONFIGURASI SENSOR LENGKAP ---
const chartConfig = {
	temperature: {
		label: "Suhu (°C)",
		color: "#ef4444",
		icon: Thermometer,
		thresholds: { min: 22, max: 30 },
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
		thresholds: { min: 40, max: 80 },
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
		thresholds: { min: 5.5, max: 7.5 },
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
		thresholds: { min: 1000, max: 10000 },
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
		thresholds: { min: 700, max: 2000 },
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
		thresholds: { min: 20, max: 28 },
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

// --- SEMUA FUNGSI HELPER & ANALITIK ---

function getStartDate(range) {
	const days = range === "90d" ? 90 : range === "7d" ? 7 : 30;
	const d = new Date();
	d.setDate(d.getDate() - days);
	return d;
}

function detectAnomalies(data, key) {
	const values = data
		.map((d) => d[key])
		.filter((v) => v != null)
		.sort((a, b) => a - b);
	if (values.length < 10) return [];

	const q1 = values[Math.floor(values.length * 0.25)];
	const q3 = values[Math.floor(values.length * 0.75)];
	const iqr = q3 - q1;
	const lowerBound = q1 - 1.5 * iqr;
	const upperBound = q3 + 1.5 * iqr;

	return data.filter(
		(d) => d[key] != null && (d[key] < lowerBound || d[key] > upperBound)
	);
}

function detectSignificantChanges(data, key, threshold = 30) {
	const changes = [];
	if (data.length < 2) return [];
	for (let i = 1; i < data.length; i++) {
		const prev = data[i - 1][key];
		const curr = data[i][key];
		if (prev != null && curr != null && prev !== 0) {
			const percentChange = ((curr - prev) / Math.abs(prev)) * 100;
			if (Math.abs(percentChange) > threshold) {
				changes.push({
					...data[i],
					type: percentChange > 0 ? "Lonjakan" : "Penurunan",
					change: percentChange,
				});
			}
		}
	}
	return changes;
}

function calculateStability(data, key, thresholds) {
	if (!thresholds) return null;
	const values = data.map((d) => d[key]).filter((v) => v != null);
	if (values.length === 0) return { percent: 0, text: "Data tidak cukup." };
	const inRange = values.filter(
		(v) => v >= thresholds.min && v <= thresholds.max
	).length;
	const percentage = (inRange / values.length) * 100;
	return {
		percent: percentage.toFixed(0),
		text: `data berada dalam rentang normal (${thresholds.min} - ${thresholds.max})`,
	};
}

function analyzeCorrelation(data, key1, key2) {
	if (!key2 || data.length < 10) return null;
	const values1 = data.map((d) => d[key1]).filter((v) => v != null);
	const values2 = data.map((d) => d[key2]).filter((v) => v != null);
	if (values1.length < 10 || values2.length < 10) return null;

	const midPoint = Math.floor(values1.length / 2);
	const avg1_first_half =
		values1.slice(0, midPoint).reduce((a, b) => a + b, 0) / midPoint;
	const avg1_second_half =
		values1.slice(midPoint).reduce((a, b) => a + b, 0) /
		(values1.length - midPoint);
	const avg2_first_half =
		values2.slice(0, midPoint).reduce((a, b) => a + b, 0) / midPoint;
	const avg2_second_half =
		values2.slice(midPoint).reduce((a, b) => a + b, 0) /
		(values2.length - midPoint);

	const change1 = avg1_second_half - avg1_first_half;
	const change2 = avg2_second_half - avg2_first_half;
	const threshold = 0.02; // Anggap perubahan di bawah 2% tidak signifikan

	const direction1 =
		Math.abs(change1 / avg1_first_half) < threshold
			? "stabil"
			: change1 > 0
			? "naik"
			: "turun";
	const direction2 =
		Math.abs(change2 / avg2_first_half) < threshold
			? "stabil"
			: change2 > 0
			? "naik"
			: "turun";

	const label1 = chartConfig[key1].label.split(" ")[0];
	const label2 = chartConfig[key2].label.split(" ")[0];

	if (direction1 === "stabil" || direction2 === "stabil") {
		return `Tidak ditemukan korelasi kuat antara ${label1} dan ${label2}.`;
	}
	if (direction1 === direction2) {
		return `<strong>Korelasi positif</strong>: Saat ${label1} ${direction1}, ${label2} juga cenderung ${direction2}.`;
	}
	return `<strong>Korelasi negatif</strong>: Saat ${label1} ${direction1}, ${label2} justru cenderung ${direction2}.`;
}

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
		if (trend.direction === "up")
			trendText = `Data menunjukkan tren kenaikan ${trend.percent}%.`;
		if (trend.direction === "down")
			trendText = `Data menunjukkan tren penurunan ${Math.abs(
				trend.percent
			)}%.`;
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

// --- KOMPONEN UTAMA ---
export function ChartTren() {
	const [primarySensor, setPrimarySensor] = useState("temperature");
	const [secondarySensor, setSecondarySensor] = useState(null);
	const [timeRange, setTimeRange] = useState("30d");
	const [allData, setAllData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch("/api/sensor-data?type=all");
				if (!res.ok) throw new Error("Gagal mengambil data dari server.");
				const json = await res.json();
				setAllData(json);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	const {
		filteredData,
		summaryStats,
		insights,
		anomalies,
		significantChanges,
	} = useMemo(() => {
		if (!allData.length)
			return {
				filteredData: [],
				summaryStats: {},
				insights: {},
				anomalies: [],
				significantChanges: [],
			};
		const startDate = getStartDate(timeRange);
		const dataInRange = allData.filter(
			(item) => new Date(item.date) >= startDate
		);
		const primaryValues = dataInRange
			.map((item) => item[primarySensor])
			.filter((v) => v != null);
		const primaryConfig = chartConfig[primarySensor];

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

		let trendData = null;
		if (primaryValues.length > 1) {
			const first = primaryValues[0];
			const last = primaryValues[primaryValues.length - 1];
			if (first !== 0) {
				const percent = ((last - first) / Math.abs(first)) * 100;
				if (!isNaN(percent))
					trendData = {
						percent: percent.toFixed(1),
						direction:
							percent > 0.1 ? "up" : percent < -0.1 ? "down" : "neutral",
					};
			}
		}
		const stability = calculateStability(
			dataInRange,
			primarySensor,
			primaryConfig.thresholds
		);
		const correlation = analyzeCorrelation(
			dataInRange,
			primarySensor,
			secondarySensor
		);
		const anomalyPoints = detectAnomalies(dataInRange, primarySensor);
		const changePoints = detectSignificantChanges(dataInRange, primarySensor);

		return {
			filteredData: dataInRange,
			summaryStats: stats,
			insights: { trend: trendData, stability, correlation },
			anomalies: anomalyPoints,
			significantChanges: changePoints,
		};
	}, [allData, timeRange, primarySensor, secondarySensor]);

	const recommendation = getRecommendation(
		primarySensor,
		filteredData.length > 0
			? filteredData[filteredData.length - 1][primarySensor]
			: null,
		insights.trend
	);
	const unit =
		chartConfig[primarySensor]?.label.match(/\(([^)]+)\)/)?.[1] || "";
	const sensorsToRender = [primarySensor, secondarySensor].filter(Boolean);

	return (
		<Card className="p-4 rounded-2xl shadow-sm border">
			<CardHeader className="flex items-center gap-2 space-y-0 border-b pb-5 sm:flex-row">
				<div className="grid flex-1 gap-1">
					<CardTitle>Analisis Tren & Korelasi Sensor</CardTitle>
					<CardDescription>
						Analisis data cerdas untuk deteksi anomali, tren, dan korelasi.
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
					<Select
						value={secondarySensor || "none"}
						onValueChange={(v) => setSecondarySensor(v === "none" ? null : v)}
					>
						<SelectTrigger className="w-[150px] rounded-lg">
							<SelectValue placeholder="Sensor Pembanding" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">Tidak Ada</SelectItem>
							{SENSOR_OPTIONS.filter((opt) => opt.value !== primarySensor).map(
								(opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								)
							)}
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

			<CardContent className="pt-6">
				{loading ? (
					<ChartSkeleton />
				) : error ? (
					<div className="flex flex-col items-center justify-center h-[400px] text-center">
						<Frown className="w-16 h-16 text-red-400 mb-4" />
						<h3 className="text-xl font-semibold text-red-600">
							Gagal Memuat Data
						</h3>
						<p className="text-slate-500">{error}</p>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
							<StatCard
								title="Rata-rata"
								value={summaryStats.avg}
								icon={LineChart}
								unit={unit}
							/>
							<StatCard
								title="Tertinggi"
								value={summaryStats.max}
								icon={TrendingUp}
								unit={unit}
							/>
							<StatCard
								title="Terendah"
								value={summaryStats.min}
								icon={TrendingDown}
								unit={unit}
							/>
						</div>

						<InsightCard insights={insights} />
						{(anomalies.length > 0 || significantChanges.length > 0) && (
							<EventCard anomalies={anomalies} changes={significantChanges} />
						)}

						<ChartContainer
							config={chartConfig}
							className="aspect-video h-[400px] w-full mt-6"
						>
							<AreaChart
								data={filteredData}
								margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
							>
								<defs>
									{sensorsToRender.map((key) => (
										<linearGradient
											key={key}
											id={`fill_${key}`}
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="5%"
												stopColor={chartConfig[key]?.color}
												stopOpacity={0.8}
											/>
											<stop
												offset="95%"
												stopColor={chartConfig[key]?.color}
												stopOpacity={0.1}
											/>
										</linearGradient>
									))}
								</defs>
								<CartesianGrid strokeDasharray="3 3" vertical={true} />
								<XAxis
									dataKey="date"
									tickFormatter={(v) =>
										new Date(v).toLocaleDateString("id-ID", {
											hour: "2-digit",
                      minute: "2-digit",
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
								{secondarySensor && (
									<YAxis
										yAxisId="right"
										orientation="right"
										stroke={chartConfig[secondarySensor]?.color}
										tickLine={false}
										axisLine={false}
									/>
								)}
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

								<ReferenceLine
									y={chartConfig[primarySensor].thresholds.max}
									yAxisId="left"
									strokeDasharray="3 3"
									stroke="#f87171"
									strokeWidth={1.5}
								/>
								<ReferenceLine
									y={chartConfig[primarySensor].thresholds.min}
									yAxisId="left"
									strokeDasharray="3 3"
									stroke="#60a5fa"
									strokeWidth={1.5}
								/>

								{anomalies.map((point) => (
									<ReferenceDot
										key={`ano-${point.date}`}
										x={point.date}
										y={point[primarySensor]}
										r={8}
										fill="#e53e3e"
										stroke="white"
										strokeWidth={2}
										isFront={true}
									/>
								))}
								{significantChanges.map((point) => (
									<ReferenceDot
										key={`chg-${point.date}`}
										x={point.date}
										y={point[primarySensor]}
										r={7}
										fill="#dd6b20"
										stroke="white"
										strokeWidth={2}
										shape="diamond"
										isFront={true}
									/>
								))}

								<Area
									yAxisId="left"
									type="monotone"
									dataKey={primarySensor}
									name={chartConfig[primarySensor]?.label}
									fill={`url(#fill_${primarySensor})`}
									stroke={chartConfig[primarySensor]?.color}
									strokeWidth={2.5}
									dot={false}
									activeDot={{ r: 6 }}
								/>
								{secondarySensor && (
									<Area
										yAxisId="right"
										type="monotone"
										dataKey={secondarySensor}
										name={chartConfig[secondarySensor]?.label}
										fill={`url(#fill_${secondarySensor})`}
										stroke={chartConfig[secondarySensor]?.color}
										strokeWidth={2}
										dot={false}
										activeDot={{ r: 6 }}
									/>
								)}
							</AreaChart>
						</ChartContainer>

						<RecommendationBox recommendation={recommendation} />
					</>
				)}
			</CardContent>
		</Card>
	);
}

// --- SEMUA KOMPONEN HELPER ---
function InsightCard({ insights }) {
	const { trend, stability, correlation } = insights;
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
			{trend && (
				<div className="flex items-center p-3 rounded-lg bg-slate-50 border">
					<div
						className={`p-2 rounded-md mr-3 ${
							trend.direction === "up"
								? "bg-emerald-100 text-emerald-600"
								: trend.direction === "down"
								? "bg-red-100 text-red-600"
								: "bg-slate-200"
						}`}
					>
						{trend.direction === "up" ? (
							<TrendingUp />
						) : trend.direction === "down" ? (
							<TrendingDown />
						) : (
							<TrendingNeutral />
						)}
					</div>
					<div>
						<p className="text-sm text-slate-500">Tren Keseluruhan</p>
						<p className="font-semibold text-slate-800">
							{trend.percent > 0 ? "+" : ""}
							{trend.percent}%
						</p>
					</div>
				</div>
			)}
			{stability && (
				<div className="flex items-center p-3 rounded-lg bg-slate-50 border">
					<div className="p-2 rounded-md mr-3 bg-slate-200">
						<BarChart4 />
					</div>
					<div>
						<p className="text-sm text-slate-500">Stabilitas</p>
						<p className="font-semibold text-slate-800">
							{stability.percent}%{" "}
							<span className="font-normal text-xs">{stability.text}</span>
						</p>
					</div>
				</div>
			)}
			{correlation ? (
				<div className="flex items-center p-3 rounded-lg bg-slate-50 border">
					<div className="p-2 rounded-md mr-3 bg-slate-200">
						<Link2 />
					</div>
					<div>
						<p className="text-sm text-slate-500">Korelasi</p>
						<p
							className="text-xs font-medium text-slate-700"
							dangerouslySetInnerHTML={{ __html: correlation }}
						/>
					</div>
				</div>
			) : (
				<div />
			)}
		</div>
	);
}

function EventCard({ anomalies, changes }) {
	return (
		<div className="flex items-start p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 mb-6">
			<ShieldQuestion className="w-8 h-8 mr-4 mt-1 flex-shrink-0 text-amber-500" />
			<div>
				<h4 className="font-bold text-lg">Peringatan Terdeteksi</h4>
				<ul className="list-disc list-inside text-sm mt-1 space-y-1">
					{anomalies.length > 0 && (
						<li>
							Ditemukan <strong>{anomalies.length} anomali data</strong>{" "}
							(outlier) yang ditandai dengan titik merah.
						</li>
					)}
					{changes.length > 0 && (
						<li>
							Ditemukan <strong>{changes.length} perubahan data drastis</strong>{" "}
							yang ditandai dengan wajik oranye.
						</li>
					)}
				</ul>
			</div>
		</div>
	);
}

function StatCard({ icon: Icon, title, value, unit }) {
	return (
		<div className="flex items-center p-4 bg-slate-50 rounded-lg border">
			<div className="p-3 bg-slate-200 rounded-md mr-4">
				<Icon className="w-6 h-6 text-slate-600" />
			</div>
			<div>
				<p className="text-sm text-slate-500">{title}</p>
				<p className="text-2xl font-bold text-slate-800">
					{value}{" "}
					<span className="text-base font-medium text-slate-400">{unit}</span>
				</p>
			</div>
		</div>
	);
}

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
	const classes = statusClasses[status];

	return (
		<div
			className={`mt-6 flex items-start p-4 rounded-lg border ${classes.bg} ${classes.border}`}
		>
			<Icon className={`w-10 h-10 mr-4 mt-1 flex-shrink-0 ${classes.icon}`} />
			<div className={`${classes.text}`}>
				<h4 className="font-bold text-lg">{title}</h4>
				<p className="text-sm leading-relaxed">{text}</p>
			</div>
		</div>
	);
}

function ChartSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
			</div>
			<Skeleton className="h-[450px] w-full mt-6" />
		</div>
	);
}
