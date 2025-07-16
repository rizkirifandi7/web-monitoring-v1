export const formatSensorData = (data) => {
	if (!data) return {};
	const formatted = {};
	Object.entries(data).forEach(([key, value]) => {
		// Format hanya jika value berupa angka dan bukan null/undefined
		if (typeof value === "number") {
			formatted[key] = value.toFixed(2);
		} else {
			formatted[key] = value;
		}
	});
	return formatted;
};
