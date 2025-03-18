import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { insertCommentSchema, insertLikeSchema, insertFollowSchema, insertUserSchema } from "@shared/schema";
import { comparePassword, hashPassword, requireAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = insertUserSchema.extend({
        password: z.string().min(6, "Password must be at least 6 characters"),
      });
      
      const userData = schema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Create session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Check password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Create session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/users/me", requireAuth, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove sensitive info
    const { password, ...userWithoutPassword } = user;
    
    // Get post count
    const posts = await storage.getPostsByUserId(user.id);
    
    // Get follower and following counts
    const followers = await storage.getFollowersByUserId(user.id);
    const following = await storage.getFollowingByUserId(user.id);
    
    res.json({
      ...userWithoutPassword,
      postsCount: posts.length,
      followersCount: followers.length,
      followingCount: following.length
    });
  });

  // Get user by username
  app.get("/api/users/:username", async (req: Request, res: Response) => {
    const { username } = req.params;
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove sensitive info
    const { password, ...userWithoutPassword } = user;
    
    // Get post count
    const posts = await storage.getPostsByUserId(user.id);
    
    // Get follower and following counts
    const followers = await storage.getFollowersByUserId(user.id);
    const following = await storage.getFollowingByUserId(user.id);
    
    // Check if current user is following this user (only if logged in)
    let isFollowing = false;
    if (req.user) {
      isFollowing = followers.some(f => f.followerId === req.user.id);
    }
    
    res.json({
      ...userWithoutPassword,
      postsCount: posts.length,
      followersCount: followers.length,
      followingCount: following.length,
      isFollowing
    });
  });

  // Get user posts
  app.get("/api/users/:username/posts", async (req: Request, res: Response) => {
    const { username } = req.params;
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const posts = await storage.getPostsByUserId(user.id);
    
    // Enhance posts with like and comment counts
    const enhancedPosts = await Promise.all(posts.map(async (post) => {
      const likes = await storage.getLikesByPostId(post.id);
      const comments = await storage.getCommentsByPostId(post.id);
      
      // Check if the post is liked by the current user (if authenticated)
      let isLiked = false;
      if (req.user) {
        isLiked = likes.some(like => like.userId === req.user.id);
      }
      
      return {
        ...post,
        likesCount: likes.length,
        commentsCount: comments.length,
        isLiked
      };
    }));
    
    res.json(enhancedPosts);
  });

  // Follow a user
  app.post("/api/users/:id/follow", requireAuth, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const followingId = Number(req.params.id);
    const followerId = req.user.id;
    
    if (followerId === followingId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }
    
    const user = await storage.getUser(followingId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    await storage.createFollow({
      followerId,
      followingId
    });
    
    res.status(201).json({ message: "Followed successfully" });
  });

  // Unfollow a user
  app.delete("/api/users/:id/follow", requireAuth, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const followingId = Number(req.params.id);
    const followerId = req.user.id;
    
    if (followerId === followingId) {
      return res.status(400).json({ message: "Cannot unfollow yourself" });
    }
    
    const user = await storage.getUser(followingId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    await storage.deleteFollow(followerId, followingId);
    
    res.status(200).json({ message: "Unfollowed successfully" });
  });

  // Get user suggestions
  app.get("/api/users/suggestions", requireAuth, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const currentUserId = req.user.id;
    
    // Get users the current user is already following
    const following = await storage.getFollowingByUserId(currentUserId);
    const followingIds = following.map(f => f.followingId);
    
    // Get all users
    const allUsers = await Promise.all(
      Array.from(Array(6).keys()).map(i => storage.getUser(i + 1))
    );
    
    // Filter out current user and users already following
    const filteredUsers = allUsers
      .filter(user => user && user.id !== currentUserId && !followingIds.includes(user.id))
      .map(user => {
        if (!user) return null;
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      })
      .filter(Boolean);
    
    // Generate suggestions with reasons
    const suggestions = filteredUsers.slice(0, 3).map((user) => {
      // Random suggestion reasons
      const reasons = [
        "Suggested for you",
        "New to Instagram",
        `Followed by ${allUsers[0]?.username}`
      ];
      
      return {
        user,
        reason: reasons[Math.floor(Math.random() * reasons.length)]
      };
    });
    
    res.json(suggestions);
  });

  // Get feed posts
  app.get("/api/posts", async (req: Request, res: Response) => {
    // Get posts from all users
    const allPosts = await storage.getPosts();
    
    // Check if user is authenticated to determine likes
    const currentUserId = req.user?.id;
    
    // Enhance posts with user, like and comment counts
    const enhancedPosts = await Promise.all(allPosts.map(async (post) => {
      const user = await storage.getUser(post.userId);
      const likes = await storage.getLikesByPostId(post.id);
      const comments = await storage.getCommentsByPostId(post.id);
      
      // Check if the post is liked by the current user (if authenticated)
      const isLiked = currentUserId ? likes.some(like => like.userId === currentUserId) : false;
      
      const { password, ...userWithoutPassword } = user || {};
      
      return {
        ...post,
        user: userWithoutPassword,
        likesCount: likes.length,
        commentsCount: comments.length,
        isLiked
      };
    }));
    
    res.json(enhancedPosts);
  });

  // Get explore posts
  app.get("/api/posts/explore", async (req: Request, res: Response) => {
    // Check if user is authenticated to determine likes
    const currentUserId = req.user?.id;
    
    const { search } = req.query;
    const searchTerm = typeof search === "string" ? search : undefined;
    
    const explorePosts = await storage.getExplorePosts(searchTerm);
    
    // Enhance posts with like and comment counts
    const enhancedPosts = await Promise.all(explorePosts.map(async (post) => {
      const likes = await storage.getLikesByPostId(post.id);
      const comments = await storage.getCommentsByPostId(post.id);
      
      // Check if the post is liked by the current user (if authenticated)
      const isLiked = currentUserId ? likes.some(like => like.userId === currentUserId) : false;
      
      return {
        ...post,
        likesCount: likes.length,
        commentsCount: comments.length,
        isLiked
      };
    }));
    
    res.json(enhancedPosts);
  });

  // Like a post
  app.post("/api/posts/:id/like", requireAuth, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const postId = Number(req.params.id);
    const userId = req.user.id;
    
    const post = await storage.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    await storage.createLike({
      postId,
      userId
    });
    
    res.status(201).json({ message: "Post liked successfully" });
  });

  // Unlike a post
  app.delete("/api/posts/:id/like", requireAuth, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const postId = Number(req.params.id);
    const userId = req.user.id;
    
    const post = await storage.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    await storage.deleteLike(userId, postId);
    
    res.status(200).json({ message: "Post unliked successfully" });
  });

  // Get comments for a post
  app.get("/api/posts/:id/comments", async (req: Request, res: Response) => {
    const postId = Number(req.params.id);
    
    const post = await storage.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const comments = await storage.getCommentsByPostId(postId);
    
    // Enhance comments with user info
    const enhancedComments = await Promise.all(comments.map(async (comment) => {
      const user = await storage.getUser(comment.userId);
      const { password, ...userWithoutPassword } = user || {};
      
      return {
        ...comment,
        user: userWithoutPassword,
        isLiked: false // Mock for now, would require a comment like system
      };
    }));
    
    res.json(enhancedComments);
  });

  // Add a comment to a post
  app.post("/api/posts/:id/comments", requireAuth, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const postId = Number(req.params.id);
    const userId = req.user.id;
    
    const post = await storage.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Validate comment text
    const schema = z.object({
      text: z.string().min(1).max(500)
    });
    
    try {
      const { text } = schema.parse(req.body);
      
      const comment = await storage.createComment({
        postId,
        userId,
        text
      });
      
      // Get user info
      const user = await storage.getUser(userId);
      const { password, ...userWithoutPassword } = user || {};
      
      res.status(201).json({
        ...comment,
        user: userWithoutPassword,
        isLiked: false
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  // Get stories
  app.get("/api/stories", async (req: Request, res: Response) => {
    // Check if user is authenticated to determine if stories are seen
    const currentUserId = req.user?.id;
    
    // Get all stories
    const allStories = await storage.getStories();
    
    // Only get stories from the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentStories = allStories.filter(story => 
      new Date(story.createdAt) > oneDayAgo
    );
    
    // Enhance stories with user info and seen status
    const enhancedStories = await Promise.all(recentStories.map(async (story) => {
      const user = await storage.getUser(story.userId);
      const views = await storage.getStoryViewsByStoryId(story.id);
      
      // Check if the story is seen by the current user (if authenticated)
      const seen = currentUserId ? views.some(view => view.userId === currentUserId) : false;
      
      const { password, ...userWithoutPassword } = user || {};
      
      return {
        ...story,
        user: userWithoutPassword,
        seen
      };
    }));
    
    res.json(enhancedStories);
  });
  
  // Direct route to download page
  app.get("/", (req: Request, res: Response) => {
    const downloadHtmlPath = path.join(process.cwd(), "download.html");
    res.sendFile(downloadHtmlPath);
  });
  
  // Direct route to download the zip file
  app.get("/social-media-app.zip", (req: Request, res: Response) => {
    const zipPath = path.join(process.cwd(), "social-media-app.zip");
    res.download(zipPath);
  });

  const httpServer = createServer(app);
  return httpServer;
}
