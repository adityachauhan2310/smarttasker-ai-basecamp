import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Copy, ThumbsUp, ThumbsDown, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChatMessage as ChatMessageType, MessageReaction } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  onReaction?: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
}

const QUICK_REACTIONS = ['👍', '👎', '❤️', '😄', '🎉', '🤔'];

export function ChatMessage({ message, onReaction, onRemoveReaction }: ChatMessageProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasReaction = (emoji: string) => {
    return message.reactions?.some(r => r.emoji === emoji && r.users.includes('current-user'));
  };

  const handleReaction = (emoji: string) => {
    if (hasReaction(emoji)) {
      onRemoveReaction?.(emoji);
    } else {
      onReaction?.(emoji);
    }
  };

  return (
    <motion.div
      className={cn(
        'group flex gap-2 items-start',
        message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Avatar for AI messages */}
      {message.type === 'ai' && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
          AI
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-[80%]">
        {/* Message content */}
        <div
          className={cn(
            'relative rounded-lg p-3',
            message.type === 'user'
              ? 'bg-primary text-primary-foreground'
              : message.type === 'system'
              ? 'bg-muted text-muted-foreground'
              : 'bg-card'
          )}
        >
          {message.content}

          {/* Message actions */}
          <div className={cn(
            'absolute -right-12 top-1/2 -translate-y-1/2 flex items-center gap-1',
            message.type === 'user' ? 'right-auto -left-12' : '-right-12',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowReactions(!showReactions)}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add reaction</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {copied ? 'Copied!' : 'Copy message'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            'text-xs text-muted-foreground',
            message.type === 'user' ? 'text-right' : 'text-left'
          )}
        >
          {format(new Date(message.timestamp), 'HH:mm')}
          {!message.isRead && message.type === 'ai' && (
            <span className="ml-1 text-primary">•</span>
          )}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={cn(
              'flex flex-wrap gap-1',
              message.type === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.reactions.map((reaction) => (
              <Button
                key={reaction.emoji}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleReaction(reaction.emoji)}
              >
                {reaction.emoji} {reaction.count}
              </Button>
            ))}
          </div>
        )}

        {/* Quick reactions popup */}
        {showReactions && (
          <motion.div
            className={cn(
              'absolute z-10 flex gap-1 p-1 rounded-full bg-popover border shadow-md',
              message.type === 'user' ? '-left-2' : '-right-2'
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {QUICK_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 w-8 p-0',
                  hasReaction(emoji) && 'bg-accent'
                )}
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 