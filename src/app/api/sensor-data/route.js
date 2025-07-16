import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

// Konfigurasi dari Environment Variables untuk keamanan
const CONFIG = {
	INFLUXDB: {
		url: process.env.INFLUXDB_URL,
		token: process.env.INFLUXDB_TOKEN,
		org: process.env.INFLUXDB_ORG,
		bucket: process.env.INFLUXDB_BUCKET,
		measurement: process.env.INFLUXDB_MEASUREMENT,
	},
	SENSORS: [
		"temperature",
		"humidity",
		"ph",
		"light",
		"ec",
		"water_temp",
		"water_level",
	],
};

const influx = new InfluxDB({
	url: CONFIG.INFLUXDB.url,
	token: CONFIG.INFLUXDB.token,
});
const queryApi = influx.getQueryApi(CONFIG.INFLUXDB.org);

/**
 * Mengambil total keseluruhan data dari bucket.
 * @returns {Promise<number>}
 */
async function queryTotalData() {
	const fluxQuery = `
    from(bucket: "${CONFIG.INFLUXDB.bucket}")
      |> range(start: -24h) // Sesuaikan rentang waktu sesuai kebutuhan
      |> filter(fn: (r) => r._measurement == "${CONFIG.INFLUXDB.measurement}")
      |> count()
  `;

	return new Promise((resolve, reject) => {
		queryApi.queryRows(fluxQuery, {
			next(row, tableMeta) {
				const o = tableMeta.toObject(row);
				resolve(o._value); // Mengembalikan total data
			},
			error(error) {
				console.error("InfluxDB Query Error:", error);
				reject(error);
			},
			complete() {
				resolve(0); // Jika tidak ada data, kembalikan 0
			},
		});
	});
}

/**
 * Mengambil data semua sensor dalam format tabel (timestamp, sensor1, sensor2, ...)
 * Menggunakan pivot() untuk efisiensi di sisi database.
 * @param {string} range - Rentang waktu Flux (e.g., "-1h", "-24h")
 * @returns {Promise<{data: Array<Object>, total: number}>}
 */
async function queryAllSensors(range, limit = 0, page = 1) {
	const offset = (page - 1) * limit;

	// Jika limit adalah 0, ambil semua data
	const fluxQuery = `
    from(bucket: "${CONFIG.INFLUXDB.bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "${CONFIG.INFLUXDB.measurement}")
      |> filter(fn: (r) => contains(value: r._field, set: [${CONFIG.SENSORS.map(
				(s) => `"${s}"`
			).join(", ")}]))
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"])
      ${limit > 0 ? `|> limit(n: ${limit}, offset: ${offset})` : ""}
  `;

	return new Promise((resolve, reject) => {
		const results = [];
		queryApi.queryRows(fluxQuery, {
			next(row, tableMeta) {
				const o = tableMeta.toObject(row);
				const formattedObject = { date: o._time, ...o };
				delete formattedObject._time;
				delete formattedObject._start;
				delete formattedObject._stop;
				delete formattedObject._measurement;
				results.push(formattedObject);
			},
			error(error) {
				console.error("InfluxDB Query Error:", error);
				reject(error);
			},
			complete() {
				resolve(results);
			},
		});
	});
}

/**
 * Mengambil nilai terakhir (latest) dari semua sensor.
 * @returns {Promise<Object>}
 */
async function queryLatestSensors() {
	const fluxQuery = `
    from(bucket: "${CONFIG.INFLUXDB.bucket}")
      |> range(start: -1h) 
      |> filter(fn: (r) => r._measurement == "${CONFIG.INFLUXDB.measurement}")
      |> filter(fn: (r) => contains(value: r._field, set: [${CONFIG.SENSORS.map(
				(s) => `"${s}"`
			).join(", ")}]))
      |> last()
      |> pivot(rowKey:["_measurement"], columnKey: ["_field"], valueColumn: "_value")
  `;

	return new Promise((resolve, reject) => {
		const results = [];
		queryApi.queryRows(fluxQuery, {
			next(row, tableMeta) {
				results.push(tableMeta.toObject(row));
			},
			error(error) {
				console.error("InfluxDB Query Error:", error);
				reject(error);
			},
			complete() {
				if (results.length === 0) {
					resolve({});
					return;
				}
				const timeQuery = `
          from(bucket: "${CONFIG.INFLUXDB.bucket}")
            |> range(start: -1h)
            |> filter(fn: (r) => r._measurement == "${CONFIG.INFLUXDB.measurement}")
            |> last() 
            |> first() 
            |> keep(columns: ["_time"])
        `;
				queryApi.queryRows(timeQuery, {
					next(row, tableMeta) {
						const finalResult = {
							...results[0],
							date: tableMeta.toObject(row)._time,
						};
						delete finalResult._measurement;
						resolve(finalResult);
					},
					error: reject,
					complete: () => {
						if (results[0] && !results[0].date) resolve(results[0]);
					},
				});
			},
		});
	});
}

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const type = searchParams.get("type") || "latest";
	const range = searchParams.get("range") || "-24h";
	const limit = parseInt(searchParams.get("limit") || "10", 10);
	const page = parseInt(searchParams.get("page") || "1", 10);

	try {
		if (type === "latest") {
			const latestData = await queryLatestSensors();
			return NextResponse.json(latestData);
		}

		if (type === "all") {
			const totalData = await queryTotalData(); // Mengambil total keseluruhan data
			const allData = await queryAllSensors(range, limit, page);
			return NextResponse.json({ data: allData, total: totalData, page }); // Mengembalikan data, total, dan halaman
		}

		return NextResponse.json(
			{ error: "Invalid type parameter. Use 'latest' or 'all'." },
			{ status: 400 }
		);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch data from InfluxDB", details: error.message },
			{ status: 500 }
		);
	}
}
