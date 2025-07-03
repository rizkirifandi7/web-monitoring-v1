import ProtectedRoute from "@/components/common-content/protected-route";
import SidebarPage from "@/components/sidebar-content/sidebar-layout";

export const metadata = {
	title: "Dashboard | Edamame IoT ",
	description: "Dashboard Monitoring Edamame IoT",
};

const DashboardLayout = ({ children }) => {
	return (
		<ProtectedRoute>
			<SidebarPage>{children}</SidebarPage>;
		</ProtectedRoute>
	);
};

export default DashboardLayout;
