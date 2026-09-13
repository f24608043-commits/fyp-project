"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, User, Search } from "lucide-react";

type UserRole = "user" | "tutor" | "admin";

type UserProfile = {
  id: string;
  userName: string;
  role: UserRole;
  points: number;
  hearts: number;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const { data } = await supabase.from("user_progress").select("*");
    if (data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: UserRole) => {
    setUpdatingRole(userId);
    try {
      await supabase
        .from("user_progress")
        .update({ role: newRole })
        .eq("userId", userId);
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role");
    } finally {
      setUpdatingRole(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: UserRole) => {
    const config = {
      user: { label: "User", color: "bg-slate-100 text-slate-700" },
      tutor: { label: "Tutor", color: "bg-green-100 text-green-700" },
      admin: { label: "Admin", color: "bg-primary-100 text-primary-700" },
    };
    return config[role];
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-extrabold text-primary-900">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              {searchTerm ? "No users found matching your search." : "No users found."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">User</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Role</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Points</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Hearts</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const roleBadge = getRoleBadge(user.role);
                    return (
                      <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-heading font-bold text-primary-900">{user.userName || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{user.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-sm font-bold rounded-full ${roleBadge.color}`}>
                            {roleBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{user.points || 0}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{user.hearts || 0}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <select
                              value={user.role}
                              onChange={(e) => updateRole(user.id, e.target.value as UserRole)}
                              disabled={updatingRole === user.id}
                              className="px-3 py-1 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none text-sm"
                            >
                              <option value="user">User</option>
                              <option value="tutor">Tutor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-primary-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tutors</p>
                <p className="text-2xl font-bold text-primary-900">{users.filter(u => u.role === "tutor").length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-primary-900">{users.filter(u => u.role === "admin").length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
