import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { PerformanceDashboard } from "@/components/PerformanceDashboard";
import { FundingForm } from "@/components/FundingForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { BottomNavigation } from "@/components/BottomNavigation";
import { DealHistory } from "@/components/DealHistory";
import { Resources } from "@/components/Resources";
import { Feed } from "@/components/Feed";
import { ProfilePage } from "@/pages/Profile";
import { LenderMatchingDashboard } from "@/components/LenderMatchingDashboard";
import { DiscoverDeals } from "@/components/DiscoverDeals";
import { AdminDashboard } from "@/components/AdminDashboard";

type AppState = "dashboard" | "form" | "results" | "history";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("dashboard");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);

  const handleStartAnalysis = () => {
    setAppState("form");
    setActiveTab("analysis");
  };

  const handleFormSubmit = (data: any) => {
    setFormData(data);
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

  const handleNavigateToFunding = (loanType?: string) => {
    // Pre-fill form data with the selected loan type
    if (loanType && formData) {
      setFormData({
        ...formData,
        recommendedLoanType: loanType
      });
    }
    setAppState("form");
  };

  const handleViewHistory = () => {
    setAppState("history");
  };

  const renderContent = () => {
    if (activeTab === "resources") {
      return <Resources />;
    }
    
    if (activeTab === "profile") {
      return <ProfilePage />;
    }
    
    if (activeTab === "admin") {
      return <AdminDashboard />;
    }
    
    if (activeTab === "feed") {
      return (
        <div className="max-w-2xl mx-auto p-6">
          <Feed />
        </div>
      );
    }
    
    if (activeTab === "discover") {
      return (
        <div className="max-w-7xl mx-auto p-6">
          <DiscoverDeals />
        </div>
      );
    }
    
    if (activeTab !== "dashboard" && activeTab !== "analysis") {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">This feature is coming soon!</p>
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
          <div className="min-h-screen bg-background">
            <AnalysisResults 
              score={analysisData?.score || 75}
              onBack={handleBackToDashboard}
              onResubmit={handleResubmit}
              analysisResult={analysisData?.analysisResult}
              formData={formData}
              onNavigateToFunding={handleNavigateToFunding}
              dealAnalysisId={analysisData?.dealAnalysisId}
            />
            {analysisData?.dealAnalysisId && (
              <div className="max-w-6xl mx-auto p-6">
                <LenderMatchingDashboard dealAnalysisId={analysisData.dealAnalysisId} />
              </div>
            )}
          </div>
        );
      case "history":
        return (
          <DealHistory 
            onBack={handleBackToDashboard}
          />
        );
      default:
        return <PerformanceDashboard onStartAnalysis={handleStartAnalysis} onViewHistory={handleViewHistory} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {(appState === "dashboard" && activeTab === "dashboard") && (
        <DashboardHeader onAdminClick={() => setActiveTab("admin")} />
      )}
      
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
