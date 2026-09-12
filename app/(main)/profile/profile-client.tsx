"use client";

import { useState } from "react";
import { Award, Camera, Flame, Heart, Sparkles, UserPlus, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/user-progress";
import { acceptFriendRequest, sendFriendRequest } from "@/actions/social";
import { Button } from "@/components/ui/button";

type ProfileClientProps = {
  userId: string;
  userEmail: string;
  userProgress: any;
  allBadges: any[];
  userBadges: any[];
  friendships: any[];
};

export const ProfileClient = ({
  userId,
  userEmail,
  userProgress,
  allBadges,
  userBadges,
  friendships,
}: ProfileClientProps) => {
  const [friendIdInput, setFriendIdInput] = useState("");
  const [loadingFriend, setLoadingFriend] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    userProgress?.avatarUrl || userProgress?.userImageSrc || "/mascot.svg"
  );
  const [name, setName] = useState<string>(userProgress?.userName || "Learner");

  const earnedBadgeIds = new Set(userBadges.map((b) => b.badgeId));

  const handleSendFriendRequest = async () => {
    if (!friendIdInput.trim()) {
      toast.error("Please enter a User ID.");
      return;
    }
    setLoadingFriend(true);
    try {
      const res = await sendFriendRequest(friendIdInput.trim());
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Friend request sent!");
        setFriendIdInput("");
      }
    } catch {
      toast.error("Failed to send friend request.");
    } finally {
      setLoadingFriend(false);
    }
  };

  const handleAcceptFriend = async (id: number) => {
    try {
      await acceptFriendRequest(id);
      toast.success("Friend request accepted!");
    } catch {
      toast.error("Failed to accept request.");
    }
  };

  // Cloudinary Direct Upload Widget Integration
  const openCloudinaryWidget = () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (cloudName && uploadPreset && (window as any).cloudinary) {
      const widget = (window as any).cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources: ["local", "url", "camera"],
          multiple: false,
          resourceType: "image",
        },
        async (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            const secureUrl = result.info.secure_url;
            setAvatarUrl(secureUrl);
            await updateProfile({ avatarUrl: secureUrl });
            toast.success("Avatar updated via Cloudinary!");
          }
        }
      );
      widget.open();
    } else {
      // Fallback custom prompt if Cloudinary env is not set
      const url = prompt("Enter an image URL for your profile avatar:");
      if (url) {
        setAvatarUrl(url);
        void updateProfile({ avatarUrl: url });
        toast.success("Avatar updated!");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header / Avatar Card */}
      <div className="bg-white rounded-3xl border-2 border-primary-100 p-8 flex flex-col sm:flex-row items-center gap-8 shadow-lg">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-500 bg-primary-50 flex items-center justify-center shadow-xl">
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <button
            onClick={openCloudinaryWidget}
            className="absolute bottom-0 right-0 p-3 bg-primary-600 text-white rounded-full shadow-xl hover:bg-primary-700 transition-all hover:scale-110"
            title="Upload Profile Picture"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-primary-900">{name}</h1>
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-heading font-bold uppercase tracking-wide bg-primary-100 text-primary-700 w-fit mx-auto sm:mx-0">
              {userProgress?.role || "Learner"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-mono">User ID: {userId}</p>
          <p className="text-base text-muted-foreground font-body">{userEmail}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border-2 border-primary-100 p-6 flex flex-col items-center justify-center text-center gap-2 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 rounded-2xl bg-destructive-100 text-destructive-600">
            <Flame className="w-7 h-7 fill-current" />
          </div>
          <span className="text-3xl font-heading font-black text-primary-900">{userProgress?.currentStreak || 0}</span>
          <span className="text-sm font-heading font-bold text-muted-foreground">Day Streak</span>
        </div>

        <div className="bg-white rounded-3xl border-2 border-primary-100 p-6 flex flex-col items-center justify-center text-center gap-2 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 rounded-2xl bg-accent-100 text-accent-700">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <span className="text-3xl font-heading font-black text-primary-900">{userProgress?.xp || userProgress?.points || 0}</span>
          <span className="text-sm font-heading font-bold text-muted-foreground">Total XP</span>
        </div>

        <div className="bg-white rounded-3xl border-2 border-primary-100 p-6 flex flex-col items-center justify-center text-center gap-2 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 rounded-2xl bg-primary-100 text-primary-600">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <span className="text-3xl font-heading font-black text-primary-900">{userProgress?.hearts || 5}</span>
          <span className="text-sm font-heading font-bold text-muted-foreground">Hearts</span>
        </div>

        <div className="bg-white rounded-3xl border-2 border-primary-100 p-6 flex flex-col items-center justify-center text-center gap-2 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 rounded-2xl bg-secondary-100 text-secondary-700">
            <Award className="w-7 h-7" />
          </div>
          <span className="text-3xl font-heading font-black text-primary-900">{userBadges.length}</span>
          <span className="text-sm font-heading font-bold text-muted-foreground">Badges</span>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="bg-white rounded-3xl border-2 border-primary-100 p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent-100 text-accent-700">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-primary-900">Achievements & Badges</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all hover:scale-105 ${
                  isEarned
                    ? "border-accent-300 bg-accent-50 shadow-lg shadow-accent-100"
                    : "border-primary-100 bg-primary-50/60 opacity-60"
                }`}
              >
                <div className={`p-4 rounded-2xl ${isEarned ? "bg-accent-100 text-accent-700" : "bg-primary-200 text-primary-400"}`}>
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h4 className="font-heading font-bold text-base text-primary-900">{badge.name}</h4>
                  <p className="text-sm text-muted-foreground font-body">{badge.description}</p>
                  <span className={`text-xs font-heading font-extrabold uppercase tracking-wider ${isEarned ? "text-accent-700" : "text-muted-400"}`}>
                    {isEarned ? "✓ Unlocked" : "Locked"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Friends & Social Section */}
      <div className="bg-white rounded-3xl border-2 border-primary-100 p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 text-primary-600">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-primary-900">Friends & Streaks</h2>
          </div>
        </div>

        {/* Add Friend Input */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter Friend's User ID..."
            value={friendIdInput}
            onChange={(e) => setFriendIdInput(e.target.value)}
            className="flex-1 px-5 py-4 bg-primary-50 border-2 border-primary-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none text-sm font-mono font-body"
          />
          <Button
            size="lg"
            className="font-heading font-bold flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl px-6"
            disabled={loadingFriend}
            onClick={handleSendFriendRequest}
          >
            <UserPlus className="w-5 h-5" /> Add Friend
          </Button>
        </div>

        {/* Friends List */}
        <div className="space-y-4">
          {friendships.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 text-primary-300" />
              <p className="text-lg font-heading font-bold">No friends added yet</p>
              <p className="text-base font-body">Share your User ID to connect with friends!</p>
            </div>
          ) : (
            friendships.map((f) => {
              const isReceived = f.userIdB === userId;
              const friendId = isReceived ? f.userIdA : f.userIdB;

              return (
                <div
                  key={f.id}
                  className="p-5 rounded-2xl border-2 border-primary-100 flex items-center justify-between hover:border-primary-300 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img src="/mascot.svg" alt="Friend" className="w-12 h-12 rounded-full border-2 border-primary-200" />
                    <div>
                      <p className="font-mono text-sm font-heading font-bold text-primary-900">{friendId}</p>
                      <span className="text-xs font-heading font-bold uppercase text-muted-400">{f.status}</span>
                    </div>
                  </div>

                  {f.status === "pending" && isReceived && (
                    <Button 
                      size="lg" 
                      className="font-heading font-bold bg-success-500 hover:bg-success-600 text-white rounded-2xl"
                      onClick={() => handleAcceptFriend(f.id)}
                    >
                      Accept
                    </Button>
                  )}

                  {f.status === "accepted" && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive-100 text-destructive-700 text-sm font-heading font-bold">
                      <Flame className="w-4 h-4 fill-current" /> Active Friend
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
