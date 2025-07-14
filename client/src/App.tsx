import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isAuthenticated } from "@/lib/auth";
import { EmailSidebar } from "@/components/email-sidebar";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Campaigns from "@/pages/campaigns";
import CampaignDetail from "@/pages/campaign-detail";
import Creators from "@/pages/creators";
import CreatorDetail from "./pages/creator-detail";
import Roster from "@/pages/roster";
import RosterProfile from "@/pages/roster-profile";
import RosterLanding from "@/pages/roster-landing";

import Contacts from "@/pages/contacts";
import Settings from "@/pages/settings-new";

import Login from "@/pages/login";
import { ForgotPasswordPage } from "@/pages/forgot-password";
// Smartlead import removed
// Whiteboard removed
import EmailTemplates from "@/pages/email-templates";
import TemplateBuilder from "@/pages/template-builder";
import Outreach from "@/pages/outreach";
import EmailDeliverability from "@/pages/email-deliverability";
import InventoryTable from "@/pages/inventory-table-new";
import Inventory from "@/pages/inventory";
import ShareableLandingPages from "@/pages/shareable-landing-pages";
import SharedLandingPage from "@/pages/shared-landing-page";
import ShareableLandingPagesDashboard from "@/pages/shareable-landing-pages-dashboard";
import { ProposalLandingPage } from "@/pages/proposal-landing";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "./components/layout/sidebar";
import { Header } from "./components/layout/header";
import { StemContactsPage } from "./pages/StemContacts";
import ProposalsPage from "@/pages/proposals";
import DealsPage from "@/pages/deals";
import SalesPipeline from "@/pages/sales-pipeline";
import ChangelogPage from "@/pages/changelog";
import Inbox from "@/pages/inbox";
import GmailSettings from "@/pages/gmail-settings";
import GmailHolding from "@/pages/gmail-holding";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminDashboard from "@/pages/admin-dashboard";

function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} />
      <main 
        id="main-content"
        className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}
      >
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/campaigns/:id" component={CampaignDetail} />
      <Route path="/creators" component={Creators} />
      <Route path="/creators/:id" component={CreatorDetail} />
      <Route path="/roster" component={Roster} />
      <Route path="/roster/:id" component={RosterProfile} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/inbox" component={Inbox} />
      <Route path="/deals" component={DealsPage} />
      <Route path="/settings" component={Settings} />
      <Route path="/email-templates" component={EmailTemplates} />
      <Route path="/template-builder" component={TemplateBuilder} />
      <Route path="/template-builder/:id" component={TemplateBuilder} />
      <Route path="/outreach" component={Outreach} />
      <Route path="/email-deliverability" component={EmailDeliverability} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/inventory-table" component={InventoryTable} />
      <Route path="/stem-contacts" component={StemContactsPage} />
      <Route path="/proposals" component={ProposalsPage} />
      <Route path="/proposals/:id" component={ProposalsPage} />
      <Route path="/sales-pipeline" component={SalesPipeline} />
      <Route path="/changelog" component={ChangelogPage} />
      <Route path="/admin-analytics" component={AdminAnalytics} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/gmail-settings" component={GmailSettings} />
      <Route path="/gmail-holding" component={GmailHolding} />
      <Route path="/crm-agent">
        {() => {
          const CRMAgent = React.lazy(() => import("./pages/crm-agent"));
          return (
            <React.Suspense fallback={<div>Loading CRM Agent...</div>}>
              <CRMAgent />
            </React.Suspense>
          );
        }}
      </Route>
      <Route path="/shareable-landing-pages" component={ShareableLandingPages} />
      <Route path="/shareable-landing-pages-dashboard" component={ShareableLandingPagesDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Skip authentication completely - direct access to dashboard
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <Switch>
            {/* Public routes that don't require authentication */}
            <Route path="/share/:uniqueId" component={SharedLandingPage} />
            <Route path="/p/:uniqueId" component={ProposalLandingPage} />
            <Route path="/shared/:uniqueId" component={ProposalLandingPage} />
            <Route path="/shared/:uniqueId/print">
              {() => <ProposalLandingPage printMode={true} />}
            </Route>
            <Route path="/roster-public" component={RosterLanding} />
            <Route path="/forgot-password" component={ForgotPasswordPage} />
            
            {/* Main application - direct access without authentication */}
            <Route>
              <MainLayout>
                <Router />
              </MainLayout>
            </Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
