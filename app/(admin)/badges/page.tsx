"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Award } from "lucide-react";

type Badge = {
  id?: number;
  name: string;
  description: string;
  iconUrl: string;
  criteria: any;
};

type CriteriaType = "lessons_completed" | "streak_days" | "points_earned" | "custom";

export default function AdminBadgesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [saving, setSaving] = useState(false);
  const [criteriaType, setCriteriaType] = useState<CriteriaType>("custom");

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const { data } = await supabase.from("badges").select("*");
    if (data) {
      setBadges(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingBadge) return;
    setSaving(true);

    try {
      if (editingBadge.id) {
        await supabase
          .from("badges")
          .update({
            name: editingBadge.name,
            description: editingBadge.description,
            iconUrl: editingBadge.iconUrl,
            criteria: editingBadge.criteria,
          })
          .eq("id", editingBadge.id);
      } else {
        await supabase.from("badges").insert({
          name: editingBadge.name,
          description: editingBadge.description,
          iconUrl: editingBadge.iconUrl,
          criteria: editingBadge.criteria,
        });
      }

      setEditingBadge(null);
      setCriteriaType("custom");
      await loadBadges();
    } catch (error) {
      console.error("Error saving badge:", error);
      alert("Failed to save badge");
    } finally {
      setSaving(false);
    }
  };

  const updateCriteria = (type: CriteriaType, value: any) => {
    let criteria: any = {};
    switch (type) {
      case "lessons_completed":
        criteria = { type: "lessons_completed", count: parseInt(value) || 0 };
        break;
      case "streak_days":
        criteria = { type: "streak_days", days: parseInt(value) || 0 };
        break;
      case "points_earned":
        criteria = { type: "points_earned", points: parseInt(value) || 0 };
        break;
      case "custom":
        try {
          criteria = JSON.parse(value);
        } catch {
          criteria = {};
        }
        break;
    }
    if (editingBadge) {
      setEditingBadge({ ...editingBadge, criteria });
    }
  };

  const openEditModal = (badge?: Badge) => {
    if (badge) {
      setEditingBadge(badge);
      const criteriaTypeFromBadge = badge.criteria?.type || "custom";
      setCriteriaType(criteriaTypeFromBadge as CriteriaType);
    } else {
      setEditingBadge({ name: "", description: "", iconUrl: "/mascot.svg", criteria: {} });
      setCriteriaType("custom");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this badge?")) return;

    try {
      await supabase.from("badges").delete().eq("id", id);
      await loadBadges();
    } catch (error) {
      console.error("Error deleting badge:", error);
      alert("Failed to delete badge");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-heading font-extrabold text-primary-900">
              Badge Management
            </h1>
            <p className="text-muted-foreground">
              Create and manage achievement badges
            </p>
          </div>
          <Button onClick={() => openEditModal()} variant="secondary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Badge
          </Button>
        </div>

        {/* Edit Modal */}
        {editingBadge && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-heading font-bold text-primary-900 mb-4">
                {editingBadge.id ? "Edit Badge" : "New Badge"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingBadge.name}
                    onChange={(e) => setEditingBadge({ ...editingBadge, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-600 mb-1">Description</label>
                  <textarea
                    value={editingBadge.description}
                    onChange={(e) => setEditingBadge({ ...editingBadge, description: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-600 mb-1">Icon URL</label>
                  <input
                    type="text"
                    value={editingBadge.iconUrl}
                    onChange={(e) => setEditingBadge({ ...editingBadge, iconUrl: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-600 mb-1">Criteria Type</label>
                  <select
                    value={criteriaType}
                    onChange={(e) => setCriteriaType(e.target.value as CriteriaType)}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  >
                    <option value="custom">Custom (JSON)</option>
                    <option value="lessons_completed">Lessons Completed</option>
                    <option value="streak_days">Streak Days</option>
                    <option value="points_earned">Points Earned</option>
                  </select>
                </div>
                {criteriaType === "lessons_completed" && (
                  <div>
                    <label className="block text-sm font-semibold text-neutral-600 mb-1">Number of Lessons</label>
                    <input
                      type="number"
                      value={editingBadge.criteria?.count || 0}
                      onChange={(e) => updateCriteria("lessons_completed", e.target.value)}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                )}
                {criteriaType === "streak_days" && (
                  <div>
                    <label className="block text-sm font-semibold text-neutral-600 mb-1">Number of Days</label>
                    <input
                      type="number"
                      value={editingBadge.criteria?.days || 0}
                      onChange={(e) => updateCriteria("streak_days", e.target.value)}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                )}
                {criteriaType === "points_earned" && (
                  <div>
                    <label className="block text-sm font-semibold text-neutral-600 mb-1">Number of Points</label>
                    <input
                      type="number"
                      value={editingBadge.criteria?.points || 0}
                      onChange={(e) => updateCriteria("points_earned", e.target.value)}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                )}
                {criteriaType === "custom" && (
                  <div>
                    <label className="block text-sm font-semibold text-neutral-600 mb-1">Criteria (JSON)</label>
                    <textarea
                      value={JSON.stringify(editingBadge.criteria, null, 2)}
                      onChange={(e) => {
                        try {
                          setEditingBadge({ ...editingBadge, criteria: JSON.parse(e.target.value) });
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none font-mono text-sm"
                      rows={4}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={() => setEditingBadge(null)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} variant="secondary">
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Badges Grid */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6">
          {badges.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No badges found. Create your first badge to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="border-2 border-slate-100 rounded-xl p-6 hover:border-primary-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center text-3xl">
                      <Award className="w-8 h-8 text-accent-600" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(badge)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(badge.id!)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-primary-900 mb-2">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                  <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded-lg">
                    <pre className="font-mono">{JSON.stringify(badge.criteria, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
