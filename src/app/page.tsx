import { auth } from "@clerk/nextjs/server";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    return <Dashboard />;
  }

  return <LandingPage />;
}
