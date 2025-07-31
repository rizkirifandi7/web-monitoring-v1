// File: app/api/sensor-data/histori/route.js

import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

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

// --- DIUBAH: Fungsi sekarang menerima kembali startDate dan endDate ---
async function queryPaginatedSensors(startDate, endDate, page = 1, limit = 10) {
	const offset = (page - 1) * limit;

	// --- DIUBAH: rangeFilter sekarang dinamis lagi ---
	const rangeFilter = `range(start: ${
		startDate ? `time(v: "${startDate}")` : "0"
	}, stop: ${endDate ? `time(v: "${endDate}")` : "now()"})`;

	const countQuery = `
    from(bucket: "${CONFIG.INFLUXDB.bucket}")
      |> ${rangeFilter}
      |> filter(fn: (r) => r._measurement == "${CONFIG.INFLUXDB.measurement}")
      |> filter(fn: (r) => r._field == "temperature")
      |> count()
      |> yield(name: "total")
  `;

	const total = await new Promise((resolve, reject) => {
		let count = 0;
		queryApi.queryRows(countQuery, {
			next(row, tableMeta) {
				count = tableMeta.toObject(row)._value;
			},
			error: reject,
			complete: () => resolve(count),
		});
	});

	if (total === 0) {
		return { data: [], total: 0 };
	}

	const dataQuery = `
    from(bucket: "${CONFIG.INFLUXDB.bucket}")
      |> ${rangeFilter}
      |> filter(fn: (r) => r._measurement == "${CONFIG.INFLUXDB.measurement}")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${limit}, offset: ${offset})
  `;

	const data = await new Promise((resolve, reject) => {
		const results = [];
		queryApi.queryRows(dataQuery, {
			next(row, tableMeta) {
				const o = tableMeta.toObject(row);
				const formattedObject = { date: o._time, ...o };
				delete formattedObject._time;
				delete formattedObject._start;
				delete formattedObject._stop;
				delete formattedObject._measurement;
				results.push(formattedObject);
			},
			error: reject,
			complete: () => resolve(results),
		});
	});

	return { data, total };
}

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	try {
		// --- DIUBAH: Baca kembali parameter start dan end dari URL ---
		const startDate = searchParams.get("start");
		const endDate = searchParams.get("end");
		const page = parseInt(searchParams.get("page") || "1", 10);
		const limit = parseInt(searchParams.get("limit") || "10", 10);

		const paginatedData = await queryPaginatedSensors(
			startDate,
			endDate,
			page,
			limit
		);
		return NextResponse.json(paginatedData);
	} catch (error) {
		console.error("API /histori Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch historical data", details: error.message },
			{ status: 500 }
		);
	}
}
