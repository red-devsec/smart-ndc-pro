import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { useAppStore } from "./store/appStore";
import type { UserRole } from "./data/types";

import SmartDashboard from "./pages/HR/SmartDashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import EmployeeList from "./pages/HR/EmployeeList";
import EmployeeForm from "./pages/HR/EmployeeForm";
import AttendancePage from "./pages/HR/AttendancePage";
import LeaveManagement from "./pages/HR/LeaveManagement";
import CertificatesPage from "./pages/HR/CertificatesPage";
import RfidCardsPage from "./pages/HR/RfidCardsPage";
import PayslipManagement from "./pages/HR/PayslipManagement";

import ProductList from "./pages/Inventory/ProductList";
import ProductForm from "./pages/Inventory/ProductForm";
import StockMovements from "./pages/Inventory/StockMovements";
import BarcodeScanPage from "./pages/Inventory/BarcodeScanPage";
import CategoriesPage from "./pages/Inventory/CategoriesPage";

import HRReports from "./pages/Reports/HRReports";
import InventoryReports from "./pages/Reports/InventoryReports";
import CombinedReports from "./pages/Reports/CombinedReports";

import SettingsPage from "./pages/Settings/SettingsPage";
import UserManagement from "./pages/Settings/UserManagement";
import CertificateTemplate from "./pages/Settings/CertificateTemplate";

import AlertPage from "./pages/AlertPage";
import PayslipPage from "./pages/PayslipPage";

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index path="/" element={<ProtectedRoute><SmartDashboard /></ProtectedRoute>} />

          {/* Admin Module */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />

          {/* HR Module */}
          <Route path="/employees" element={<ProtectedRoute allowedRoles={["ADMIN","RH"]}><EmployeeList /></ProtectedRoute>} />
          <Route path="/employees/new" element={<ProtectedRoute allowedRoles={["ADMIN","RH"]}><EmployeeForm /></ProtectedRoute>} />
          <Route path="/employees/:id/edit" element={<ProtectedRoute allowedRoles={["ADMIN","RH"]}><EmployeeForm /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute allowedRoles={["ADMIN","RH"]}><AttendancePage /></ProtectedRoute>} />
          <Route path="/leaves" element={<ProtectedRoute allowedRoles={["ADMIN","RH","EMPLOYE"]}><LeaveManagement /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute allowedRoles={["ADMIN","MANAGER","RH","EMPLOYE"]}><CertificatesPage /></ProtectedRoute>} />
          <Route path="/rfid-cards" element={<ProtectedRoute allowedRoles={["ADMIN","RH","MAGASINIER"]}><RfidCardsPage /></ProtectedRoute>} />
          <Route path="/hr/payslips" element={<ProtectedRoute allowedRoles={["ADMIN","MANAGER","RH"]}><PayslipManagement /></ProtectedRoute>} />

          {/* Inventory Module */}
          <Route path="/products" element={<ProtectedRoute allowedRoles={["ADMIN","MANAGER","RH","MAGASINIER"]}><ProductList /></ProtectedRoute>} />
          <Route path="/products/new" element={<ProtectedRoute allowedRoles={["ADMIN","MAGASINIER"]}><ProductForm /></ProtectedRoute>} />
          <Route path="/products/:id/edit" element={<ProtectedRoute allowedRoles={["ADMIN","MAGASINIER"]}><ProductForm /></ProtectedRoute>} />
          <Route path="/stock-movements" element={<ProtectedRoute allowedRoles={["ADMIN","MAGASINIER"]}><StockMovements /></ProtectedRoute>} />
          <Route path="/barcode-scan" element={<ProtectedRoute allowedRoles={["ADMIN","MAGASINIER"]}><BarcodeScanPage /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute allowedRoles={["ADMIN","MAGASINIER"]}><CategoriesPage /></ProtectedRoute>} />

          {/* Reports */}
          <Route path="/reports/hr" element={<ProtectedRoute allowedRoles={["ADMIN","MANAGER","RH"]}><HRReports /></ProtectedRoute>} />
          <Route path="/reports/inventory" element={<ProtectedRoute allowedRoles={["ADMIN","MANAGER","RH","MAGASINIER"]}><InventoryReports /></ProtectedRoute>} />
          <Route path="/reports/combined" element={<ProtectedRoute allowedRoles={["ADMIN","MANAGER","RH","MAGASINIER"]}><CombinedReports /></ProtectedRoute>} />

          {/* Settings */}
          <Route path="/settings" element={<ProtectedRoute allowedRoles={["ADMIN"]}><SettingsPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={["ADMIN","RH"]}><UserManagement /></ProtectedRoute>} />
          <Route path="/settings/templates" element={<ProtectedRoute allowedRoles={["ADMIN"]}><CertificateTemplate /></ProtectedRoute>} />

          {/* Alerts */}
          <Route path="/alerts" element={<ProtectedRoute><AlertPage /></ProtectedRoute>} />

          {/* Employee self-service */}
          <Route path="/payslips" element={<ProtectedRoute allowedRoles={["EMPLOYE"]}><PayslipPage /></ProtectedRoute>} />

          {/* Legacy pages */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />
          <Route path="/form-elements" element={<FormElements />} />
          <Route path="/basic-tables" element={<BasicTables />} />
          <Route path="/alerts-ui" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
        </Route>

        {/* Auth Layout */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
