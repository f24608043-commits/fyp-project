"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, Clock, Video, X } from "lucide-react";
import { toast } from "sonner";
import { bookTutorSession, updateTutorSessionStatus } from "@/actions/tutor";
import { Button } from "@/components/ui/button";

type LiveClientProps = {
  userId: string;
  userRole: string;
  courses: { id: number; title: string }[];
  tutors: { userId: string; userName: string; userImageSrc: string }[];
  sessions: any[];
};

export const LiveClient = ({
  userId,
  userRole,
  courses,
  tutors,
  sessions,
}: LiveClientProps) => {
  const [tab, setTab] = useState<"book" | "upcoming" | "past">("book");
  const [selectedCourse, setSelectedCourse] = useState<number>(courses[0]?.id || 1);
  const [selectedTutor, setSelectedTutor] = useState<string>(tutors[0]?.userId || "tutor_demo_1");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeRoomLink, setActiveRoomLink] = useState<string | null>(null);

  const handleBook = async () => {
    if (!selectedDate) {
      toast.error("Please select a session time.");
      return;
    }

    setLoading(true);
    try {
      const res = await bookTutorSession({
        tutorId: selectedTutor,
        courseId: selectedCourse,
        scheduledAt: new Date(selectedDate).toISOString(),
      });
      if (res.success) {
        toast.success("Tutor session requested! Check the Upcoming tab.");
        setTab("upcoming");
      }
    } catch {
      toast.error("Failed to book session.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (sessionId: number, status: "confirmed" | "completed" | "cancelled") => {
    try {
      await updateTutorSessionStatus({ sessionId, status });
      toast.success(`Session ${status}!`);
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const upcomingSessions = sessions.filter(
    (s) => s.status === "requested" || s.status === "confirmed"
  );
  const pastSessions = sessions.filter(
    (s) => s.status === "completed" || s.status === "cancelled"
  );

  return (
    <div className="space-y-8">
      {/* Sub Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border-2 border-primary-100">
        <button
          onClick={() => setTab("book")}
          className={`flex-1 px-6 py-3 font-heading font-bold text-sm rounded-xl transition-all ${
            tab === "book"
              ? "bg-primary-500 text-white shadow-lg shadow-primary-200"
              : "text-muted-foreground hover:bg-primary-50 hover:text-primary-600"
          }`}
        >
          Book a Tutor
        </button>
        <button
          onClick={() => setTab("upcoming")}
          className={`flex-1 px-6 py-3 font-heading font-bold text-sm rounded-xl transition-all ${
            tab === "upcoming"
              ? "bg-primary-500 text-white shadow-lg shadow-primary-200"
              : "text-muted-foreground hover:bg-primary-50 hover:text-primary-600"
          }`}
        >
          Upcoming ({upcomingSessions.length})
        </button>
        <button
          onClick={() => setTab("past")}
          className={`flex-1 px-6 py-3 font-heading font-bold text-sm rounded-xl transition-all ${
            tab === "past"
              ? "bg-primary-500 text-white shadow-lg shadow-primary-200"
              : "text-muted-foreground hover:bg-primary-50 hover:text-primary-600"
          }`}
        >
          Past
        </button>
      </div>

      {/* Book Tab */}
      {tab === "book" && (
        <div className="bg-white rounded-3xl border-2 border-primary-100 p-8 space-y-8 shadow-sm">
          <div className="space-y-3">
            <label className="block text-lg font-heading font-bold text-primary-900">1. Select Course / Skill</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(Number(e.target.value))}
              className="w-full px-5 py-4 bg-primary-50 border-2 border-primary-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none font-body text-base"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-lg font-heading font-bold text-primary-900">2. Select Available Tutor</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tutors.length > 0 ? (
                tutors.map((t) => (
                  <div
                    key={t.userId}
                    onClick={() => setSelectedTutor(t.userId)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all hover:scale-105 ${
                      selectedTutor === t.userId
                        ? "border-primary-500 bg-primary-50 shadow-lg shadow-primary-100"
                        : "border-primary-100 hover:border-primary-300"
                    }`}
                  >
                    <img src={t.userImageSrc || "/mascot.svg"} alt={t.userName} className="w-14 h-14 rounded-full" />
                    <div>
                      <p className="font-heading font-bold text-primary-900 text-lg">{t.userName}</p>
                      <p className="text-sm text-muted-foreground font-body">Certified Mentor</p>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  onClick={() => setSelectedTutor("tutor_demo_1")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all hover:scale-105 ${
                    selectedTutor === "tutor_demo_1"
                      ? "border-primary-500 bg-primary-50 shadow-lg shadow-primary-100"
                      : "border-primary-100 hover:border-primary-300"
                  }`}
                >
                  <img src="/mascot.svg" alt="Tutor Demo" className="w-14 h-14 rounded-full" />
                  <div>
                    <p className="font-heading font-bold text-primary-900 text-lg">Master Tutor (Official)</p>
                    <p className="text-sm text-muted-foreground font-body">Available Daily • 1-on-1</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-lg font-heading font-bold text-primary-900">3. Select Date & Time</label>
            <input
              type="datetime-local"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-5 py-4 bg-primary-50 border-2 border-primary-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none font-body text-base"
            />
          </div>

          <Button
            size="lg"
            className="w-full text-lg font-heading font-bold py-6 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-xl shadow-primary-200 transition-all hover:scale-105"
            disabled={loading}
            onClick={handleBook}
          >
            {loading ? "Scheduling..." : "Request 1-on-1 Live Class"}
          </Button>
        </div>
      )}

      {/* Upcoming Tab */}
      {tab === "upcoming" && (
        <div className="space-y-6">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-primary-100 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-primary-300" />
              <p className="text-xl font-heading font-bold">No upcoming sessions</p>
              <p className="text-base font-body">Schedule one in the &quot;Book a Tutor&quot; tab!</p>
            </div>
          ) : (
            upcomingSessions.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl border-2 border-primary-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-heading font-bold uppercase tracking-wide ${
                      s.status === "confirmed" 
                        ? "bg-success-100 text-success-700" 
                        : "bg-secondary-100 text-secondary-700"
                    }`}>
                      {s.status}
                    </span>
                    <span className="text-lg font-heading font-bold text-primary-900">{s.course?.title || "Skill Session"}</span>
                  </div>
                  <p className="text-base text-muted-foreground font-body flex items-center gap-2">
                    <Clock className="w-5 h-5" /> {new Date(s.scheduledAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {s.meetingLink && (
                    <Button
                      size="lg"
                      className="font-heading font-bold flex items-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-2xl"
                      onClick={() => setActiveRoomLink(s.meetingLink)}
                    >
                      <Video className="w-5 h-5" /> Join Room
                    </Button>
                  )}

                  {userRole === "tutor" && s.status === "requested" && (
                    <Button
                      size="lg"
                      className="font-heading font-bold bg-success-500 hover:bg-success-600 text-white rounded-2xl"
                      onClick={() => handleStatusChange(s.id, "confirmed")}
                    >
                      Confirm
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Past Tab */}
      {tab === "past" && (
        <div className="space-y-6">
          {pastSessions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-primary-100 text-muted-foreground">
              <p className="text-xl font-heading font-bold">No past sessions recorded</p>
              <p className="text-base font-body">Your completed sessions will appear here.</p>
            </div>
          ) : (
            pastSessions.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl border-2 border-primary-100 p-6 flex items-center justify-between shadow-sm"
              >
                <div>
                  <span className="text-sm font-heading font-bold uppercase text-muted-400">{s.status}</span>
                  <p className="font-heading font-bold text-primary-900 text-lg">{s.course?.title || "Skill Session"}</p>
                  <p className="text-sm text-muted-foreground font-body">{new Date(s.scheduledAt).toLocaleDateString()}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-success-500" />
              </div>
            ))
          )}
        </div>
      )}

      {/* Jitsi Room Iframe Modal */}
      {activeRoomLink && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-bounce-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-6xl w-full h-[90vh] shadow-2xl flex flex-col">
            <div className="p-6 border-b border-primary-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video className="w-6 h-6 text-secondary-500" />
                <h3 className="text-2xl font-heading font-bold text-primary-900">Live 1-on-1 Class Room</h3>
              </div>
              <Button size="lg" variant="ghost" onClick={() => setActiveRoomLink(null)} className="rounded-2xl">
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex-1 bg-black">
              <iframe
                src={activeRoomLink}
                className="w-full h-full border-0"
                allow="camera; microphone; fullscreen; display-capture"
                title="Live Jitsi Room"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
