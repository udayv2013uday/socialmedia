import { useParams } from "wouter";
import ProfileView from "@/components/profile/ProfileView";

export default function Profile() {
  const params = useParams<{ username: string }>();
  
  return (
    <main className="flex-grow w-full max-w-5xl mx-auto pt-4 pb-14 md:pb-8">
      <ProfileView username={params.username} />
    </main>
  );
}
