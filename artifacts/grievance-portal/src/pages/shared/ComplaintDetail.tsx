import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Clock, User, Building2, MessageSquare, Send, CheckCircle2, AlertTriangle, Star } from "lucide-react";
import { 
  useGetComplaint, 
  useUpdateComplaint, 
  useAddComplaintResponse, 
  useSubmitFeedback,
  UpdateComplaintRequestStatus,
  UpdateComplaintRequestDepartment,
  getGetComplaintQueryKey
} from "@workspace/api-client-react";
import { getAuthHeaders, getStatusColor, cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ComplaintDetail() {
  const { id } = useParams();
  const complaintId = parseInt(id || "0", 10);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [responseMsg, setResponseMsg] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");

  const { data: complaint, isLoading, error } = useGetComplaint(complaintId, { 
    request: getAuthHeaders(),
    query: { enabled: !!complaintId } 
  });

  const updateMutation = useUpdateComplaint({
    request: getAuthHeaders(),
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetComplaintQueryKey(complaintId) });
        toast({ title: "Updated successfully" });
      }
    }
  });

  const responseMutation = useAddComplaintResponse({
    request: getAuthHeaders(),
    mutation: {
      onSuccess: () => {
        setResponseMsg("");
        queryClient.invalidateQueries({ queryKey: getGetComplaintQueryKey(complaintId) });
        toast({ title: "Response added" });
      }
    }
  });

  const feedbackMutation = useSubmitFeedback({
    request: getAuthHeaders(),
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetComplaintQueryKey(complaintId) });
        toast({ title: "Feedback submitted. Thank you!" });
      }
    }
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading details...</div>;
  if (error || !complaint) return <div className="p-8 text-center text-destructive">Failed to load complaint.</div>;

  const handleUpdateStatus = (status: UpdateComplaintRequestStatus) => {
    updateMutation.mutate({ id: complaintId, data: { status } });
  };

  const handleAssignDept = (department: UpdateComplaintRequestDepartment) => {
    updateMutation.mutate({ id: complaintId, data: { department } });
  };

  const handleAddResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseMsg.trim()) return;
    responseMutation.mutate({ id: complaintId, data: { message: responseMsg } });
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackRating === 0) return toast({ title: "Select a rating", variant: "destructive" });
    feedbackMutation.mutate({ id: complaintId, data: { rating: feedbackRating, comment: feedbackComment } });
  };

  const backLink = user?.role === 'student' ? '/student/dashboard' : 
                   user?.role === 'admin' ? '/admin/dashboard' : '/department/dashboard';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Link href={backLink} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      {/* Header Card */}
      <Card className="shadow-lg border-t-4 border-t-primary overflow-hidden">
        <div className="bg-muted/30 p-6 border-b flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border", getStatusColor(complaint.status))}>
                {complaint.status}
              </span>
              <span className="text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full border">
                {complaint.category}
              </span>
              <span className="text-xs font-medium text-muted-foreground flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {new Date(complaint.createdAt).toLocaleString()}
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">{complaint.title}</h1>
          </div>

          {/* Admin Controls */}
          {user?.role === 'admin' && (
            <div className="flex flex-col gap-2 min-w-[200px] bg-background p-3 rounded-xl border shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Admin Controls</p>
              <select 
                className="text-sm rounded-md border p-2 focus:ring-2 focus:ring-primary/20 outline-none"
                value={complaint.department || ""}
                onChange={(e) => handleAssignDept(e.target.value as UpdateComplaintRequestDepartment)}
                disabled={updateMutation.isPending}
              >
                <option value="">Unassigned Dept.</option>
                {Object.values(UpdateComplaintRequestDepartment).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select 
                className="text-sm rounded-md border p-2 focus:ring-2 focus:ring-primary/20 outline-none"
                value={complaint.status}
                onChange={(e) => handleUpdateStatus(e.target.value as UpdateComplaintRequestStatus)}
                disabled={updateMutation.isPending}
              >
                {Object.values(UpdateComplaintRequestStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Department Controls */}
          {user?.role === 'department' && (
            <div className="flex flex-col gap-2 min-w-[200px] bg-background p-3 rounded-xl border shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Update Status</p>
              <select 
                className="text-sm rounded-md border p-2 focus:ring-2 focus:ring-primary/20 outline-none"
                value={complaint.status}
                onChange={(e) => handleUpdateStatus(e.target.value as UpdateComplaintRequestStatus)}
                disabled={updateMutation.isPending}
              >
                {Object.values(UpdateComplaintRequestStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <CardContent className="p-6 md:p-8">
          <div className="prose prose-slate max-w-none text-foreground/80">
            <p className="whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submitted by</p>
                <p className="font-semibold">{complaint.studentName || "Student"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", complaint.department ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400")}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Assigned Department</p>
                <p className="font-semibold">{complaint.department || "Not Assigned Yet"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responses Section */}
      <h3 className="font-display font-bold text-xl mt-8 mb-4 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-primary" /> Timeline & Updates
      </h3>

      <div className="space-y-4">
        {complaint.responses?.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-2xl border border-dashed border-border/60 text-muted-foreground">
            No updates yet.
          </div>
        ) : (
          complaint.responses?.map((res) => (
            <Card key={res.id} className="border-border/50 shadow-sm bg-card/50">
              <div className="p-4 border-b border-border/30 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                    {res.staffName?.[0] || "S"}
                  </div>
                  <span className="font-semibold text-sm">{res.staffName || "Staff"}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border">Department</span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(res.createdAt).toLocaleString()}</span>
              </div>
              <div className="p-4 text-sm text-foreground/90 whitespace-pre-wrap">
                {res.message}
              </div>
            </Card>
          ))
        )}

        {/* Add Response Form (Admin/Dept only) */}
        {(user?.role === 'admin' || user?.role === 'department') && complaint.status !== 'Resolved' && (
          <Card className="mt-6 border-primary/20 shadow-md">
            <form onSubmit={handleAddResponse} className="p-4">
              <Textarea 
                placeholder="Type your official response/update here..."
                className="min-h-[100px] mb-3 bg-muted/30 border-primary/20 focus-visible:ring-primary/20"
                value={responseMsg}
                onChange={(e) => setResponseMsg(e.target.value)}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={responseMutation.isPending || !responseMsg.trim()}>
                  {responseMutation.isPending ? "Posting..." : "Post Update"} <Send className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      {/* Feedback Section (Student only, when resolved) */}
      {complaint.status === 'Resolved' && user?.role === 'student' && (
        <Card className="mt-8 border-emerald-200 bg-emerald-50/30 overflow-hidden shadow-lg">
          <div className="bg-emerald-500 text-white p-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-semibold">Resolution Feedback</h3>
          </div>
          <CardContent className="p-6">
            {complaint.feedback ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Your Rating</p>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={cn("w-6 h-6", star <= complaint.feedback!.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
                  ))}
                </div>
                {complaint.feedback.comment && (
                  <>
                    <p className="text-sm font-medium text-muted-foreground">Your Comment</p>
                    <p className="text-sm bg-white p-4 rounded-xl border">{complaint.feedback.comment}</p>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">How satisfied are you with the resolution?</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        type="button" 
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star className={cn("w-8 h-8", star <= feedbackRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200")} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Comments (Optional)</label>
                  <Textarea 
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="bg-white"
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto" disabled={feedbackMutation.isPending}>
                  Submit Feedback
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin view feedback read-only */}
      {complaint.status === 'Resolved' && complaint.feedback && user?.role !== 'student' && (
        <Card className="mt-8 border-emerald-200 bg-emerald-50/30">
          <div className="p-4 border-b border-emerald-200/50 bg-emerald-100/50">
            <h3 className="font-semibold text-emerald-800 flex items-center"><Star className="w-4 h-4 mr-2 fill-emerald-600 text-emerald-600" /> Student Feedback</h3>
          </div>
          <CardContent className="p-6">
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={cn("w-5 h-5", star <= complaint.feedback!.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
              ))}
            </div>
            {complaint.feedback.comment && (
              <p className="text-sm italic text-muted-foreground border-l-2 border-emerald-300 pl-3">"{complaint.feedback.comment}"</p>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
