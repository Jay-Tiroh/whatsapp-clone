import { useAuthStore } from "@/features/auth";
import { getAuthDestination } from "@/features/auth/utils/getAuthDestination";
import { WelcomeScreen } from "@/features/welcome";
import { Href, Redirect } from "expo-router";

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (isAuthenticated) {
    return (
      <Redirect href={getAuthDestination(isAuthenticated, user) as Href} />
    );
  }

  return <WelcomeScreen />;
}
