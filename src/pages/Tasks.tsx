import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, AlertCircle } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import RecurringTaskGenerator from "@/components/RecurringTaskGenerator";

const Tasks = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <Button className="gradient-bg hover:opacity-90 transition-opacity">
          <PlusCircle className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Connect your Supabase account to start managing tasks.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No tasks for today</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Connect your Supabase account to start managing tasks.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No upcoming tasks</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Connect your Supabase account to start managing tasks.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No completed tasks</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Connect your Supabase account to start managing tasks.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium text-lg mb-4">Recurring Task Configurations</h3>
                <Table>
                  <TableCaption>Your recurring task configurations</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Next</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                          <p>No recurring tasks configured yet</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <RecurringTaskGenerator />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
