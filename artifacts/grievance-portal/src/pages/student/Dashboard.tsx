import React from "react";
import { Link } from "wouter";
import { FileText, Plus, Clock, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";
import { useListComplaints } from "@workspace/api-client-react";
import { getAuthHeaders, getStatusColor, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export default function StudentDashboard() {
  const { data, isLoading } = useListComplaints(undefined, { request: getAuthHeaders() });

  const complaints = data?.complaints || [];
  
  const stats = {
    total: complaints.length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    active: complaints.filter(c => c.status !== 'Resolved').length
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-2xl"></div>
        <div className="h-96 bg-muted rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">My Complaints</h2>
          <p className="text-muted-foreground mt-1">Track the status of your submitted grievances.</p>
        </div>
        <Button asChild size="lg" className="rounded-full shadow-lg">
          <Link href="/student/complaint/new">
            <Plus className="w-5 h-5 mr-2" /> New Complaint
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary to-indigo-500 text-white border-none shadow-lg shadow-primary/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 font-medium text-sm">Total Submitted</p>
              <p className="text-4xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground font-medium text-sm">Active & Pending</p>
              <p className="text-4xl font-bold mt-2 text-foreground">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground font-medium text-sm">Resolved</p>
              <p className="text-4xl font-bold mt-2 text-foreground">{stats.resolved}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card className="shadow-lg border-border/50">
        <div className="p-6 border-b border-border/50 bg-muted/20">
          <h3 className="font-semibold text-lg">Recent Complaints</h3>
        </div>
        <div className="divide-y divide-border/50">
          {complaints.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No complaints found</h3>
              <p className="max-w-sm mt-2">You haven't submitted any grievances yet. If you face any issues, feel free to report them.</p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/student/complaint/new">Submit First Complaint</Link>
              </Button>
            </div>
          ) : (
            complaints.map((complaint) => (
              <Link 
                key={complaint.id} 
                href={`/student/complaint/${complaint.id}`}
                className="block p-6 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border", getStatusColor(complaint.status))}>
                        {complaint.status}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                        {complaint.category}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {complaint.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-1 max-w-2xl">
                      {complaint.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Clock className="w-4 h-4 mr-1 opacity-70" />
                      {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <ChevronRight className="w-5 h-5" />
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
