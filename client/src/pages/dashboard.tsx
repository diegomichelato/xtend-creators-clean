import { useQuery } from "@tanstack/react-query";
import { OverviewCard } from "@/components/dashboard/overview-card";
import { CampaignsTable } from "@/components/dashboard/campaigns-table";
import { CampaignWizard } from "@/components/campaign/campaign-wizard";
import { Loader2, TrendingUp, Mail, Eye, MessageSquare, Plus, Users, DollarSign, Activity, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "wouter";

// Sample tasks for the right panel to match the screenshot design
const sampleTasks = [
  {
    title: "Share deliverables with Ava",
    subtitle: "Ava Chen x Mejuri",
    id: 1
  },
  {
    title: "Make sure product was sent",
    subtitle: "Jess Mahoney x Alo Yoga",
    id: 2
  },
  {
    title: "Confirm exclusivity window with Ryan",
    subtitle: "Ryan Yee x 12 Matcha",
    id: 3
  },
  {
    title: "Finalize deliverables with Amanda @ Lulu",
    subtitle: "Michel Faliski x Lululemon",
    id: 4
  },
  {
    title: "Remit payment to Jalen before the EOM",
    subtitle: "Jalen Brooks x Fortnite",
    id: 5
  },
  {
    title: "Get contract countersigned by Harper",
    subtitle: "Harper Singh x Splits59",
    id: 6
  }
];

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['/api/campaigns/recent'],
  });

  const { data: creators } = useQuery({
    queryKey: ['/api/creators'],
  });

  const { data: contacts } = useQuery({
    queryKey: ['/api/contacts'],
  });

  return (
    <div className="flex gap-6">
      {/* Main Content Area */}
      <div className="flex-1">
        {/* Top Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">${((stats as any)?.totalRevenue || 1824325.89).toLocaleString()}</div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="stat-change positive">+12.5% from last month</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-label">Active Creators</div>
                <div className="stat-value">{(creators as any)?.length || 24}</div>
              </div>
              <Users className="h-8 w-8 text-[#ff1578]" />
            </div>
            <div className="stat-change positive">+3 this month</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-label">Total Contacts</div>
                <div className="stat-value">{(contacts as any)?.length || 26847}</div>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="stat-change positive">+1,247 this week</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-label">Active Deals</div>
                <div className="stat-value">42</div>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
            <div className="stat-change positive">+8 pending</div>
          </div>
        </div>

        {/* Revenue and Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="card-clean p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Revenue Growth</h2>
                <p className="text-sm text-gray-500">Monthly revenue trends</p>
              </div>
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">+23.8%</span>
              </div>
            </div>
            <div className="h-48 bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg flex items-end justify-between p-4 space-x-2">
              {[65, 78, 82, 95, 88, 92, 100].map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-green-500 to-green-400 rounded-t w-full opacity-80"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
          </div>

          {/* Campaign Performance */}
          <div className="card-clean p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Campaign Performance</h2>
                <p className="text-sm text-gray-500">Email engagement metrics</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#ff1578] rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Open Rate</span>
                </div>
                <span className="text-sm font-bold">68.4%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#ff1578] h-2 rounded-full" style={{ width: '68.4%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Click Rate</span>
                </div>
                <span className="text-sm font-bold">24.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '24.2%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Response Rate</span>
                </div>
                <span className="text-sm font-bold">12.8%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '12.8%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {isLoadingStats ? (
            <div className="col-span-4 flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-label">Active Campaigns</div>
                    <div className="stat-value">{(stats as any)?.activeCampaigns || 0}</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-[#ff1578]" />
                </div>
                <div className="stat-change positive">+{(stats as any)?.campaignsChange || 0}% from last month</div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-label">Emails Sent</div>
                    <div className="stat-value">{(stats as any)?.emailsSent || 0}</div>
                  </div>
                  <Mail className="h-8 w-8 text-blue-500" />
                </div>
                <div className="stat-change positive">+{(stats as any)?.emailsChange || 0}% from last month</div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-label">Open Rate</div>
                    <div className="stat-value">{(stats as any)?.openRate || 0}%</div>
                  </div>
                  <Eye className="h-8 w-8 text-green-500" />
                </div>
                <div className="stat-change positive">+{(stats as any)?.openRateChange || 0}% from last month</div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-label">Response Rate</div>
                    <div className="stat-value">{(stats as any)?.responseRate || 0}%</div>
                  </div>
                  <MessageSquare className="h-8 w-8 text-purple-500" />
                </div>
                <div className="stat-change positive">+{(stats as any)?.responseRateChange || 0}% from last month</div>
              </div>
            </>
          )}
        </div>

        {/* Enhanced Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Campaigns */}
          <div className="card-clean">
            <div className="p-6 border-b border-gray-200/60">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
                <Link href="/campaigns" className="text-[#ff1578] hover:text-[#e6136b] font-medium text-sm">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Tech Startup Q4</div>
                  <div className="text-sm text-gray-500">24 emails sent</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">Active</div>
                  <div className="text-xs text-gray-500">68% open rate</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Fitness Influencers</div>
                  <div className="text-sm text-gray-500">156 emails sent</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600">Completed</div>
                  <div className="text-xs text-gray-500">72% open rate</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Beauty Brands</div>
                  <div className="text-sm text-gray-500">89 emails sent</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-yellow-600">Paused</div>
                  <div className="text-xs text-gray-500">45% open rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Creators */}
          <div className="card-clean">
            <div className="p-6 border-b border-gray-200/60">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Top Creators</h2>
                <Link href="/creators" className="text-[#ff1578] hover:text-[#e6136b] font-medium text-sm">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="avatar-clean">TB</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Tyler Blanchard</div>
                  <div className="text-sm text-gray-500">Gaming & Tech</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">$45,200</div>
                  <div className="text-xs text-green-600">+12% this month</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="avatar-clean">AP</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Ava Poole</div>
                  <div className="text-sm text-gray-500">Lifestyle & Fashion</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">$38,450</div>
                  <div className="text-xs text-green-600">+8% this month</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="avatar-clean">HS</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Harper Singh</div>
                  <div className="text-sm text-gray-500">Fitness & Health</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">$32,180</div>
                  <div className="text-xs text-green-600">+15% this month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-clean">
            <div className="p-6 border-b border-gray-200/60">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link href="/campaigns" className="btn-pink w-full justify-center">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Link>
              <Link href="/creators" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center">
                <Users className="h-4 w-4 mr-2" />
                Add Creator
              </Link>
              <Link href="/contacts" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center">
                <Activity className="h-4 w-4 mr-2" />
                Import Contacts
              </Link>
              <Link href="/analytics" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Talent Performance Table */}
        <div className="card-clean">
          <div className="p-6 border-b border-gray-200/60">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Talent Performance Overview</h2>
                <p className="text-sm text-gray-500">Comprehensive earnings and deal metrics</p>
              </div>
              <Link href="/creators" className="text-[#ff1578] hover:text-[#e6136b] font-medium text-sm">
                View detailed report
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table-clean">
              <thead>
                <tr>
                  <th>Talent</th>
                  <th>Category</th>
                  <th>Active Deals</th>
                  <th>Total Deal Value</th>
                  <th>Agency Earnings</th>
                  <th>Performance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar-clean">TB</div>
                      <div>
                        <div className="font-medium text-gray-900">Tyler Blanchard</div>
                        <div className="text-xs text-gray-500">2.4M followers</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Gaming</span>
                  </td>
                  <td className="font-medium">8</td>
                  <td className="font-medium">$245,320</td>
                  <td className="font-medium">$24,532</td>
                  <td>
                    <div className="flex items-center">
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+18%</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar-clean">AP</div>
                      <div>
                        <div className="font-medium text-gray-900">Ava Poole</div>
                        <div className="text-xs text-gray-500">1.8M followers</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">Fashion</span>
                  </td>
                  <td className="font-medium">12</td>
                  <td className="font-medium">$198,750</td>
                  <td className="font-medium">$19,875</td>
                  <td>
                    <div className="flex items-center">
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+12%</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar-clean">HS</div>
                      <div>
                        <div className="font-medium text-gray-900">Harper Singh</div>
                        <div className="text-xs text-gray-500">950K followers</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Fitness</span>
                  </td>
                  <td className="font-medium">6</td>
                  <td className="font-medium">$156,890</td>
                  <td className="font-medium">$15,689</td>
                  <td>
                    <div className="flex items-center">
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+9%</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar-clean">SM</div>
                      <div>
                        <div className="font-medium text-gray-900">Sofia Martin</div>
                        <div className="text-xs text-gray-500">1.2M followers</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Tech</span>
                  </td>
                  <td className="font-medium">4</td>
                  <td className="font-medium">$124,450</td>
                  <td className="font-medium">$12,445</td>
                  <td>
                    <div className="flex items-center">
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+15%</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Tasks */}
      <div className="w-80">
        <div className="card-clean p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-4 text-sm">
              <span className="text-gray-900 font-medium border-b-2 border-gray-900 pb-2">Tasks</span>
              <span className="text-gray-500 font-medium pb-2">Upcoming</span>
              <span className="text-gray-500 font-medium pb-2">All</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {sampleTasks.map((task) => (
              <div key={task.id} className="pb-4 border-b border-gray-100 last:border-b-0">
                <h3 className="font-medium text-gray-900 text-sm mb-1">{task.title}</h3>
                <p className="text-xs text-gray-500">{task.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
