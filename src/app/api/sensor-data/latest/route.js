// File: app/api/sensor-data/latest/route.js

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

async function queryLatestSensors() {
	const fluxQuery = `
    from(bucket: "${CONFIG.INFLUXDB.bucket}")
      |> range(start: -1d)
      |> filter(fn: (r) => r._measurement == "${CONFIG.INFLUXDB.measurement}")
      |> filter(fn: (r) => contains(value: r._field, set: [${CONFIG.SENSORS.map(
				(s) => `"${s}"`
			).join(", ")}]))
      |> last()
      |> pivot(rowKey:["_measurement"], columnKey: ["_field"], valueColumn: "_value")
  `;
	return new Promise((resolve, reject) => {
		let result = {};
		queryApi.queryRows(fluxQuery, {
			next(row, tableMeta) {
				const o = tableMeta.toObject(row);
				delete o._measurement;
				result = { ...result, ...o };
			},
			error: reject,
			complete() {
				if (Object.keys(result).length === 0) return resolve({});
				const timeQuery = `
          from(bucket: "${CONFIG.INFLUXDB.bucket}")
            |> range(start: -1d)
            |> filter(fn: (r) => r._measurement == "${CONFIG.INFLUXDB.measurement}")
            |> last() |> keep(columns: ["_time"])
        `;
				queryApi.queryRows(timeQuery, {
					next(row, tableMeta) {
						result.date = tableMeta.toObject(row)._time;
					},
					error: reject,
					complete: () => resolve(result),
				});
			},
		});
	});
}

export async function GET() {
	try {
		const latestData = await queryLatestSensors();
		return NextResponse.json(latestData);
	} catch (error) {
		console.error("API /latest Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch latest data", details: error.message },
			{ status: 500 }
		);
	}
}
