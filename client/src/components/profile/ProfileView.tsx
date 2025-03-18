import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Post } from "@/lib/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileViewProps {
  username: string;
}

export default function ProfileView({ username }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState("posts");
  
  const { data: user, isLoading: isUserLoading } = useQuery<User & { postsCount: number, followersCount: number, followingCount: number }>({
    queryKey: ['/api/users', username],
  });
  
  const { data: posts, isLoading: isPostsLoading } = useQuery<Post[]>({
    queryKey: ['/api/users', username, 'posts'],
  });
  
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/users/me'],
  });
  
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      return apiRequest('POST', `/api/users/${user.id}/follow`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', username] });
    }
  });
  
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      return apiRequest('DELETE', `/api/users/${user.id}/follow`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', username] });
    }
  });
  
  const isOwnProfile = currentUser?.username === username;
  const isFollowing = user?.isFollowing;
  
  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return (
    <section className="profile-view w-full bg-white md:rounded-lg overflow-hidden">
      <div className="profile-header p-4 border-b border-gray-200">
        <div className="md:flex md:items-center">
          {isUserLoading ? (
            <Skeleton className="mx-auto md:mx-0 md:mr-8 w-20 h-20 md:w-32 md:h-32 rounded-full" />
          ) : (
            <Avatar className="mx-auto md:mx-0 md:mr-8 w-20 h-20 md:w-32 md:h-32">
              <AvatarImage src={user?.profileImage} alt={user?.username} />
              <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          )}
          
          <div className="profile-info mt-4 md:mt-0 text-center md:text-left">
            {isUserLoading ? (
              <>
                <Skeleton className="h-6 w-32 mx-auto md:mx-0 mb-4" />
                <div className="flex space-x-8 justify-center md:justify-start mb-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-48 hidden md:block" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-center md:justify-start">
                  <h1 className="text-lg md:text-2xl font-light">{user?.username}</h1>
                  {isOwnProfile ? (
                    <Button variant="outline" size="sm" className="ml-4">Edit Profile</Button>
                  ) : (
                    <Button 
                      variant={isFollowing ? "outline" : "default"} 
                      size="sm" 
                      className="ml-4"
                      onClick={handleFollowToggle}
                      disabled={followMutation.isPending || unfollowMutation.isPending}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  )}
                </div>
                
                <div className="stats flex space-x-4 md:space-x-8 my-4 justify-center md:justify-start">
                  <div><span className="font-semibold">{user?.postsCount || 0}</span> posts</div>
                  <div><span className="font-semibold">{user?.followersCount || 0}</span> followers</div>
                  <div><span className="font-semibold">{user?.followingCount || 0}</span> following</div>
                </div>
                
                <div className="bio md:block hidden">
                  <div className="font-semibold">{user?.fullName}</div>
                  {user?.bio && <div>{user.bio}</div>}
                  {user?.website && <div className="text-blue-900">{user.website}</div>}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile only bio */}
        {!isUserLoading && (
          <div className="bio md:hidden mt-4 text-left">
            <div className="font-semibold">{user?.fullName}</div>
            {user?.bio && <div>{user.bio}</div>}
            {user?.website && <div className="text-blue-900">{user.website}</div>}
          </div>
        )}
      </div>
      
      <Tabs defaultValue="posts" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex justify-center border-t border-gray-200 bg-white">
          <TabsTrigger value="posts" className="flex items-center gap-1">
            <i className="fas fa-th"></i> POSTS
          </TabsTrigger>
          <TabsTrigger value="reels" className="flex items-center gap-1">
            <i className="far fa-play-circle"></i> REELS
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-1">
            <i className="far fa-bookmark"></i> SAVED
          </TabsTrigger>
          <TabsTrigger value="tagged" className="flex items-center gap-1">
            <i className="fas fa-tag"></i> TAGGED
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-0">
          {isPostsLoading ? (
            <div className="grid grid-cols-3 gap-1">
              {Array(6).fill(null).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : posts?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <i className="far fa-camera text-6xl text-gray-300 mb-4"></i>
              <h2 className="text-xl font-semibold">No Posts Yet</h2>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts?.map((post) => (
                <div key={post.id} className="aspect-square relative overflow-hidden">
                  <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-25 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition duration-200">
                    <div className="mr-4"><i className="fas fa-heart"></i> <span>{post.likesCount}</span></div>
                    <div><i className="fas fa-comment"></i> <span>{post.commentsCount}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reels">
          <div className="flex flex-col items-center justify-center py-16">
            <i className="far fa-play-circle text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-xl font-semibold">No Reels Yet</h2>
          </div>
        </TabsContent>
        
        <TabsContent value="saved">
          <div className="flex flex-col items-center justify-center py-16">
            <i className="far fa-bookmark text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-xl font-semibold">No Saved Posts</h2>
          </div>
        </TabsContent>
        
        <TabsContent value="tagged">
          <div className="flex flex-col items-center justify-center py-16">
            <i className="fas fa-tag text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-xl font-semibold">No Tagged Posts</h2>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
