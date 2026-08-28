import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import FundsPage from "./pages/FundsPage";
import FundDetailPage from "./pages/FundDetailPage";
import InvestorsPage from "./pages/InvestorsPage";
import InvestorDetailPage from "./pages/InvestorDetailPage";
import AnalystPage from "./pages/AnalystPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/fondos" element={<FundsPage />} />
        <Route path="/fondos/:id" element={<FundDetailPage />} />
        <Route path="/inversores" element={<InvestorsPage />} />
        <Route path="/inversores/:id" element={<InvestorDetailPage />} />
        <Route path="/analista" element={<AnalystPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}