import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Stories from "@/components/feed/Stories";
import Post from "@/components/feed/Post";
import Sidebar from "@/components/feed/Sidebar";
import { Post as PostType } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Home() {
  const isMobile = useIsMobile();
  
  const { data: posts, isLoading } = useQuery<PostType[]>({
    queryKey: ['/api/posts'],
  });
  
  return (
    <main className="flex-grow w-full max-w-5xl mx-auto md:flex md:space-x-8 md:pt-8 pb-14 md:pb-0">
      <section className="feed w-full md:w-3/5 bg-white md:rounded-lg md:border md:border-gray-200 overflow-hidden mb-14 md:mb-0">
        <Stories />
        
        {isLoading ? (
          Array(3).fill(null).map((_, i) => (
            <div key={i} className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-center p-3">
                <Skeleton className="w-8 h-8 rounded-full mr-3" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="w-full h-96" />
              <div className="p-3">
                <div className="flex mb-2">
                  <Skeleton className="w-6 h-6 mr-4" />
                  <Skeleton className="w-6 h-6 mr-4" />
                  <Skeleton className="w-6 h-6" />
                </div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))
        ) : posts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <i className="far fa-image text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">No Posts Yet</h2>
            <p className="text-gray-500 text-center">
              Follow some users to see posts in your feed
            </p>
          </div>
        ) : (
          posts?.map((post) => (
            <Post key={post.id} post={post} />
          ))
        )}
      </section>
      
      {!isMobile && <Sidebar />}
    </main>
  );
}
