"use client";
import React from "react";

const PageHome = () => {
	const [sensorData, setSensorData] = React.useState({});

	React.useEffect(() => {
		const fetchSensorData = async () => {
			const response = await fetch("/api/sensor-data?type=latest");
			const data = await response.json();
			setSensorData(data);
		};
		fetchSensorData();
		const interval = setInterval(fetchSensorData, 3000); // setiap 3 detik
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="flex flex-col items-center">
			<h1>Sensor Data</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded-lg shadow-lg w-full">
				{Object.entries(sensorData).map(([name, { value, time }]) => (
					<div key={name} className="border p-2 rounded shadow">
						<h2 className="font-bold capitalize">{name.replace("_", " ")}</h2>
						<p>Value: {value}</p>
						<p className="text-xs text-gray-500">
							Time: {new Date(time).toLocaleString()}
						</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default PageHome;

