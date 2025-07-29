/**
 * Memformat setiap nilai numerik dalam objek data sensor menjadi string
 * dengan dua angka desimal, kecuali untuk 'water_level'.
 *
 * @param {object} data - Objek data sensor dari API, misal: { ph: 7.123, ec: 1.456 }
 * @returns {object} Objek baru dengan nilai numerik yang sudah diformat.
 */
export const formatSensorData = (sensorData) => {
	// Jika data tidak ada atau bukan objek, kembalikan objek kosong
	if (!sensorData || typeof sensorData.data !== "object") {
		return {};
	}

	const data = sensorData.data;
	const formatted = {};

	// Iterasi melalui setiap kunci (key) dalam objek data
	for (const key in data) {
		// Pastikan properti tersebut milik objek itu sendiri
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			const value = data[key];

			// Cek apakah nilainya adalah angka
			if (typeof value === "number" && !isNaN(value)) {
				// Pengecualian untuk 'water_level', format tanpa desimal
				if (key === "water_level") {
					formatted[key] = value.toFixed(0);
				} else {
					// Format angka lain menjadi string dengan 2 angka desimal
					formatted[key] = value.toFixed(2);
				}
			} else {
				// Jika bukan angka (misalnya: tanggal, string "N/A"), biarkan apa adanya
				formatted[key] = value;
			}
		}
	}
	return formatted;
};
