"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export function CompleteSessionForm({ sessionId }: { sessionId: number }) {
  const handleComplete = async () => {
    if (!confirm("Are you sure you want to mark this session as completed?")) {
      return;
    }

    const formData = new FormData();
    formData.append("sessionId", sessionId.toString());
    formData.append("status", "completed");

    const response = await fetch("/api/tutor/session-status", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      window.location.reload();
    } else {
      alert("Failed to complete session");
    }
  };

  return (
    <form action={handleComplete}>
      <Button
        type="submit"
        size="sm"
        variant="secondary"
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        Complete
      </Button>
    </form>
  );
}
