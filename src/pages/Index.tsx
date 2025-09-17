import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { FundingAnalysisCard } from "@/components/FundingAnalysisCard";
import { FundingForm } from "@/components/FundingForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { BottomNavigation } from "@/components/BottomNavigation";
import { DealHistory } from "@/components/DealHistory";
import { Resources } from "@/components/Resources";

type AppState = "dashboard" | "form" | "results" | "history";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("dashboard");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleStartAnalysis = () => {
    setAppState("form");
    setActiveTab("analysis");
  };

  const handleFormSubmit = (data: any) => {
    setAnalysisData(data);
    setAppState("results");
  };

  const handleBackToDashboard = () => {
    setAppState("dashboard");
    setActiveTab("dashboard");
  };

  const handleResubmit = () => {
    setAppState("form");
  };

  const handleViewHistory = () => {
    setAppState("history");
  };

  const renderContent = () => {
    if (activeTab === "resources") {
      return <Resources />;
    }
    
    if (activeTab !== "dashboard" && activeTab !== "analysis") {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">
              {activeTab === "feed" && "Social feed for real estate investors"}
              {activeTab === "profile" && "User profile and settings"}
            </p>
          </div>
        </div>
      );
    }

    switch (appState) {
      case "form":
        return (
          <FundingForm 
            onBack={handleBackToDashboard}
            onSubmit={handleFormSubmit}
          />
        );
      case "results":
        return (
          <AnalysisResults 
            score={analysisData?.score || 75}
            onBack={handleBackToDashboard}
            onResubmit={handleResubmit}
          />
        );
      case "history":
        return (
          <DealHistory 
            onBack={handleBackToDashboard}
          />
        );
      default:
        return <FundingAnalysisCard onStartAnalysis={handleStartAnalysis} onViewHistory={handleViewHistory} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {(appState === "dashboard" && activeTab === "dashboard") && <DashboardHeader />}
      
      <div className="flex-1">
        {renderContent()}
      </div>
      
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default Index;
