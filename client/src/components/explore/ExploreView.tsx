import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@/lib/types";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreView() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: explorePosts, isLoading } = useQuery<Post[]>({
    queryKey: ['/api/posts/explore', searchTerm],
  });

  return (
    <section className="explore-view w-full bg-white md:rounded-lg overflow-hidden">
      <div className="search-header sticky top-0 p-3 bg-white border-b border-gray-200">
        <div className="search-container relative">
          <Input
            type="text" 
            placeholder="Search" 
            className="bg-gray-50 border border-gray-200 rounded-md py-2 px-4 w-full focus:outline-none" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search absolute right-3 top-3 text-gray-500"></i>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-3 gap-1">
          {Array(9).fill(null).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : (
        <div className="explore-grid grid grid-cols-3 gap-1">
          {explorePosts?.map((post) => (
            <div key={post.id} className="aspect-square relative overflow-hidden">
              <img src={post.imageUrl} alt="Explore" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-25 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition duration-200">
                <div className="mr-4"><i className="fas fa-heart"></i> <span>{post.likesCount}</span></div>
                <div><i className="fas fa-comment"></i> <span>{post.commentsCount}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
