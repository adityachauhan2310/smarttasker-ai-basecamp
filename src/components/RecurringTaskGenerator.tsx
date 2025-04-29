
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; // Updated import path
import { Loader2 } from "lucide-react";

export default function RecurringTaskGenerator() {
  const [loading, setLoading] = useState(false);
  const [lookAhead, setLookAhead] = useState(30); // Default to 30 days

  const generateTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recurring-tasks', {
        body: { lookAhead },
      });

      if (error) throw error;

      toast.success(
        `Successfully processed recurring tasks: ${data?.processed || 0} configs, ${
          data?.results?.reduce((sum, r) => sum + (r.tasksCreated || 0), 0) || 0
        } tasks created`
      );
      
      console.log('Generation results:', data);
    } catch (error) {
      console.error('Error generating recurring tasks:', error);
      toast.error('Failed to generate recurring tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Recurring Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lookAhead">Look Ahead Days</Label>
          <Input
            id="lookAhead"
            type="number"
            min="1"
            max="365"
            value={lookAhead}
            onChange={(e) => setLookAhead(parseInt(e.target.value) || 30)}
          />
          <p className="text-sm text-muted-foreground">
            Number of days into the future to generate tasks
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateTasks} 
          disabled={loading}
          className="gradient-bg hover:opacity-90 transition-opacity"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Generating...' : 'Generate Tasks'}
        </Button>
      </CardFooter>
    </Card>
  );
}
