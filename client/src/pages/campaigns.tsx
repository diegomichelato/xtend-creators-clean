import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CampaignsTable } from "@/components/dashboard/campaigns-table";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CampaignWizard } from "@/components/campaign/campaign-wizard";
import { useGmailAuth } from "@/hooks/useGmailAuth";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function Campaigns() {
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const { canSendEmails, redirectToAuth } = useGmailAuth();
  
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['/api/campaigns'],
  });

  const handleCreateCampaign = () => {
    if (!canSendEmails) {
      redirectToAuth();
      return;
    }
    setIsCreatingCampaign(true);
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="mt-2 text-sm text-gray-600">Manage all your email outreach campaigns</p>
        </div>
        <button onClick={handleCreateCampaign} className="btn-pink">
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="card-clean">
        <div className="px-6 py-5 border-b border-gray-200/60">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">All Campaigns</h2>
          </div>
        </div>
        <CampaignsTable campaigns={campaigns || []} isLoading={isLoading} showPagination />
      </div>

      {/* Campaign Creation Sheet */}
      <Sheet open={isCreatingCampaign} onOpenChange={setIsCreatingCampaign}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Campaign</SheetTitle>
            <SheetDescription>
              Set up your next outreach campaign in a few simple steps
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <CampaignWizard 
              onComplete={() => setIsCreatingCampaign(false)}
              embedded
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
