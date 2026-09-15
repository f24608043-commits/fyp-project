"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Search, X } from "lucide-react";
import { trackLibraryView } from "@/actions/library";
import { Button } from "@/components/ui/button";

type LessonItem = {
  id: number;
  title: string;
  youtubeVideoId: string | null;
  unit: {
    title: string;
    description: string;
    course: {
      title: string;
      category: string | null;
    };
  };
};

export const LibraryClient = ({ initialLessons }: { initialLessons: LessonItem[] }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [activeVideo, setActiveVideo] = useState<LessonItem | null>(null);

  const categories = ["all", ...Array.from(new Set(initialLessons.map((l) => l.unit.course.category || "General")))];

  const filtered = initialLessons.filter((l) => {
    const matchesCat = category === "all" || (l.unit.course.category || "General").toLowerCase() === category.toLowerCase();
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.unit.course.title.toLowerCase().includes(search.toLowerCase()) ||
      l.unit.title.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenVideo = (lesson: LessonItem) => {
    setActiveVideo(lesson);
    void trackLibraryView(lesson.id);
  };

  return (
    <div className="space-y-8">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search lessons, courses, or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 border-b-4 rounded-2xl focus:border-green-500 focus:border-b-green-600 focus:ring-4 focus:ring-green-100 focus:outline-none text-base transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-3 rounded-2xl text-sm font-bold capitalize whitespace-nowrap transition-all hover:scale-105 border-2 border-b-4 ${
                category === cat
                  ? "bg-green-500 text-white shadow-lg shadow-green-200 border-green-600 border-b-green-700"
                  : "bg-white text-slate-500 border-slate-200 hover:border-green-400 hover:text-green-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((lesson) => {
          const thumbUrl = lesson.youtubeVideoId
            ? `https://img.youtube.com/vi/${lesson.youtubeVideoId}/hqdefault.jpg`
            : "/hero.svg";

          return (
            <div
              key={lesson.id}
              onClick={() => handleOpenVideo(lesson)}
              className="group cursor-pointer bg-white rounded-3xl border-2 border-slate-200 border-b-4 overflow-hidden hover:border-green-400 hover:shadow-xl shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <img
                  src={thumbUrl}
                  alt={lesson.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-4 bg-white/95 text-green-600 rounded-full shadow-xl border-2 border-green-200">
                    <Play className="h-8 w-8 fill-current" />
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-green-600">
                    {lesson.unit.course.title}
                  </span>
                  <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-green-600 transition-colors text-lg">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-1">{lesson.unit.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500 space-y-3">
          <div className="text-5xl">🔍</div>
          <p className="text-xl font-bold">No videos found</p>
          <p className="text-base">Try searching for a different keyword or category.</p>
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl border-2 border-slate-200 border-b-4 space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-green-600 uppercase tracking-wider">
                  {activeVideo.unit.course.title} • {activeVideo.unit.title}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-800">{activeVideo.title}</h2>
              </div>
              <Button 
                size="lg" 
                variant="ghost" 
                onClick={() => setActiveVideo(null)} 
                className="rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border-2 border-slate-200">
              {activeVideo.youtubeVideoId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeVideoId}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  No video ID provided for this lesson.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
