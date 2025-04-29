"use client";
import { useEffect, useState } from "react";
import { db } from "@/config/config";
import { Users } from "@/config/schema";
import { asc, eq } from "drizzle-orm";
import { toast } from "react-toastify";
import { useUser } from "@clerk/nextjs";
import router from "next/router";

type UserType = {
  id: number;
  userName: string;
  userEmail: string;
  credit: number;
  role: string;
  createdAt: string;
};

export default function AdminUserDashboard() {
  const { user, isLoaded } = useUser();  
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (
      isLoaded &&
      user?.primaryEmailAddress?.emailAddress !== "adityashriwas08@gmail.com"
    ) {
      router.push("/unauthorized");
    } else if (isLoaded) {
        getUsers();
    }
  }, [user, isLoaded]);

  const getUsers = async () => {
    const result:any = await db.select().from(Users).orderBy(asc(Users.id));
    setUsers(result);
  };

  const deleteUser = async (userEmail: string) => {
    try {
      await db.delete(Users).where(eq(Users.userEmail, userEmail));
      setUsers(users.filter((user) => user.userEmail !== userEmail));
      toast.success("User deleted successfully");  
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };
  
  const updateUserCredit = async (userEmail: string, newCredit: number) => {
    try {
      await db
        .update(Users)
        .set({ credit: newCredit })
        .where(eq(Users.userEmail, userEmail));
      
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.userEmail === userEmail ? { ...u, credit: newCredit } : u
        )
      );
    toast.success("User credit updated successfully");
    } catch (err) {
      console.error("Error updating credit:", err);
    }
  };
  

  const filteredUsers = users.filter((user) =>
    user.userName.toLowerCase().includes(search.toLowerCase()) ||
    user.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0f25] to-[#071340] text-center p-10 md:px-20 lg:px-40">
      <h2 className="text-4xl font-bold mb-6 block bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">User Management Dashboard</h2>

      <input
        type="text"
        placeholder="Search by name or email..."
        className="mb-4 p-2 border border-gray-300 rounded-md w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#071340] rounded-md shadow-md">
          <thead className="bg-[#071340]">
            <tr>
              <th className="py-2 px-4 text-center text-gray-100">Name</th>
              <th className="py-2 px-4 text-center text-gray-100">Email</th>
              <th className="py-2 px-4 text-center text-gray-100">Credits</th>
            </tr>
          </thead>
          <tbody>
  {filteredUsers.map((user, i) => (
    <tr key={i} className="border-t hover:bg-gray-900 text-gray-100">
      <td className="py-2 px-4">{user.userName}</td>
      <td className="py-2 px-4">{user.userEmail}</td>
      <td className="py-2 px-4 flex items-center justify-center gap-2">
        <input
          type="number"
          defaultValue={user.credit}
          className="w-20 p-1 bg-[#0a0f25] border border-gray-600 text-white rounded"
          onChange={(e) => {
            const updated = parseInt(e.target.value);
            setUsers((prev) =>
              prev.map((u) =>
                u.userEmail === user.userEmail ? { ...u, credit: updated } : u
              )
            );
          }}
        />
        <button
          onClick={() => updateUserCredit(user.userEmail, user.credit)}
          className="text-sm bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={() => deleteUser(user.userEmail)}
          className="text-sm bg-red-600 px-2 py-1 rounded hover:bg-red-700"
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
        {filteredUsers.length === 0 && (
          <div className="text-gray-500 mt-4 text-center">No users found.</div>
        )}
      </div>
    </div>
  );
}
