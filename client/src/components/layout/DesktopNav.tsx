import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/types";

export default function DesktopNav() {
  const [location] = useLocation();
  
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/users/me'],
  });

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center p-4 max-w-5xl">
        <Link href="/">
          <span className="logo text-2xl font-bold cursor-pointer">Instagram</span>
        </Link>
        
        <div className="search-container relative w-64">
          <Input 
            type="text" 
            placeholder="Search" 
            className="bg-gray-50 border border-gray-200 rounded-md py-1 px-4 w-full focus:outline-none" 
          />
          <i className="fas fa-search absolute right-3 top-2 text-gray-500"></i>
        </div>
        
        <div className="flex space-x-4">
          <Link href="/">
            <button className={`text-2xl ${location === '/' ? 'text-black' : 'text-gray-500'}`}>
              <i className={`${location === '/' ? 'fas' : 'far'} fa-home`}></i>
            </button>
          </Link>
          <button className="text-2xl text-gray-500">
            <i className="far fa-paper-plane"></i>
          </button>
          <button className="text-2xl text-gray-500">
            <i className="far fa-plus-square"></i>
          </button>
          <Link href="/explore">
            <button className={`text-2xl ${location === '/explore' ? 'text-black' : 'text-gray-500'}`}>
              <i className={`${location === '/explore' ? 'fas' : 'far'} fa-compass`}></i>
            </button>
          </Link>
          <button className="text-2xl text-gray-500">
            <i className="far fa-heart"></i>
          </button>
          <Link href={currentUser ? `/profile/${currentUser.username}` : "/"}>
            <Avatar className="w-8 h-8 cursor-pointer">
              <AvatarImage 
                src={currentUser?.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60"} 
                alt="Profile"
              />
              <AvatarFallback>{currentUser?.username?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
