import {
  User, Post, Comment, Like, Follow, Story, StoryView,
  InsertUser, InsertPost, InsertComment, InsertLike, InsertFollow, InsertStory, InsertStoryView
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post operations
  getPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: number): Promise<Post[]>;
  getExplorePosts(searchTerm?: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  
  // Comment operations
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Like operations
  getLikesByPostId(postId: number): Promise<Like[]>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(userId: number, postId: number): Promise<void>;
  
  // Follow operations
  getFollowersByUserId(userId: number): Promise<Follow[]>;
  getFollowingByUserId(userId: number): Promise<Follow[]>;
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(followerId: number, followingId: number): Promise<void>;
  
  // Story operations
  getStories(): Promise<Story[]>;
  getStoriesByUserId(userId: number): Promise<Story[]>;
  createStory(story: InsertStory): Promise<Story>;
  
  // Story view operations
  getStoryViewsByStoryId(storyId: number): Promise<StoryView[]>;
  createStoryView(storyView: InsertStoryView): Promise<StoryView>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private likes: Map<number, Like>;
  private follows: Map<number, Follow>;
  private stories: Map<number, Story>;
  private storyViews: Map<number, StoryView>;
  
  private userId: number;
  private postId: number;
  private commentId: number;
  private likeId: number;
  private followId: number;
  private storyId: number;
  private storyViewId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.follows = new Map();
    this.stories = new Map();
    this.storyViews = new Map();
    
    this.userId = 1;
    this.postId = 1;
    this.commentId = 1;
    this.likeId = 1;
    this.followId = 1;
    this.storyId = 1;
    this.storyViewId = 1;
    
    // Create some initial data
    this.initializeData();
  }

  private initializeData() {
    // Create sample users
    const user1 = this.createUser({
      username: "user_1",
      password: "password123",
      fullName: "User One",
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60",
      bio: "Food enthusiast | Photographer",
      website: "www.user1.com"
    });
    
    const user2 = this.createUser({
      username: "travel_guy",
      password: "password123",
      fullName: "Travel Guy",
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60",
      bio: "Travel enthusiast | Adventure seeker",
      website: "www.travelguy.com"
    });
    
    const user3 = this.createUser({
      username: "photo_lover",
      password: "password123",
      fullName: "Photo Lover",
      profileImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60",
      bio: "Photography enthusiast",
      website: "www.photolover.com"
    });
    
    const user4 = this.createUser({
      username: "james_89",
      password: "password123",
      fullName: "James Wilson",
      profileImage: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60",
      bio: "City explorer | Night photographer",
      website: "www.james89.com"
    });
    
    const user5 = this.createUser({
      username: "sophiajs",
      password: "password123",
      fullName: "Sophia Johnson",
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60",
      bio: "Software developer | Nature lover",
      website: "www.sophiajs.com"
    });
    
    const user6 = this.createUser({
      username: "max_design",
      password: "password123",
      fullName: "Max Designer",
      profileImage: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60",
      bio: "UI/UX Designer | Creator",
      website: "www.maxdesign.com"
    });
    
    // Create sample posts
    const post1 = this.createPost({
      userId: user1.id,
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      caption: "Delicious meal at my favorite restaurant! #foodie #yum"
    });
    
    const post2 = this.createPost({
      userId: user2.id,
      imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      caption: "Mountain views never get old ⛰️ #adventure #outdoors #nature"
    });
    
    const post3 = this.createPost({
      userId: user4.id,
      imageUrl: "https://images.unsplash.com/photo-1551854716-8b811be39e7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      caption: "City lights never disappoint 🌃 #cityscape #nightphotography"
    });
    
    const post4 = this.createPost({
      userId: user3.id,
      imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      caption: "My new camera setup! #photography #gear"
    });
    
    const post5 = this.createPost({
      userId: user5.id,
      imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      caption: "Weekend vibes with friends #friendship #weekend"
    });
    
    const post6 = this.createPost({
      userId: user6.id,
      imageUrl: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      caption: "Breathtaking mountain landscape #design #inspiration #nature"
    });
    
    // Create more posts for explore view
    this.createPost({
      userId: user2.id,
      imageUrl: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      caption: "Beach day! 🏖️ #beach #summer #relax"
    });
    
    this.createPost({
      userId: user3.id,
      imageUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      caption: "Italian adventure #travel #italy #photography"
    });
    
    // Create sample comments
    this.createComment({
      postId: post1.id,
      userId: user3.id,
      text: "This looks so delicious! 😋"
    });
    
    this.createComment({
      postId: post1.id,
      userId: user2.id,
      text: "Which restaurant is this?"
    });
    
    this.createComment({
      postId: post2.id,
      userId: user6.id,
      text: "Great shot! What camera did you use?"
    });
    
    this.createComment({
      postId: post2.id,
      userId: user5.id,
      text: "This makes me want to plan a hiking trip!"
    });
    
    this.createComment({
      postId: post3.id,
      userId: user1.id,
      text: "Amazing shot! Which city is this?"
    });
    
    // Create sample likes
    this.createLike({ postId: post1.id, userId: user2.id });
    this.createLike({ postId: post1.id, userId: user3.id });
    this.createLike({ postId: post1.id, userId: user5.id });
    
    this.createLike({ postId: post2.id, userId: user1.id });
    this.createLike({ postId: post2.id, userId: user3.id });
    this.createLike({ postId: post2.id, userId: user4.id });
    this.createLike({ postId: post2.id, userId: user5.id });
    this.createLike({ postId: post2.id, userId: user6.id });
    
    this.createLike({ postId: post3.id, userId: user1.id });
    this.createLike({ postId: post3.id, userId: user2.id });
    this.createLike({ postId: post3.id, userId: user5.id });
    this.createLike({ postId: post3.id, userId: user6.id });
    
    // Create sample follows
    this.createFollow({ followerId: user1.id, followingId: user2.id });
    this.createFollow({ followerId: user1.id, followingId: user3.id });
    this.createFollow({ followerId: user1.id, followingId: user4.id });
    
    this.createFollow({ followerId: user2.id, followingId: user1.id });
    this.createFollow({ followerId: user2.id, followingId: user4.id });
    
    this.createFollow({ followerId: user3.id, followingId: user1.id });
    this.createFollow({ followerId: user3.id, followingId: user5.id });
    
    this.createFollow({ followerId: user4.id, followingId: user1.id });
    this.createFollow({ followerId: user4.id, followingId: user2.id });
    this.createFollow({ followerId: user4.id, followingId: user6.id });
    
    this.createFollow({ followerId: user5.id, followingId: user3.id });
    
    this.createFollow({ followerId: user6.id, followingId: user4.id });
    
    // Create sample stories
    this.createStory({ userId: user1.id });
    this.createStory({ userId: user2.id });
    this.createStory({ userId: user3.id });
    this.createStory({ userId: user4.id });
    this.createStory({ userId: user5.id });
    this.createStory({ userId: user6.id });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date().toISOString();
    const newUser: User = { ...user, id, createdAt: now };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Post operations
  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async getPostsByUserId(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
  
  async getExplorePosts(searchTerm?: string): Promise<Post[]> {
    let posts = Array.from(this.posts.values());
    
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      posts = posts.filter(post => {
        const user = this.users.get(post.userId);
        return post.caption.toLowerCase().includes(term) || 
               user?.username.toLowerCase().includes(term) ||
               user?.fullName.toLowerCase().includes(term);
      });
    }
    
    return posts.sort(() => Math.random() - 0.5); // Random order for explore page
  }
  
  async createPost(post: InsertPost): Promise<Post> {
    const id = this.postId++;
    const now = new Date().toISOString();
    const newPost: Post = { ...post, id, createdAt: now };
    this.posts.set(id, newPost);
    return newPost;
  }
  
  // Comment operations
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const now = new Date().toISOString();
    const newComment: Comment = { ...comment, id, createdAt: now };
    this.comments.set(id, newComment);
    return newComment;
  }
  
  // Like operations
  async getLikesByPostId(postId: number): Promise<Like[]> {
    return Array.from(this.likes.values())
      .filter(like => like.postId === postId);
  }
  
  async createLike(like: InsertLike): Promise<Like> {
    // Check if like already exists
    const existingLike = Array.from(this.likes.values()).find(
      l => l.userId === like.userId && l.postId === like.postId
    );
    
    if (existingLike) {
      return existingLike;
    }
    
    const id = this.likeId++;
    const now = new Date().toISOString();
    const newLike: Like = { ...like, id, createdAt: now };
    this.likes.set(id, newLike);
    return newLike;
  }
  
  async deleteLike(userId: number, postId: number): Promise<void> {
    const like = Array.from(this.likes.values()).find(
      l => l.userId === userId && l.postId === postId
    );
    
    if (like) {
      this.likes.delete(like.id);
    }
  }
  
  // Follow operations
  async getFollowersByUserId(userId: number): Promise<Follow[]> {
    return Array.from(this.follows.values())
      .filter(follow => follow.followingId === userId);
  }
  
  async getFollowingByUserId(userId: number): Promise<Follow[]> {
    return Array.from(this.follows.values())
      .filter(follow => follow.followerId === userId);
  }
  
  async createFollow(follow: InsertFollow): Promise<Follow> {
    // Check if follow already exists
    const existingFollow = Array.from(this.follows.values()).find(
      f => f.followerId === follow.followerId && f.followingId === follow.followingId
    );
    
    if (existingFollow) {
      return existingFollow;
    }
    
    const id = this.followId++;
    const now = new Date().toISOString();
    const newFollow: Follow = { ...follow, id, createdAt: now };
    this.follows.set(id, newFollow);
    return newFollow;
  }
  
  async deleteFollow(followerId: number, followingId: number): Promise<void> {
    const follow = Array.from(this.follows.values()).find(
      f => f.followerId === followerId && f.followingId === followingId
    );
    
    if (follow) {
      this.follows.delete(follow.id);
    }
  }
  
  // Story operations
  async getStories(): Promise<Story[]> {
    return Array.from(this.stories.values())
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
  
  async getStoriesByUserId(userId: number): Promise<Story[]> {
    return Array.from(this.stories.values())
      .filter(story => story.userId === userId)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
  
  async createStory(story: InsertStory): Promise<Story> {
    const id = this.storyId++;
    const now = new Date().toISOString();
    const newStory: Story = { ...story, id, createdAt: now };
    this.stories.set(id, newStory);
    return newStory;
  }
  
  // Story view operations
  async getStoryViewsByStoryId(storyId: number): Promise<StoryView[]> {
    return Array.from(this.storyViews.values())
      .filter(view => view.storyId === storyId);
  }
  
  async createStoryView(storyView: InsertStoryView): Promise<StoryView> {
    // Check if view already exists
    const existingView = Array.from(this.storyViews.values()).find(
      v => v.storyId === storyView.storyId && v.userId === storyView.userId
    );
    
    if (existingView) {
      return existingView;
    }
    
    const id = this.storyViewId++;
    const now = new Date().toISOString();
    const newStoryView: StoryView = { ...storyView, id, createdAt: now };
    this.storyViews.set(id, newStoryView);
    return newStoryView;
  }
}

export const storage = new MemStorage();
