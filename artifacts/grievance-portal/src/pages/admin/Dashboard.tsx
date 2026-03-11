import React from "react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Cell as PieCell, Legend } from "recharts";
import { useGetAnalytics, useListComplaints } from "@workspace/api-client-react";
import { getAuthHeaders, getStatusColor, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const PIE_COLORS = ['#fbbf24', '#60a5fa', '#f97316', '#34d399']; // Pending, Review, Progress, Resolved

export default function AdminDashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useGetAnalytics({ request: getAuthHeaders() });
  const { data: listData, isLoading: listLoading } = useListComplaints(undefined, { request: getAuthHeaders() });

  if (analyticsLoading || listLoading) {
    return <div className="p-8 text-center animate-pulse">Loading dashboard data...</div>;
  }

  const complaints = listData?.complaints || [];
  
  const pieData = analytics ? [
    { name: 'Pending', value: analytics.pendingCount },
    { name: 'In Review', value: analytics.inReviewCount },
    { name: 'In Progress', value: analytics.inProgressCount },
    { name: 'Resolved', value: analytics.resolvedCount },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-muted-foreground mt-1">System-wide complaint analytics and management.</p>
      </div>

      {/* Stats Row */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-primary text-primary-foreground border-none shadow-md">
            <CardContent className="p-4">
              <p className="text-primary-foreground/80 text-xs font-medium uppercase tracking-wider mb-1">Total</p>
              <p className="text-3xl font-bold">{analytics.totalComplaints}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-100 text-yellow-900 border-none shadow-md">
            <CardContent className="p-4">
              <p className="text-yellow-800/80 text-xs font-medium uppercase tracking-wider mb-1">Pending</p>
              <p className="text-3xl font-bold">{analytics.pendingCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-100 text-blue-900 border-none shadow-md">
            <CardContent className="p-4">
              <p className="text-blue-800/80 text-xs font-medium uppercase tracking-wider mb-1">In Review</p>
              <p className="text-3xl font-bold">{analytics.inReviewCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-100 text-orange-900 border-none shadow-md">
            <CardContent className="p-4">
              <p className="text-orange-800/80 text-xs font-medium uppercase tracking-wider mb-1">In Progress</p>
              <p className="text-3xl font-bold">{analytics.inProgressCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-100 text-emerald-900 border-none shadow-md">
            <CardContent className="p-4">
              <p className="text-emerald-800/80 text-xs font-medium uppercase tracking-wider mb-1">Resolved</p>
              <p className="text-3xl font-bold">{analytics.resolvedCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader className="pb-2 border-b mb-4">
              <CardTitle className="text-lg">Complaints by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.byCategory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-2 border-b mb-4">
              <CardTitle className="text-lg">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <PieCell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full List */}
      <Card className="shadow-lg border-border/50">
        <div className="p-6 border-b border-border/50 bg-muted/20 flex justify-between items-center">
          <h3 className="font-semibold text-lg">All Complaints</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">ID & Student</th>
                <th className="px-6 py-4 font-semibold">Title & Category</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {complaints.map((c) => (
                <tr key={c.id} className="bg-card hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">#{c.id}</div>
                    <div className="text-muted-foreground truncate max-w-[120px]">{c.studentName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground truncate max-w-[200px]">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    {c.department ? (
                      <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium">
                        {c.department}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap border", getStatusColor(c.status))}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/complaint/${c.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No complaints found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
