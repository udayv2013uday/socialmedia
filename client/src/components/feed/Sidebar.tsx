import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { User, Suggestion } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Sidebar() {
  const { data: currentUser, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['/api/users/me'],
  });
  
  const { data: suggestions, isLoading: isSuggestionsLoading } = useQuery<Suggestion[]>({
    queryKey: ['/api/users/suggestions'],
  });
  
  const followMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('POST', `/api/users/${userId}/follow`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/suggestions'] });
    }
  });

  const handleFollow = (userId: number) => {
    followMutation.mutate(userId);
  };
  
  return (
    <aside className="sidebar hidden md:block md:w-2/5">
      {/* User Profile */}
      <div className="user-profile flex items-center py-4">
        {isUserLoading ? (
          <>
            <Skeleton className="w-14 h-14 rounded-full mr-4" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          </>
        ) : (
          <>
            <Link href={`/profile/${currentUser?.username}`}>
              <Avatar className="w-14 h-14 mr-4 cursor-pointer">
                <AvatarImage src={currentUser?.profileImage} alt="Profile" />
                <AvatarFallback>{currentUser?.username?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/profile/${currentUser?.username}`}>
                <div className="font-semibold cursor-pointer">{currentUser?.username}</div>
              </Link>
              <div className="text-gray-500">{currentUser?.fullName}</div>
            </div>
            <button className="ml-auto text-xs font-semibold text-blue-500">Switch</button>
          </>
        )}
      </div>

      {/* Suggestions */}
      <div className="suggestions py-4">
        <div className="flex justify-between mb-3">
          <span className="font-semibold text-gray-500">Suggestions For You</span>
          <button className="text-xs font-semibold">See All</button>
        </div>

        {isSuggestionsLoading ? (
          Array(3).fill(null).map((_, i) => (
            <div key={i} className="suggestion-item flex items-center mb-3">
              <Skeleton className="w-8 h-8 rounded-full mr-3" />
              <div className="flex-grow">
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-2 w-24" />
              </div>
              <Skeleton className="h-4 w-14" />
            </div>
          ))
        ) : (
          suggestions?.map((suggestion) => (
            <div key={suggestion.user.id} className="suggestion-item flex items-center mb-3">
              <Link href={`/profile/${suggestion.user.username}`}>
                <Avatar className="w-8 h-8 mr-3 cursor-pointer">
                  <AvatarImage src={suggestion.user.profileImage} alt={suggestion.user.username} />
                  <AvatarFallback>{suggestion.user.username.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-grow">
                <Link href={`/profile/${suggestion.user.username}`}>
                  <div className="text-sm font-semibold cursor-pointer">{suggestion.user.username}</div>
                </Link>
                <div className="text-xs text-gray-500">{suggestion.reason}</div>
              </div>
              <button 
                className="text-xs font-semibold text-blue-500"
                onClick={() => handleFollow(suggestion.user.id)}
                disabled={followMutation.isPending}
              >
                Follow
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Links */}
      <div className="footer-links text-xs text-gray-500 mt-4">
        <div className="mb-4">
          <a href="#" className="mr-2">About</a>
          <a href="#" className="mr-2">Help</a>
          <a href="#" className="mr-2">Press</a>
          <a href="#" className="mr-2">API</a>
          <a href="#" className="mr-2">Jobs</a>
          <a href="#" className="mr-2">Privacy</a>
          <a href="#" className="mr-2">Terms</a>
          <a href="#" className="mr-2">Locations</a>
        </div>
        <div>
          © 2023 INSTAGRAM CLONE
        </div>
      </div>
    </aside>
  );
}
