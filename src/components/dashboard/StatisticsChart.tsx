import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { fadeInUp, chartLineAnimation, chartBarAnimation } from '@/lib/animations';

// Sample data (will be replaced with real data later)
const weeklyData = [
  { name: 'Mon', tasks: 4, completed: 3 },
  { name: 'Tue', tasks: 6, completed: 4 },
  { name: 'Wed', tasks: 8, completed: 5 },
  { name: 'Thu', tasks: 5, completed: 3 },
  { name: 'Fri', tasks: 7, completed: 7 },
  { name: 'Sat', tasks: 3, completed: 2 },
  { name: 'Sun', tasks: 2, completed: 1 },
];

const monthlyData = [
  { name: 'Week 1', tasks: 18, completed: 14 },
  { name: 'Week 2', tasks: 22, completed: 17 },
  { name: 'Week 3', tasks: 26, completed: 20 },
  { name: 'Week 4', tasks: 24, completed: 21 },
];

interface StatisticsChartProps {
  title: string;
}

const StatisticsChart = ({ title }: StatisticsChartProps) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={() => setChartType('line')}
                variant={chartType === 'line' ? 'default' : 'secondary'}
                size="sm"
              >
                Line
              </Button>
              <Button 
                onClick={() => setChartType('bar')}
                variant={chartType === 'bar' ? 'default' : 'secondary'}
                size="sm"
              >
                Bar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="weekly" className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="tasks" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      animationDuration={1500}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      animationDuration={1500}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="tasks" 
                      fill="#8884d8" 
                      animationDuration={800}
                    />
                    <Bar 
                      dataKey="completed" 
                      fill="#82ca9d" 
                      animationDuration={800}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="monthly" className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="tasks" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      animationDuration={1500}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      animationDuration={1500}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="tasks" 
                      fill="#8884d8" 
                      animationDuration={800}
                    />
                    <Bar 
                      dataKey="completed" 
                      fill="#82ca9d" 
                      animationDuration={800}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatisticsChart;
