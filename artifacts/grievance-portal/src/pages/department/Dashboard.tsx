import React from "react";
import { Link } from "wouter";
import { useListComplaints } from "@workspace/api-client-react";
import { getAuthHeaders, getStatusColor, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ChevronRight, Filter, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DepartmentDashboard() {
  const { data, isLoading } = useListComplaints(undefined, { request: getAuthHeaders() });

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading assigned tasks...</div>;
  }

  const complaints = data?.complaints || [];
  
  const pendingCount = complaints.filter(c => c.status === 'Pending' || c.status === 'In Review').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-primary/5 p-6 rounded-2xl border border-primary/10">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Department Tasks</h2>
          <p className="text-muted-foreground mt-1">Manage and resolve complaints assigned to your department.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border font-medium flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          {pendingCount} Action Required
        </div>
      </div>

      <Card className="shadow-lg border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-wrap gap-4 items-center justify-between">
          <h3 className="font-semibold text-lg ml-2">Assigned Queue</h3>
        </div>
        
        <div className="divide-y divide-border/50">
          {complaints.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <p className="text-lg font-medium text-foreground mb-1">Queue is empty</p>
              <p>No complaints are currently assigned to your department.</p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <Link 
                key={complaint.id} 
                href={`/department/complaint/${complaint.id}`}
                className="block hover:bg-muted/30 transition-colors group"
              >
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                        #{complaint.id}
                      </span>
                      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", getStatusColor(complaint.status))}>
                        {complaint.status}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {complaint.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs font-medium">
                        {complaint.category}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        {complaint.studentName}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3">
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
                    </span>
                    <div className="flex items-center text-sm font-semibold text-primary group-hover:underline">
                      Review <ChevronRight className="w-4 h-4 ml-1 translate-y-[1px] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
