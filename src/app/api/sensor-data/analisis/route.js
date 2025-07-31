// File: app/api/sensor-data/analisis/route.js

import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

// Konfigurasi dari Environment Variables
const CONFIG = {
	INFLUXDB: {
		url: process.env.INFLUXDB_URL,
		token: process.env.INFLUXDB_TOKEN,
		org: process.env.INFLUXDB_ORG,
		bucket: process.env.INFLUXDB_BUCKET,
		measurement: process.env.INFLUXDB_MEASUREMENT,
	},
};

const influx = new InfluxDB({
	url: CONFIG.INFLUXDB.url,
	token: CONFIG.INFLUXDB.token,
});
const queryApi = influx.getQueryApi(CONFIG.INFLUXDB.org);

/**
 * Mengambil data time series yang sudah diagregasi untuk satu sensor.
 * @param {string} sensor - Nama field sensor (e.g., "temperature").
 * @param {string} range - Rentang waktu Flux (e.g., "-7d").
 * @param {string} aggregateWindow - Jendela waktu untuk agregasi (e.g., "1h").
 * @returns {Promise<Array<Object>>}
 */
async function queryAggregatedTimeSeries(sensor, range, aggregateWindow) {
	// Jika aggregateWindow diberikan, tambahkan langkah agregasi ke query.
	// fn: mean berarti kita mengambil nilai rata-rata untuk setiap jendela waktu.
	const aggregationQuery = aggregateWindow
		? `|> aggregateWindow(every: ${aggregateWindow}, fn: mean, createEmpty: false)`
		: "";

	const fluxQuery = `
    from(bucket: "${CONFIG.INFLUXDB.bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "${CONFIG.INFLUXDB.measurement}")
      |> filter(fn: (r) => r._field == "${sensor}")
      ${aggregationQuery}
      |> yield(name: "results")
  `;

	return new Promise((resolve, reject) => {
		const results = [];
		queryApi.queryRows(fluxQuery, {
			next(row, tableMeta) {
				const o = tableMeta.toObject(row);
				// Format data agar sesuai dengan ekspektasi komponen chart di frontend.
				results.push({
					date: o._time,
					[sensor]: o._value, // Gunakan nama sensor sebagai key dinamis.
				});
			},
			error: reject,
			complete: () => {
				resolve(results);
			},
		});
	});
}

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	try {
		const sensor = searchParams.get("sensor");
		const range = searchParams.get("range");
		const aggregateWindow = searchParams.get("aggregateWindow");

		// Pastikan parameter wajib ada.
		if (!sensor || !range) {
			return NextResponse.json(
				{ error: "Parameter 'sensor' and 'range' are required." },
				{ status: 400 }
			);
		}

		const timeSeriesData = await queryAggregatedTimeSeries(
			sensor,
			range,
			aggregateWindow
		);

		// Kembalikan data dalam format { data: [...] } agar konsisten dengan fetcher lainnya.
		return NextResponse.json({ data: timeSeriesData });
	} catch (error) {
		console.error("API /analisis Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch analysis data", details: error.message },
			{ status: 500 }
		);
	}
}
