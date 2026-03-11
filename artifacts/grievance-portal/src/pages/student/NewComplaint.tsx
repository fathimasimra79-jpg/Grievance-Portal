import React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, AlertCircle, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateComplaint, CreateComplaintRequestCategory } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.nativeEnum(CreateComplaintRequestCategory, { errorMap: () => ({ message: "Please select a category" }) }),
  description: z.string().min(20, "Please provide more details (at least 20 characters)"),
});

export default function NewComplaint() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const mutation = useCreateComplaint({
    request: getAuthHeaders(),
    mutation: {
      onSuccess: () => {
        toast({ title: "Success", description: "Complaint submitted successfully." });
        setLocation("/student/dashboard");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to submit complaint.", variant: "destructive" });
      }
    }
  });

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    mutation.mutate({ data });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/student/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <Card className="shadow-xl border-t-4 border-t-primary">
        <CardHeader className="pb-6 border-b border-border/50">
          <CardTitle className="text-3xl">Submit New Grievance</CardTitle>
          <CardDescription className="text-base mt-2">
            Please provide clear and accurate details so we can process your request efficiently.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Complaint Title <span className="text-destructive">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="Brief summary of the issue" 
                  {...register("title")}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-xs text-destructive font-medium">{errors.title.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <select 
                    id="category"
                    {...register("category")}
                    className={`flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all appearance-none cursor-pointer ${errors.category ? "border-destructive" : ""}`}
                  >
                    <option value="" disabled selected>Select the relevant category</option>
                    {Object.values(CreateComplaintRequestCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                {errors.category && <p className="text-xs text-destructive font-medium">{errors.category.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Detailed Description <span className="text-destructive">*</span></Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the issue in detail. Include dates, locations, or names if relevant." 
                  className={`min-h-[160px] ${errors.description ? "border-destructive" : ""}`}
                  {...register("description")}
                />
                {errors.description && <p className="text-xs text-destructive font-medium">{errors.description.message}</p>}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Before you submit</p>
                <p>Ensure all information is factual. False complaints may lead to disciplinary action. You will be notified when an administrator reviews this.</p>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
              <Button type="button" variant="ghost" onClick={() => setLocation("/student/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={mutation.isPending}>
                {mutation.isPending ? "Submitting..." : (
                  <>Submit Complaint <Send className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
