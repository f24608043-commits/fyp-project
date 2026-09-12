import { Mascot, MascotThinking } from "@/components/mascot";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "thinking";
}

export const EmptyState = ({
  title,
  message,
  actionLabel,
  onAction,
  variant = "default",
}: EmptyStateProps) => {
  const MascotComponent = variant === "thinking" ? MascotThinking : Mascot;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
      <MascotComponent size={160} className="animate-bounce" />
      
      <div className="space-y-2 max-w-md">
        <h3 className="text-2xl font-heading font-bold text-primary-900">
          {title}
        </h3>
        <p className="text-muted-foreground font-body">
          {message}
        </p>
      </div>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-primary-500 hover:bg-primary-600 text-white font-heading font-bold px-8 py-4 rounded-2xl"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
