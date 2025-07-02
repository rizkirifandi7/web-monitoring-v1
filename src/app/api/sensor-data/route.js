import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

const CONFIG = {
	INFLUXDB: {
		url: "http://localhost:8086",
		token:
			"mpb6-mBnTxyFMOdvaVBAXxdfFvB_lntTuQZAVNDiXrtWcnmIZSMBwO9XAA8EzwiJwfqfgb5mpfcft1yLEVLeyw==",
		org: "zailer",
		bucket: "test",
		measurement: "sensor_data",
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

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const type = searchParams.get("type") || "latest";
	const sensorParam = searchParams.get("sensor"); // ambil sensor dari query
	let sensors = CONFIG.SENSORS;

	// Jika ada parameter sensor, validasi dan gunakan hanya sensor itu
	if (sensorParam) {
		if (!CONFIG.SENSORS.includes(sensorParam)) {
			return NextResponse.json({ error: "Invalid sensor" }, { status: 400 });
		}
		sensors = [sensorParam];
	}

	const results = {};

	if (type === "latest") {
		for (const sensor of sensors) {
			const fluxQuery = `
        from(bucket: "${CONFIG.INFLUXDB.bucket}")
          |> range(start: -1h)
          |> filter(fn: (r) => r._measurement == "${CONFIG.INFLUXDB.measurement}")
          |> filter(fn: (r) => r.sensor_id == "${sensor}")
          |> filter(fn: (r) => r._field == "value")
          |> last()
      `;
			await new Promise((resolve) => {
				queryApi.queryRows(fluxQuery, {
					next(row, tableMeta) {
						const o = tableMeta.toObject(row);
						results[sensor] = { value: o._value, time: o._time };
					},
					error() {
						resolve();
					},
					complete() {
						resolve();
					},
				});
			});
		}
		return NextResponse.json(results);
	}

	if (type === "all") {
		for (const sensor of sensors) {
			results[sensor] = [];
			const fluxQuery = `
        from(bucket: "${CONFIG.INFLUXDB.bucket}")
          |> range(start: -24h)
          |> filter(fn: (r) => r._measurement == "${CONFIG.INFLUXDB.measurement}")
          |> filter(fn: (r) => r.sensor_id == "${sensor}")
          |> filter(fn: (r) => r._field == "value")
          |> sort(columns: ["_time"])
      `;
			await new Promise((resolve) => {
				queryApi.queryRows(fluxQuery, {
					next(row, tableMeta) {
						const o = tableMeta.toObject(row);
						results[sensor].push({ value: o._value, time: o._time });
					},
					error() {
						resolve();
					},
					complete() {
						resolve();
					},
				});
			});
		}
		return NextResponse.json(results);
	}

	return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
