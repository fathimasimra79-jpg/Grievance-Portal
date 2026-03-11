import React from "react";
import { Link } from "wouter";
import { GraduationCap, ShieldCheck, Building2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent -z-10" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-accent blur-3xl -z-10" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-xl font-display font-bold text-foreground">UnivGrievance</span>
        </div>
        <div className="hidden sm:flex gap-4">
          <Link href="/student/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
            Student Login
          </Link>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/student/register">Register</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 pt-12 lg:pt-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-primary text-sm font-medium border border-primary/10 mb-4 animate-in slide-in-from-bottom-4 fade-in duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Transparent Campus Resolution
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-extrabold text-foreground tracking-tight leading-[1.1] animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
            University <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Grievance</span> Portal
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
            Submit, track, and resolve student grievances related to academics, facilities, and campus services in real-time. A unified platform for a better campus experience.
          </p>

          {/* Hero Image - AI Generated */}
          <div className="w-full max-w-4xl mx-auto mt-12 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 relative animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-300">
            <img 
              src={`${import.meta.env.BASE_URL}images/hero-campus.png`} 
              alt="Modern University Campus Illustration" 
              className="w-full h-auto aspect-video object-cover hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </div>
        </div>

        {/* Role Cards Grid */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pb-24 z-10">
          
          {/* Student Card */}
          <Card className="group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>
              <CardTitle>For Students</CardTitle>
              <CardDescription className="text-base mt-2">
                Submit grievances, track complaint status in real-time, and receive updates from departments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full group-hover:bg-blue-600 mt-4" size="lg">
                <Link href="/student/login">
                  Student Login <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card className="group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-indigo-500/20 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <CardTitle>For Administrators</CardTitle>
              <CardDescription className="text-base mt-2">
                Manage complaints, assign to departments, monitor progress, and view resolution analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 mt-4" size="lg">
                <Link href="/admin/login">
                  Admin Login <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Department Card */}
          <Card className="group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-emerald-500/20 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <CardTitle>For Departments</CardTitle>
              <CardDescription className="text-base mt-2">
                View assigned complaints, update status, provide resolutions, and communicate directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 mt-4" size="lg">
                <Link href="/department/login">
                  Department Login <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
