"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { eq, desc } from "drizzle-orm";
import { toast } from "react-toastify";

interface StoryItemType {
  id: string;
  storyId: string;
  storyType: string;
  ageGroup: string;
  storySubject: string;
  imageStyle: string;
  userEmail: string;
  userName: string;
  output: any;
}

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stories, setStories] = useState<StoryItemType[]>([]);

  useEffect(() => {
    if (isLoaded && user?.primaryEmailAddress?.emailAddress !== "adityashriwas08@gmail.com") {
      router.push("/unauthorized");
    } else if (isLoaded) {
      fetchStories();
    }
  }, [user, isLoaded]);

  const fetchStories = async () => {
    const result: any = await db.select().from(StoryData).orderBy(desc(StoryData.id));
    setStories(result);
  };

  const handleDelete = async (storyId: string) => {
    try {
      await db.delete(StoryData).where(eq(StoryData.storyId, storyId));
      toast.success("Story deleted successfully");
      fetchStories();
    } catch (error) {
      toast.error("Failed to delete story");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0f25] to-[#071340] text-center p-10 md:px-20 lg:px-40">
      <h1 className="text-4xl font-bold mb-6 block bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Admin Dashboard</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#071340] text-gray-100 border-gray-100">
          <thead>
            <tr className="bg-[#071340] text-gray-100">
              <th className="py-3 px-2">Title</th>
              <th className="py-3 px-2">User Name</th>
              <th className="py-3 px-2">Email</th>
              {/* <th className="py-3 px-4">Age Group</th> */}
              {/* <th className="py-3 px-4">Story Type</th> */}
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((story) => (
              <tr key={story.storyId} className="border-t">
                <td className="py-2 px-2">{story.output?.title}</td>
                <td className="py-2 px-2">{story.userName}</td>
                <td className="py-2 px-2">{story.userEmail}</td>
                {/* <td className="py-2 px-4">{story.ageGroup}</td> */}
                {/* <td className="py-2 px-4">{story.storyType}</td> */}
                <td className="py-2 px-1 max-w-[400px] overflow-x-auto whitespace-nowrap">
  <div className="overflow-x-auto">
    {story.storySubject}
  </div>
</td>

                <td className="py-2 px-4">
                  <button
                    onClick={() => handleDelete(story.storyId)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
