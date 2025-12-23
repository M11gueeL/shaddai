import React from "react";
import WelcomeCard from "./widgets/WelcomeCard"; 
import VerseCard from "./widgets/VerseCard";      
import QuickActions from "./widgets/QuickActions"; 

export default function Dashboard() {
  return (
    <div className="min-h-full p-4 md:p-8 space-y-8 animate-fade-in">
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <div className="xl:col-span-2">
          <WelcomeCard />
        </div>

        <div className="h-full">
          <VerseCard />
        </div>
        
      </div>

      <QuickActions />

    </div>
  );
}