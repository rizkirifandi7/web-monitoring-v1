import { getStatus } from "@/utils/getStatus";
import CardStatus from "./card-status";

// Komponen reusable untuk render CardStatus
export const RenderSensorCards = ({
	sensors,
	sensorData,
	highlightKeys = [],
}) =>
	sensors.map((item) => {
		const valueRaw = sensorData[item.key];
		const value =
			valueRaw !== undefined && valueRaw !== null
				? `${valueRaw}${item.unit ? " " + item.unit : ""}`
				: "-";
		const { status, statusType } =
			valueRaw !== undefined && valueRaw !== null
				? getStatus(item.key, valueRaw)
				: { status: "-", statusType: "normal" };
		return (
			<CardStatus
				key={item.title}
				title={item.title}
				icon={item.icon}
				value={value}
				status={status}
				statusType={statusType}
				highlight={highlightKeys.includes(item.key)}
			/>
		);
	});
