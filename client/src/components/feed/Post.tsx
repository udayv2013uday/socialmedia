import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Post as PostType, Comment } from "@/lib/types";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface PostProps {
  post: PostType;
}

export default function Post({ post }: PostProps) {
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  const { data: comments } = useQuery<Comment[]>({
    queryKey: ['/api/posts', post.id, 'comments'],
  });
  
  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/posts/${post.id}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    }
  });
  
  const commentMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest('POST', `/api/posts/${post.id}/comments`, { text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts', post.id, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setCommentText("");
    }
  });

  const handleLike = () => {
    likeMutation.mutate();
  };
  
  const handleDoubleClick = () => {
    if (!post.isLiked) {
      likeMutation.mutate();
      setLikeAnimation(true);
      setTimeout(() => setLikeAnimation(false), 1000);
    }
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      commentMutation.mutate(commentText);
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <article className="post border-b border-gray-200 pb-4 mb-4">
      <div className="post-header flex items-center p-3">
        <Link href={`/profile/${post.user?.username}`}>
          <div className="flex items-center cursor-pointer">
            <Avatar className="w-8 h-8 mr-3">
              <AvatarImage src={post.user?.profileImage} alt={post.user?.username} />
              <AvatarFallback>{post.user?.username?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="username font-semibold">{post.user?.username}</div>
          </div>
        </Link>
        <div className="ml-auto">
          <button>
            <i className="fas fa-ellipsis-h"></i>
          </button>
        </div>
      </div>

      <div className="post-content relative" onDoubleClick={handleDoubleClick}>
        <img src={post.imageUrl} alt="Post" className="w-full" />
        <div className={`like-animation ${likeAnimation ? 'animate' : ''}`}>
          <i className="fas fa-heart"></i>
        </div>
      </div>

      <div className="post-actions p-3">
        <div className="flex">
          <button 
            className="mr-4 heart-btn" 
            onClick={handleLike}
            disabled={likeMutation.isPending}
          >
            <i className={`${post.isLiked ? 'fas text-red-500' : 'far'} fa-heart text-2xl`}></i>
          </button>
          <button className="mr-4">
            <i className="far fa-comment text-2xl"></i>
          </button>
          <button>
            <i className="far fa-paper-plane text-2xl"></i>
          </button>
          <button className="ml-auto">
            <i className="far fa-bookmark text-2xl"></i>
          </button>
        </div>
        <div className="likes font-semibold mt-2">
          {post.likesCount === 0 ? 'Be the first to like this' : `${post.likesCount} likes`}
        </div>
      </div>

      <div className="post-caption px-3">
        <Link href={`/profile/${post.user?.username}`}>
          <span className="font-semibold mr-2 cursor-pointer">{post.user?.username}</span>
        </Link>
        <span>{post.caption}</span>
      </div>

      <div className="post-comments px-3 mt-1">
        {post.commentsCount > 2 && (
          <button className="text-gray-500 text-sm">
            View all {post.commentsCount} comments
          </button>
        )}
        
        {comments?.slice(0, 2).map((comment) => (
          <div key={comment.id} className="comment flex justify-between mt-1">
            <div>
              <Link href={`/profile/${comment.user?.username}`}>
                <span className="font-semibold mr-2 cursor-pointer">{comment.user?.username}</span>
              </Link>
              <span>{comment.text}</span>
            </div>
            <button className="heart-comment-btn">
              <i className={`${comment.isLiked ? 'fas text-red-500' : 'far'} fa-heart`}></i>
            </button>
          </div>
        ))}
      </div>

      <div className="post-time px-3 mt-1">
        <span className="text-xs text-gray-500">{timeAgo.toUpperCase()}</span>
      </div>

      <form 
        className="add-comment border-t border-gray-200 mt-3 p-3 flex items-center"
        onSubmit={handleCommentSubmit}
      >
        <button type="button" className="mr-3">
          <i className="far fa-smile text-2xl"></i>
        </button>
        <input 
          type="text" 
          placeholder="Add a comment..." 
          className="flex-grow border-none outline-none text-sm"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button 
          type="submit" 
          className={`text-blue-500 font-semibold ml-3 ${!commentText.trim() || commentMutation.isPending ? 'opacity-50' : 'opacity-100'}`}
          disabled={!commentText.trim() || commentMutation.isPending}
        >
          Post
        </button>
      </form>
    </article>
  );
}
