import MainLayout from "../layouts/MainLayout/MainLayout";
import WelcomeCard from "../components/Dashboard/WelcomeCard";
import StatsCards from "../components/Dashboard/StatsCards";
import QuickActions from "../components/Dashboard/QuickActions";
import usePageTitle from "../hooks/usePageTitle";
import './Dashboard.css';

function Dashboard() {
  usePageTitle('Dashboard');

  return (
    <MainLayout>
      <div className="dashboard-container">
        <WelcomeCard />
        <StatsCards />
        <QuickActions />
      </div>
    </MainLayout>
  );
}

export default Dashboard;