export function getStatus(value, min, max, unit) {
	if (typeof value !== "number")
		return { statusType: "unknown", statusText: "Data tidak tersedia" };
	if (value < min || value > max) {
		return {
			statusType: "warning",
			statusText: `Nilai di luar rentang (${min} - ${max}${unit})`,
		};
	}
	return {
		statusType: "normal",
		statusText: `Dalam rentang normal (${min} - ${max}${unit})`,
	};
}

export function getStatusAnalisis(value, min, max, unit) {
	if (typeof value !== "number")
		return { statusType: "unknown", statusText: "Data tidak tersedia" };
	if (value < min || value > max) {
		return {
			statusType: "warning",
			statusText: `Nilai di luar rentang (${min} - ${max}${unit})`,
		};
	}
	return {
		statusType: "normal",
		statusText: `Dalam rentang normal (${min} - ${max}${unit})`,
	};
}
