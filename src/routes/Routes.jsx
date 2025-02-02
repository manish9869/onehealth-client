import {
	HomeOutlined,
	DatabaseOutlined,
	CalendarOutlined,
	DollarOutlined,
	UserOutlined,
	FileTextOutlined,
	MedicineBoxOutlined,
	TeamOutlined,
	AlertOutlined,
} from "@ant-design/icons";
import Dashboard from "../views/Dashboard";
import Medicines from "../views/Medicines";
import Treatments from "../views/Treatments";
import AppointmentScheduling from "../views/AppointmentScheduling";
import Invoices from "../views/Invoices";
import ExpensesTracker from "../views/ExpensesTracker";
import UserManagement from "../views/User";
import Login from "../views/Login";
import Customers from "../views/Customers";
import CaseHistory from "../views/CaseHistory";
import StaffMembers from "../views/StaffMembers";
import MedicalConditions from "../views/MedicalConditions";
import ForgotPassword from "../views/ForgotPassword";
import Reminders from "../views/Reminders";

const routes = [
	{
		path: "/dashboard",
		name: "Dashboard",
		icon: <HomeOutlined />,
		component: <Dashboard />,
		layout: "/admin",
		feature_id: 1,
		sub_menu: [],
	},
	{
		path: "/user",
		name: "User Management",
		icon: <UserOutlined />,
		component: <UserManagement />,
		layout: "/admin",
		feature_id: 2,
		sub_menu: [],
	},
	{
		path: "/staff",
		name: "Manage Staff",
		icon: <TeamOutlined />,
		component: <StaffMembers />,
		layout: "/admin",
		feature_id: 3,
		sub_menu: [],
	},
	{
		path: "/customer",
		name: "Manage Customer",
		icon: <TeamOutlined />,
		component: null,
		layout: "/admin",
		feature_id: 4,
		sub_menu: [
			{
				path: "/customers",
				name: "Customers",
				component: <Customers />,
				layout: "/admin",
				feature_id: 15,
			},
			{
				path: "/case-history",
				name: "Case History",
				component: <CaseHistory />,
				layout: "/admin",
				feature_id: 16,
			},
		],
	},
	{
		path: "/appointment-scheduling",
		name: "Book Appointment",
		icon: <CalendarOutlined />,
		component: <AppointmentScheduling />,
		layout: "/admin",
		feature_id: 5,
		sub_menu: [],
	},

	{
		path: "/financial",
		name: "Financial",
		icon: <DollarOutlined />,
		component: null,
		layout: "/admin",
		feature_id: 6,
		sub_menu: [
			{
				path: "/invoices",
				name: "Invoices",
				icon: <FileTextOutlined />,
				component: <Invoices />,
				layout: "/admin",
				feature_id: 17,
			},
			{
				path: "/expenses-tracker",
				name: "Expenses Tracker",
				icon: <DollarOutlined />,
				component: <ExpensesTracker />,
				layout: "/admin",
				feature_id: 18,
			},
		],
	},
	{
		path: "/master-data",
		name: "Master Data",
		icon: <DatabaseOutlined />,
		component: null,
		layout: "/admin",
		feature_id: 7,
		sub_menu: [
			{
				path: "/medicines",
				name: "Medicines",
				icon: <MedicineBoxOutlined />,
				component: <Medicines />,
				layout: "/admin",
				feature_id: 19,
			},
			{
				path: "/treatments",
				name: "Treatments",
				icon: <MedicineBoxOutlined />,
				component: <Treatments />,
				layout: "/admin",
				feature_id: 20,
			},
			{
				path: "/medical-condition",
				name: "Medical Condition",
				icon: <DatabaseOutlined />,
				component: <MedicalConditions />,
				layout: "/admin",
				feature_id: 21,
			},
		],
	},
	{
		path: "/reminders",
		name: "Reminders",
		icon: <AlertOutlined />,
		component: <Reminders />,
		layout: "/admin",
		feature_id: 22,
		sub_menu: [],
	},
];
const authRoutes = [
	{
		path: "/login",
		name: "Login",
		icon: <HomeOutlined />,
		component: <Login />,
		layout: "/auth",
		sub_menu: [],
	},
	{
		path: "/forgot-password",
		name: "Forgot Password",
		component: <ForgotPassword />, // Nuevo componente de Forgot Password
		layout: "/auth",
		sub_menu: [],
	},
	// Add other authentication routes here
];
export { routes, authRoutes };
