import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/Layout";
import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// Dashboards
import StudentDashboard from "@/pages/student/Dashboard";
import NewComplaint from "@/pages/student/NewComplaint";
import AdminDashboard from "@/pages/admin/Dashboard";
import DepartmentDashboard from "@/pages/department/Dashboard";

// Shared detail view
import ComplaintDetail from "@/pages/shared/ComplaintDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/student/login">
        {() => <Login role="student" />}
      </Route>
      <Route path="/admin/login">
        {() => <Login role="admin" />}
      </Route>
      <Route path="/department/login">
        {() => <Login role="department" />}
      </Route>
      <Route path="/student/register" component={Register} />

      {/* Protected Routes inside Layout */}
      <Route path="/student/dashboard">
        {() => <Layout><StudentDashboard /></Layout>}
      </Route>
      <Route path="/student/complaint/new">
        {() => <Layout><NewComplaint /></Layout>}
      </Route>
      <Route path="/student/complaint/:id">
        {() => <Layout><ComplaintDetail /></Layout>}
      </Route>
      
      <Route path="/admin/dashboard">
        {() => <Layout><AdminDashboard /></Layout>}
      </Route>
      <Route path="/admin/complaint/:id">
        {() => <Layout><ComplaintDetail /></Layout>}
      </Route>

      <Route path="/department/dashboard">
        {() => <Layout><DepartmentDashboard /></Layout>}
      </Route>
      <Route path="/department/complaint/:id">
        {() => <Layout><ComplaintDetail /></Layout>}
      </Route>

      <Route>
        {() => <Layout><NotFound /></Layout>}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
