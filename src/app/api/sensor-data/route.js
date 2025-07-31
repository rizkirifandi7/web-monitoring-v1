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
 * Mengambil data semua sensor atau satu sensor dalam format tabel (timestamp, sensor1, sensor2, ...)
 * @param {string} range - Rentang waktu Flux (e.g., "-1h", "-24h")
 * @param {number} limit - Batas jumlah data
 * @param {string} sensor - Nama sensor (opsional)
 * @returns {Promise<Array<Object>>}
 */
async function queryAllSensors(range, limit = 0, sensor = null) {
	let fields = CONFIG.SENSORS;
	if (sensor && CONFIG.SENSORS.includes(sensor)) {
		fields = [sensor];
	}

	const fluxQuery = `
    from(bucket: "${CONFIG.INFLUXDB.bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "${CONFIG.INFLUXDB.measurement}")
      |> filter(fn: (r) => contains(value: r._field, set: [${fields
				.map((s) => `"${s}"`)
				.join(", ")}]))
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
			|> sort(columns: ["_time"], desc: true)
			${limit > 0 ? `|> limit(n: ${limit})` : ""}
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
				resolve(results.reverse());
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
	const range = searchParams.get("range") || "-10d";
	const limit = parseInt(searchParams.get("limit") || "100", 10);
	const sensor = searchParams.get("sensor");

	try {
		if (type === "latest") {
			const latestData = await queryLatestSensors();
			return NextResponse.json(latestData);
		}

		if (type === "all") {
			const allData = await queryAllSensors(range, limit, sensor);
			return NextResponse.json({ data: allData });
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
