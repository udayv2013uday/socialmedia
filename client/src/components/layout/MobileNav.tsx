import { Link, useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/types";

export default function MobileNav() {
  const [location] = useLocation();
  
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/users/me'],
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-50">
      <Link href="/">
        <button className={`text-2xl ${location === '/' ? 'text-black' : 'text-gray-500'}`}>
          <i className={`${location === '/' ? 'fas' : 'far'} fa-home`}></i>
        </button>
      </Link>
      
      <Link href="/explore">
        <button className={`text-2xl ${location === '/explore' ? 'text-black' : 'text-gray-500'}`}>
          <i className={`${location === '/explore' ? 'fas' : 'far'} fa-search`}></i>
        </button>
      </Link>
      
      <button className="text-2xl text-gray-500">
        <i className="far fa-plus-square"></i>
      </button>
      
      <button className="text-2xl text-gray-500">
        <i className="far fa-heart"></i>
      </button>
      
      <Link href={currentUser ? `/profile/${currentUser.username}` : "/"}>
        <Avatar className={`w-7 h-7 ${location.startsWith('/profile') ? 'ring-2 ring-black' : ''}`}>
          <AvatarImage 
            src={currentUser?.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60"} 
            alt="Profile" 
          />
          <AvatarFallback>{currentUser?.username?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      </Link>
    </nav>
  );
}
