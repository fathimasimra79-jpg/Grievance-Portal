import React from "react";
import { Link } from "wouter";
import { useListComplaints } from "@workspace/api-client-react";
import { getAuthHeaders, getStatusColor, cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { ChevronRight, Building2, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DepartmentDashboard() {
  const { user } = useAuth();
  const department = (user as any)?.department as string | undefined;

  const { data, isLoading } = useListComplaints(undefined, { request: getAuthHeaders() });

  if (isLoading) {
    return (
      <div className="p-8 text-center flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading assigned complaints...
      </div>
    );
  }

  const complaints = data?.complaints || [];

  const pending    = complaints.filter(c => c.status === "Pending").length;
  const inReview   = complaints.filter(c => c.status === "In Review").length;
  const inProgress = complaints.filter(c => c.status === "In Progress").length;
  const resolved   = complaints.filter(c => c.status === "Resolved").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-primary/5 p-6 rounded-2xl border border-primary/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground">
              {department ? `${department} Department` : "Department Tasks"}
            </h2>
            <p className="text-muted-foreground mt-0.5">
              Complaints assigned specifically to your department
            </p>
          </div>
        </div>
        {(pending + inReview) > 0 && (
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border font-medium flex items-center gap-2 text-amber-600 border-amber-200">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
            {pending + inReview} Action Required
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending",     count: pending,    icon: Clock,         color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
          { label: "In Review",   count: inReview,   icon: AlertCircle,   color: "text-blue-600 bg-blue-50 border-blue-200" },
          { label: "In Progress", count: inProgress, icon: Loader2,       color: "text-orange-600 bg-orange-50 border-orange-200" },
          { label: "Resolved",    count: resolved,   icon: CheckCircle2,  color: "text-green-600 bg-green-50 border-green-200" },
        ].map(({ label, count, icon: Icon, color }) => (
          <Card key={label} className={cn("p-4 border flex items-center gap-3", color)}>
            <Icon className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs font-medium">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Complaint List */}
      <Card className="shadow-lg border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <h3 className="font-semibold text-lg ml-2">
            {department ? `Complaints — ${department}` : "Assigned Queue"}
          </h3>
          <span className="text-sm text-muted-foreground">{complaints.length} total</span>
        </div>

        <div className="divide-y divide-border/50">
          {complaints.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium text-foreground mb-1">No complaints assigned</p>
              <p>
                {department
                  ? `No complaints have been assigned to the ${department} department yet.`
                  : "No complaints are currently assigned to your department."}
              </p>
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
