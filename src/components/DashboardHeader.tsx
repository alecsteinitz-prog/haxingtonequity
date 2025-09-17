import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, User, Building2 } from "lucide-react";
import haxingtonLogo from "@/assets/haxington-logo.png";

interface DashboardHeaderProps {
  userName?: string;
}

export const DashboardHeader = ({ userName = "Investor" }: DashboardHeaderProps) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary" />
      <div className="relative px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm">
              <img src={haxingtonLogo} alt="Haxington Equity" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Haxington Equity</h1>
              <p className="text-primary-foreground/80 text-sm">Real Estate Investment Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/20 backdrop-blur-sm">
              <User className="w-4 h-4 text-secondary" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-primary-foreground mb-1">
              Welcome back, {userName}
            </h2>
            <p className="text-primary-foreground/80 text-sm">
              Ready to analyze your next investment opportunity?
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/20">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/80">Success Rate</p>
                  <p className="text-lg font-bold text-primary-foreground">94%</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/20">
                  <Clock className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/80">Avg Analysis</p>
                  <p className="text-lg font-bold text-primary-foreground">&lt; 60 sec</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/20">
                  <Building2 className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/80">Funded</p>
                  <p className="text-lg font-bold text-primary-foreground">$2.4B+</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};