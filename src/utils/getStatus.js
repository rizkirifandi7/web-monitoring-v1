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

export const getStatusAnalisis = (average, min, max, unit = "") => {
  // Pastikan semua nilai adalah angka sebelum membandingkan
  if (typeof average !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
    return {
      statusType: "unknown",
      statusText: "Data tidak valid untuk analisis",
    };
  }

  // Cek apakah nilai rata-rata berada dalam rentang normal (inklusif)
  if (average >= min && average <= max) {
    return {
      statusType: "normal",
      statusText: `Rata-rata dalam rentang normal (${min} - ${max} ${unit})`,
    };
  }

  // Jika di luar rentang, berikan status peringatan
  return {
    statusType: "warning",
    statusText: `Rata-rata di luar rentang normal (${min} - ${max} ${unit})`,
  };
};