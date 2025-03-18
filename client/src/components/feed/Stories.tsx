import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Story, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Stories() {
  const { data: stories, isLoading } = useQuery<(Story & { user: User })[]>({
    queryKey: ['/api/stories'],
  });
  
  if (isLoading) {
    return (
      <div className="stories-container overflow-x-auto whitespace-nowrap py-4 px-2 border-b border-gray-200">
        {Array(6).fill(null).map((_, i) => (
          <div key={i} className="inline-block mx-2 text-center">
            <div className="relative">
              <div className="rounded-full p-0.5 bg-gray-200">
                <Skeleton className="w-16 h-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-3 w-16 mt-1 mx-auto" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="stories-container overflow-x-auto whitespace-nowrap py-4 px-2 border-b border-gray-200">
      {stories?.map((story) => (
        <div key={story.id} className="inline-block mx-2 text-center">
          <div className="story-avatar relative">
            <div className={`${story.seen ? 'bg-gray-300' : 'story-ring'} rounded-full p-0.5`}>
              <div className="rounded-full overflow-hidden w-16 h-16 border-2 border-white">
                <Avatar className="w-full h-full">
                  {story.user?.profileImage && (
                    <AvatarImage src={story.user.profileImage} alt={story.user.username || 'User'} />
                  )}
                  <AvatarFallback>
                    {story.user?.username ? story.user.username.charAt(0) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
          <p className="text-xs mt-1 truncate w-16">{story.user?.username || 'User'}</p>
        </div>
      ))}
    </div>
  );
}
