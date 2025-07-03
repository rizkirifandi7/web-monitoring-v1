import {
	FlaskConical,
	Zap,
	Thermometer,
	Droplets,
	GlassWater,
	Sun,
} from "lucide-react";

export const sensorMap = [
	{ key: "ph", title: "pH Air", icon: FlaskConical, unit: "" },
	{ key: "ec", title: "EC Nutrisi", icon: Zap, unit: "μS/cm" },
	{ key: "temperature", title: "Suhu Udara", icon: Thermometer, unit: "°C" },
	{ key: "humidity", title: "Kelembapan", icon: Droplets, unit: "%" },
	{ key: "water_temp", title: "Suhu Air", icon: GlassWater, unit: "°C" },
	{ key: "light", title: "Intensitas Cahaya", icon: Sun, unit: "lux" },
];

// Konfigurasi metrik & rentang normal
export const DEFAULT_MATRIKS = [
	{
		icon: FlaskConical,
		title: "pH Air",
		subtitle: "Keasaman Air Hidroponik",
		key: "ph",
		unit: "",
		min: 5.5,
		max: 6.5,
	},
	{
		icon: Zap,
		title: "Electrical Conductivity",
		subtitle: "Kadar nutrisi dalam air",
		key: "ec",
		unit: "μS/cm",
		min: 1.2,
		max: 2.5,
	},
	{
		icon: Thermometer,
		title: "Suhu Udara",
		subtitle: "Suhu lingkungan sekitar",
		key: "temperature",
		unit: "°C",
		min: 25,
		max: 30,
	},
	{
		icon: Droplets,
		title: "Kelembaban",
		subtitle: "Tingkat kelembaban udara",
		key: "humidity",
		unit: "%",
		min: 60,
		max: 80,
	},
	{
		icon: GlassWater,
		title: "Suhu Air",
		subtitle: "Suhu larutan nutrisi",
		key: "water_temp",
		unit: "°C",
		min: 26,
		max: 28,
	},
	{
		icon: Sun,
		title: "Intensitas Cahaya",
		subtitle: "Tingkat pencahayaan",
		key: "light",
		unit: "lux",
		min: 10000,
		max: 30000,
	},
];
