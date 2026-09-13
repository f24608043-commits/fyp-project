"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export function ConfirmSessionForm({ sessionId }: { sessionId: number }) {
  const handleConfirm = async () => {
    const formData = new FormData();
    formData.append("sessionId", sessionId.toString());
    formData.append("status", "confirmed");

    const response = await fetch("/api/tutor/session-status", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      window.location.reload();
    } else {
      alert("Failed to confirm session");
    }
  };

  return (
    <form action={handleConfirm}>
      <Button
        type="submit"
        size="sm"
        className="bg-green-500 hover:bg-green-600 text-white"
      >
        <Check className="w-4 h-4 mr-1" />
        Confirm
      </Button>
    </form>
  );
}

export function DeclineSessionForm({ sessionId }: { sessionId: number }) {
  const handleDecline = async () => {
    if (!confirm("Are you sure you want to decline this session request?")) {
      return;
    }

    const formData = new FormData();
    formData.append("sessionId", sessionId.toString());
    formData.append("status", "cancelled");

    const response = await fetch("/api/tutor/session-status", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      window.location.reload();
    } else {
      alert("Failed to decline session");
    }
  };

  return (
    <form action={handleDecline}>
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        className="text-red-500 hover:bg-red-50"
      >
        <X className="w-4 h-4 mr-1" />
        Decline
      </Button>
    </form>
  );
}
