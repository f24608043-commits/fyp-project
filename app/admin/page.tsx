import { redirect } from "next/navigation";
import { getIsAdmin } from "@/lib/admin";
import { getUser } from "@/lib/supabase/server";
import { App } from "./app";

const AdminPage = async () => {
  const user = await getUser();
  if (!user) return redirect("/sign-in");

  const isAdmin = await getIsAdmin();
  if (!isAdmin) return redirect("/");

  return <App />;
};

export default AdminPage;
