import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, Brain, Clock, CalendarCheck } from "lucide-react";
import { t } from "@/lib/i18n";
import { useEffect, useState } from "react";

const Index = () => {
  const [, forceUpdate] = useState({});
  
  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force re-render to update translations
      forceUpdate({});
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);
  
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            {t("manageTasksWithAI")}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            {t("appName")} {t("helpsYouOrganize")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">{t("getStarted")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/dashboard">{t("viewDemo")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t("whyChooseSmartTasker")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("aiDrivenTaskManager")}
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
          <h2 className="text-3xl font-bold mb-6">{t("readyToGetStarted")}</h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t("joinThousandsOfUsers")}
          </p>
          <Button asChild size="lg">
            <Link to="/auth">{t("signUpNow")}</Link>
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
              <h2 className="ml-2 text-xl font-bold">{t("appName")}</h2>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground">{t("terms")}</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">{t("privacy")}</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">{t("contact")}</a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {t("appName")}. {t("allRightsReserved")}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
