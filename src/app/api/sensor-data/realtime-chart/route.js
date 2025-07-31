// File: app/api/sensor-data/realtime-chart/route.js

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

async function queryRealtimeChartData() {
	const fluxQuery = `
    from(bucket: "${CONFIG.INFLUXDB.bucket}")
      |> range(start: -1d)
      |> filter(fn: (r) => r._measurement == "${CONFIG.INFLUXDB.measurement}")
      |> filter(fn: (r) => r._field == "ph" or r._field == "ec")
      // --- PERBAIKAN DI SINI: Menggunakan tail() bukan last() ---
      |> tail(n: 10) 
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: false)
  `;

	return new Promise((resolve, reject) => {
		const results = [];
		queryApi.queryRows(fluxQuery, {
			next(row, tableMeta) {
				const o = tableMeta.toObject(row);
				results.push({
					date: o._time,
					ph: o.ph,
					ec: o.ec,
				});
			},
			error: reject,
			complete: () => resolve(results),
		});
	});
}

export async function GET() {
	try {
		const data = await queryRealtimeChartData();
		// Kembalikan dalam format { data: [...] }
		return NextResponse.json({ data });
	} catch (error) {
		console.error("API /realtime-chart Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch real-time chart data", details: error.message },
			{ status: 500 }
		);
	}
}
