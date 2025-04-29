
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, Brain, Clock, CalendarCheck } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Manage Tasks with <span className="bg-clip-text text-transparent gradient-bg">AI-Powered</span> Efficiency
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            SmartTasker helps you organize, prioritize, and complete your tasks with intelligent assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gradient-bg hover:opacity-90 transition-opacity">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/dashboard">View Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose SmartTasker?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-driven task manager helps you stay organized and focused on what matters most.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <Brain className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">AI Task Prioritization</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your tasks and helps you focus on what's most important.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <Clock className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Smart Reminders</h3>
              <p className="text-muted-foreground">
                Never miss a deadline with intelligent reminders that adapt to your schedule.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <CalendarCheck className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Seamless Planning</h3>
              <p className="text-muted-foreground">
                Organize your day, week, and month with our intuitive planning tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who have transformed their productivity with SmartTasker.
          </p>
          <Button asChild size="lg" className="gradient-bg hover:opacity-90 transition-opacity">
            <Link to="/auth">Sign Up Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center">
                <span className="font-bold text-white">ST</span>
              </div>
              <h2 className="ml-2 text-xl font-bold">SmartTasker</h2>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SmartTasker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
