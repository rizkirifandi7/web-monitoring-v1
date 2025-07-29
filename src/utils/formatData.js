/**
 * Memformat nilai numerik dalam objek data sensor. Fungsi ini fleksibel
 * dan dapat menangani objek tunggal, array objek, atau data yang
 * dibungkus dalam properti `data`.
 *
 * @param {object | {data: object | object[]}} sensorData - Objek data dari API.
 * @returns {object | object[]} Objek atau array objek yang sudah diformat,
 * atau struktur data kosong jika input tidak valid.
 */
export const formatSensorData = (sensorData) => {
	// Menentukan sumber data yang sebenarnya untuk diproses.
	// Jika sensorData.data ada, gunakan itu. Jika tidak, asumsikan sensorData itu sendiri adalah datanya.
	const payload = sensorData && sensorData.data ? sensorData.data : sensorData;

	// Jika payload tidak valid (null, undefined), kembalikan struktur kosong yang sesuai.
	if (!payload) {
		// Jika input awalnya mengharapkan array, kembalikan array kosong. Jika tidak, objek kosong.
		return Array.isArray(sensorData?.data) ? [] : {};
	}

	// Fungsi internal untuk memformat satu objek sensor.
	const formatSingleObject = (obj) => {
		// Jika input bukan objek yang valid, kembalikan apa adanya untuk menghindari error.
		if (!obj || typeof obj !== "object") return obj;

		const formatted = {};
		for (const key in obj) {
			// Pastikan properti tersebut milik objek itu sendiri.
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				const value = obj[key];

				// Cek apakah nilainya adalah angka yang valid.
				if (typeof value === "number" && !isNaN(value)) {
					// Pengecualian untuk 'water_level', format sebagai integer (tanpa desimal).
					if (key === "water_level") {
						formatted[key] = value.toFixed(0);
					} else {
						// Format angka lain menjadi string dengan 2 angka desimal.
						formatted[key] = value.toFixed(2);
					}
				} else {
					// Jika bukan angka (misalnya: tanggal, string), biarkan apa adanya.
					formatted[key] = value;
				}
			}
		}
		return formatted;
	};

	// Cek apakah payload adalah sebuah array.
	if (Array.isArray(payload)) {
		// Jika ya, format setiap objek di dalam array menggunakan .map().
		return payload.map(formatSingleObject);
	}

	// Jika payload adalah objek tunggal (bukan array).
	if (typeof payload === "object" && payload !== null) {
		return formatSingleObject(payload);
	}

	// Jika tipe data tidak dikenali, kembalikan payload asli.
	return payload;
};
