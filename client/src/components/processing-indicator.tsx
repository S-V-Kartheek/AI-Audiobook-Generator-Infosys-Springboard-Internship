import { FileText, Wand2, Volume2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ProcessingJob } from "@shared/schema";

interface ProcessingIndicatorProps {
  status: ProcessingJob['status'];
  progress: number;
}

export function ProcessingIndicator({ status, progress }: ProcessingIndicatorProps) {
  const steps = [
    {
      key: 'extracting',
      icon: FileText,
      label: 'Extracting text',
      description: 'Reading your document...',
    },
    {
      key: 'rewriting',
      icon: Wand2,
      label: 'Rewriting with AI',
      description: 'Creating engaging podcast narration...',
    },
    {
      key: 'generating_audio',
      icon: Volume2,
      label: 'Generating audio',
      description: 'Converting to speech...',
    },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === status);

  return (
    <Card className="p-8" data-testid="card-processing">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            Processing your document
          </h2>
          <p className="text-sm text-muted-foreground">
            This may take a few minutes depending on document length
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-4 p-4 rounded-md transition-all ${
                  isActive
                    ? "bg-accent/50"
                    : isCompleted
                    ? "bg-muted/30"
                    : "opacity-50"
                }`}
                data-testid={`step-${step.key}`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {isActive && (
                  <div className="flex-shrink-0">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Progress value={progress} className="h-2" data-testid="progress-bar" />
      </div>
    </Card>
  );
}
