import React from "react";
import DashboardHeader from "./_components/DashboardHeader";
import UserStoryList from "./_components/UserStoryList";

const Dashboard = () => {
  return (
    <div className="p-7 md:px-20 lg:px-40 min-h-screen bg-gradient-to-br from-black via-[#0a0f25] to-[#071340]">
      <DashboardHeader />
      <UserStoryList />
    </div>
  );
};

export default Dashboard;
