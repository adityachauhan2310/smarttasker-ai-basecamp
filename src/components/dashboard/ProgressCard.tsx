
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressCardProps {
  title: string;
  value: number;
  maxValue: number;
  category: string;
  color?: string;
}

const ProgressCard = ({ title, value, maxValue, category, color = "bg-primary" }: ProgressCardProps) => {
  const [progress, setProgress] = useState(0);
  const percentage = Math.round((value / maxValue) * 100);
  
  useEffect(() => {
    // Animate progress from 0 to actual value
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">{category}</span>
            <span className="font-medium">{value}/{maxValue}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="mt-2 text-right">
            <span className={`text-sm font-medium ${
              percentage < 30 ? "text-red-500" : 
              percentage < 70 ? "text-amber-500" : 
              "text-green-500"
            }`}>
              {percentage}%
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProgressCard;
