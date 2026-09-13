"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

type AvailabilitySlot = {
  id?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export default function TutorAvailabilityPage() {
  const router = useRouter();
  const supabase = createClient();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const { data } = await supabase
      .from("tutor_availability")
      .select("*")
      .eq("tutorId", user.id);

    if (data) {
      setSlots(data);
    }
  };

  const addSlot = () => {
    setSlots([...slots, { dayOfWeek: 1, startTime: "09:00", endTime: "10:00" }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Delete existing slots
      await supabase.from("tutor_availability").delete().eq("tutorId", user.id);

      // Insert new slots
      if (slots.length > 0) {
        await supabase.from("tutor_availability").insert(
          slots.map((slot) => ({
            tutorId: user.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }))
        );
      }

      alert("Availability saved successfully!");
    } catch (error) {
      console.error("Error saving availability:", error);
      alert("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-extrabold text-primary-900">
            Manage Availability
          </h1>
          <p className="text-muted-foreground">
            Set your available time slots for tutoring sessions
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-heading font-bold text-primary-900">
              Time Slots
            </h2>
            <Button onClick={addSlot} variant="secondary" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Slot
            </Button>
          </div>

          {slots.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No availability slots set. Click "Add Slot" to add one.
            </p>
          ) : (
            <div className="space-y-4">
              {slots.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border-2 border-slate-100 rounded-xl"
                >
                  <select
                    value={slot.dayOfWeek}
                    onChange={(e) => updateSlot(index, "dayOfWeek", parseInt(e.target.value))}
                    className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  >
                    {DAYS.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                    className="px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />

                  <span className="text-muted-foreground">to</span>

                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                    className="px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSlot(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="secondary"
            className="flex items-center gap-2 px-8"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Availability"}
          </Button>
        </div>
      </div>
    </div>
  );
}
