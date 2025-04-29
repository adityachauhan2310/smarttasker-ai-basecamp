
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProfileCardProps {
  name: string;
  role: string;
  avatarUrl?: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  taskCount: number;
}

const statusColorMap = {
  online: "bg-green-500",
  busy: "bg-red-500",
  away: "bg-amber-500",
  offline: "bg-gray-500"
};

const ProfileCard = ({ name, role, avatarUrl, status, taskCount }: ProfileCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="relative inline-block">
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="text-lg">{getInitials(name)}</AvatarFallback>
            </Avatar>
            <span 
              className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background ${statusColorMap[status]}`} 
              title={`Status: ${status}`}
            />
          </div>
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground">{role}</p>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary">
                {taskCount} active tasks
              </Badge>
              <Badge 
                variant="outline" 
                className={`${status === 'online' ? 'text-green-500 border-green-500' : 
                            status === 'busy' ? 'text-red-500 border-red-500' : 
                            status === 'away' ? 'text-amber-500 border-amber-500' : 
                            'text-gray-500 border-gray-500'}`}
              >
                {status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileCard;
