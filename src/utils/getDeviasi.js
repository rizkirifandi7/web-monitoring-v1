export function getDeviation(values, avg) {
	if (!Array.isArray(values) || values.length === 0) return "-";
	const dev = Math.sqrt(
		values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / values.length
	);
	return dev.toFixed(2);
}
