const { InfluxDB, Point } = require("@influxdata/influxdb-client");

const CONFIG = {
	INFLUXDB: {
		url: "http://localhost:8086",
		token:
			"mpb6-mBnTxyFMOdvaVBAXxdfFvB_lntTuQZAVNDiXrtWcnmIZSMBwO9XAA8EzwiJwfqfgb5mpfcft1yLEVLeyw==",
		org: "zailer",
		bucket: "sensor-baru",
		measurement: "sensor_data",
	},
	SENSORS: {
		temperature: {
			name: "Suhu Udara",
			minThreshold: 20,
			maxThreshold: 30,
			precision: 1,
		},
		humidity: {
			name: "Kelembaban",
			minThreshold: 70,
			maxThreshold: 90,
			precision: 0,
		},
		ph: { name: "pH Air", minThreshold: 5.5, maxThreshold: 6.5, precision: 1 },
		light: {
			name: "Intensitas Cahaya",
			minThreshold: 15000,
			maxThreshold: 50000,
			precision: 0,
		},
		ec: { name: "EC", minThreshold: 1.2, maxThreshold: 2.5, precision: 2 },
		water_temp: {
			name: "Suhu Air",
			minThreshold: 25,
			maxThreshold: 30,
			precision: 1,
		},
		water_level: {
			name: "Level Air",
			minThreshold: 5,
			maxThreshold: 15,
			precision: 1,
		},
	},
	UPDATE_INTERVAL: 5000,
};

const client = new InfluxDB({
	url: CONFIG.INFLUXDB.url,
	token: CONFIG.INFLUXDB.token,
});
const writeApi = client.getWriteApi(
	CONFIG.INFLUXDB.org,
	CONFIG.INFLUXDB.bucket
);

function randomValue(min, max, precision) {
	const factor = Math.pow(10, precision);
	return Math.round((Math.random() * (max - min) + min) * factor) / factor;
}

function writeSensorData() {
	const now = new Date(); // Buat satu timestamp
	Object.entries(CONFIG.SENSORS).forEach(([key, sensor]) => {
		const value = randomValue(
			sensor.minThreshold,
			sensor.maxThreshold,
			sensor.precision
		);
		const fixedValue = Number(value).toFixed(sensor.precision); // Selalu ada angka di belakang koma
		const point = new Point(CONFIG.INFLUXDB.measurement)
			.tag("source", "spark")
			.floatField(key, Number(fixedValue))
			.timestamp(now); // Pakai timestamp yang sama
		writeApi.writePoint(point);
		console.log(`Write: ${key} = ${fixedValue}`);
	});
}

writeSensorData();

writeApi
	.close()
	.then(() => {
		console.log("FINISHED");
	})
	.catch((e) => {
		console.error(e);
		console.log("Finished ERROR");
	});
