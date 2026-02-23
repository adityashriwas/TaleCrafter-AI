"use client";

import { db } from "@/config/config";
import { StoryData, Users } from "@/config/schema";
import { asc, desc, eq } from "drizzle-orm";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type StoryItemType = {
  id: number;
  storyId: string;
  storyType: string;
  ageGroup: string;
  storySubject: string;
  imageStyle: string;
  userEmail: string;
  userName: string;
  output: any;
};

type UserType = {
  id: number;
  userName: string;
  userEmail: string;
  userImage?: string;
  credit: number;
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<"stories" | "users">("stories");
  const [stories, setStories] = useState<StoryItemType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [storySearch, setStorySearch] = useState("");
  const [storyTypeFilter, setStoryTypeFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [editedCredits, setEditedCredits] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchStories();
    fetchUsers();
  }, []);

  const fetchStories = async () => {
    setLoadingStories(true);
    try {
      const result: any = await db
        .select()
        .from(StoryData)
        .orderBy(desc(StoryData.id));
      setStories(result);
    } catch {
      toast.error("Failed to load stories");
    } finally {
      setLoadingStories(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const result: any = await db.select().from(Users).orderBy(asc(Users.id));
      setUsers(result);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await db.delete(StoryData).where(eq(StoryData.storyId, storyId));
      setStories((prev) => prev.filter((s) => s.storyId !== storyId));
      toast.success("Story deleted successfully");
    } catch {
      toast.error("Failed to delete story");
    }
  };

  const handleDeleteUser = async (userEmail: string) => {
    try {
      await db.delete(Users).where(eq(Users.userEmail, userEmail));
      setUsers((prev) => prev.filter((u) => u.userEmail !== userEmail));
      toast.success("User deleted successfully");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleUpdateUserCredit = async (userEmail: string) => {
    const user = users.find((u) => u.userEmail === userEmail);
    if (!user) return;

    const newCredit = editedCredits[userEmail] ?? user.credit;
    if (Number.isNaN(newCredit)) {
      toast.error("Invalid credit value");
      return;
    }

    try {
      await db.update(Users).set({ credit: newCredit }).where(eq(Users.userEmail, userEmail));
      setUsers((prev) =>
        prev.map((u) => (u.userEmail === userEmail ? { ...u, credit: newCredit } : u))
      );
      toast.success("User credit updated");
    } catch {
      toast.error("Failed to update credit");
    }
  };

  const storyTypeOptions = useMemo(() => {
    const types = new Set(stories.map((s) => s.storyType).filter(Boolean));
    return ["all", ...Array.from(types)];
  }, [stories]);

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const search = storySearch.toLowerCase();
      const matchesSearch =
        (story.output?.title ?? "").toLowerCase().includes(search) ||
        (story.userName ?? "").toLowerCase().includes(search) ||
        (story.userEmail ?? "").toLowerCase().includes(search) ||
        (story.storySubject ?? "").toLowerCase().includes(search);
      const matchesType =
        storyTypeFilter === "all" || (story.storyType ?? "") === storyTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [stories, storySearch, storyTypeFilter]);

  const filteredUsers = useMemo(() => {
    const search = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        (u.userName ?? "").toLowerCase().includes(search) ||
        (u.userEmail ?? "").toLowerCase().includes(search)
    );
  }, [users, userSearch]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020b1f] px-5 py-8 md:px-16 lg:px-28 xl:px-40">
      <div className="tc-hero-grid absolute inset-0 opacity-35" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative">
        <div className="tc-glass-panel p-6">
          <h1 className="tc-title-gradient text-3xl font-extrabold md:text-5xl">
            Admin Panel
          </h1>
          <p className="mt-2 text-blue-100/75">
            Centralized story moderation and user management.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-blue-400/10 p-3 text-center">
              <p className="text-2xl font-bold text-white">{stories.length}</p>
              <p className="text-xs uppercase text-blue-100/70">Total Stories</p>
            </div>
            <div className="rounded-xl bg-blue-400/10 p-3 text-center">
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-xs uppercase text-blue-100/70">Total Users</p>
            </div>
            <div className="rounded-xl bg-blue-400/10 p-3 text-center">
              <p className="text-2xl font-bold text-white">
                {new Set(stories.map((s) => s.storyType)).size}
              </p>
              <p className="text-xs uppercase text-blue-100/70">Story Types</p>
            </div>
            <div className="rounded-xl bg-blue-400/10 p-3 text-center">
              <p className="text-2xl font-bold text-white">
                {users.reduce((sum, u) => sum + Number(u.credit ?? 0), 0)}
              </p>
              <p className="text-xs uppercase text-blue-100/70">Total Credits</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setActiveTab("stories")}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              activeTab === "stories"
                ? "border-cyan-300/40 bg-cyan-400/20 text-cyan-100"
                : "border-blue-300/20 bg-white/5 text-blue-100/80 hover:bg-white/10"
            }`}
          >
            Stories
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              activeTab === "users"
                ? "border-cyan-300/40 bg-cyan-400/20 text-cyan-100"
                : "border-blue-300/20 bg-white/5 text-blue-100/80 hover:bg-white/10"
            }`}
          >
            Users
          </button>
        </div>

        {activeTab === "stories" && (
          <div className="tc-glass-panel-soft mt-4 p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                placeholder="Search stories, title, user, email..."
                className="w-full rounded-lg border border-blue-300/20 bg-[#06142e] px-3 py-2 text-blue-100 outline-none"
                value={storySearch}
                onChange={(e) => setStorySearch(e.target.value)}
              />
              <select
                className="rounded-lg border border-blue-300/20 bg-[#06142e] px-3 py-2 text-blue-100 outline-none"
                value={storyTypeFilter}
                onChange={(e) => setStoryTypeFilter(e.target.value)}
              >
                {storyTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" ? "All Types" : type}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-blue-100">
                <thead className="bg-blue-500/10 text-left">
                  <tr>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Prompt</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStories.map((story) => (
                    <tr key={story.storyId} className="border-t border-blue-300/10">
                      <td className="px-3 py-2">{story.output?.title ?? "-"}</td>
                      <td className="px-3 py-2">{story.storyType ?? "-"}</td>
                      <td className="px-3 py-2">{story.userName ?? "-"}</td>
                      <td className="px-3 py-2">{story.userEmail ?? "-"}</td>
                      <td className="max-w-[280px] truncate px-3 py-2">
                        {story.storySubject ?? "-"}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleDeleteStory(story.storyId)}
                          className="rounded-lg bg-red-500 px-3 py-1 font-semibold text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loadingStories && filteredStories.length === 0 && (
                <p className="mt-4 text-center text-blue-100/70">No stories found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="tc-glass-panel-soft mt-4 p-5">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="w-full rounded-lg border border-blue-300/20 bg-[#06142e] px-3 py-2 text-blue-100 outline-none"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-blue-100">
                <thead className="bg-blue-500/10 text-left">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Credit</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.userEmail} className="border-t border-blue-300/10">
                      <td className="px-3 py-2">{u.userName ?? "-"}</td>
                      <td className="px-3 py-2">{u.userEmail ?? "-"}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          defaultValue={u.credit}
                          className="w-24 rounded-md border border-blue-300/20 bg-[#06142e] px-2 py-1 text-blue-100 outline-none"
                          onChange={(e) => {
                            setEditedCredits((prev) => ({
                              ...prev,
                              [u.userEmail]: Number(e.target.value),
                            }));
                          }}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleUpdateUserCredit(u.userEmail)}
                            className="rounded-lg bg-blue-600 px-3 py-1 font-semibold text-white hover:bg-blue-700"
                          >
                            Save Credit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.userEmail)}
                            className="rounded-lg bg-red-500 px-3 py-1 font-semibold text-white hover:bg-red-600"
                          >
                            Delete User
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loadingUsers && filteredUsers.length === 0 && (
                <p className="mt-4 text-center text-blue-100/70">No users found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
