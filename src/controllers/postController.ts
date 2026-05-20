import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Post from '../models/Posts.js';

const parseTags = (tags: string | string[] = []) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim()).filter(Boolean);
  }

  return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
};

const isAdmin = (req: Request) => req.session.role === "admin";

const getAllPost = async (req: Request, res: Response) => {
  try {
    const allPost = await Post.find(
      { isPublished: true },
      {
        updatedAt: 0,
        createdAt: 0,
        isPublished: 0,
      }
    );
    res.status(200).json(allPost);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error!" });
  }
};

const getOnePost = async (req: Request, res: Response) => {
  const _id = req.params.post;
  if (!mongoose.isValidObjectId(_id)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    await Post.updateOne({ _id }, { $inc: { views: 1 } }); //updating views key whenever the route is fetched
    const getPost = await Post.findById(_id);
    if (!getPost) {
      return res.status(404).json({ message: "Post not found!" });
    }
    res.status(200).json(getPost);
  } catch (err) {
    console.log(err.message);
    res.status(404).json({ message: "Post Not Found!" });
  }
};

const createPost = async (req: Request, res: Response) => {
  const { title, content, tags } = req.body;

  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Forbidden!" });
  }

  if (!title || !content || !tags) {
    return res.status(400).json({ message: "title, content and tags are required" });
  }

  const newPost = new Post({
    title: title.trim(),
    content: content.trim(),
    author: req.session.fullName,
    tags: parseTags(tags),
    publishedAt: new Date(),
    isPublished: true,
  });

  try {
    const savePost = await newPost.save();
    return res.status(201).json(savePost);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const editPost = async (req: Request, res: Response) => {
  const id = req.params.post;
  const { title, content, tags } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    if (isAdmin(req)) {
      const updates: { title?: string; content?: string; tags?: string[]; updatedAt: Date } = {
        updatedAt: new Date(),
      };

      if (title) {
        updates.title = title.trim();
      }

      if (content) {
        updates.content = content.trim();
      }

      if (tags) {
        updates.tags = parseTags(tags);
      }

      const myPost = await Post.findByIdAndUpdate(id, updates, { new: true });
      if (!myPost) {
        return res.status(404).json({ message: "The post not found!" });
      }
      return res
        .status(200)
        .json({ message: "The changes has been made to the post" });
    }
    return res.status(403).json({ message: "Forbidden!" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error!" });
  }
};

const deletePost = async (req: Request, res: Response) => {
  const id = req.params.post;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    if (isAdmin(req)) {
      const deletedPost = await Post.findByIdAndDelete(id);
      if (!deletedPost) {
        return res.status(404).json({ message: "Post not found!" });
      }
      return res.status(200).json({ message: "Post has been deleted" });
    }
    res.status(403).json({ message: "Forbidden" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error!" });
  }
};

const likePost = async (req: Request, res: Response) => {
  const postId = req.params.post;
  const { userID } = req.session;
  if (!mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const myPost = await Post.findById(postId);
    if (!myPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (!userID) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const alreadyLiked = myPost.likedBy.includes(userID);
    if (alreadyLiked) {
      const index = myPost.likedBy.indexOf(userID);
      myPost.likedBy.splice(index, 1);
      myPost.likes--;
    } else {
      myPost.likedBy.push(userID);
      myPost.likes++;
    }
    await myPost.save();
    return res.status(200).json(myPost);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error!" });
  }
};

const createPostComment = async (req: Request, res: Response) => {
  const _id = req.params.post;
  const { text } = req.body;
  const { userID, role, user } = req.session;
  if (!mongoose.isValidObjectId(_id)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const post = await Post.findById(_id);
    if (!post) {
      return res.status(404).json({ error: "Post not found!" });
    }
    if (!text) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (!role || !userID || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    post.comments.push({
      _id: new mongoose.Types.ObjectId().toString(),
      text: text.trim(),
      author: user,
      role,
      userId: userID,
      createdTime: new Date(),
      editedAt: new Date(),
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error!" });
  }
};

const getPostComment = async (req: Request, res: Response) => {
  const { post } = req.params;
  if (!mongoose.isValidObjectId(post)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const allComments = await Post.findById(post, {
      comments: 1,
    });
    if (!allComments) {
      return res.status(404).json({ error: "Post not found!" });
    }
    if (allComments.comments.length === 0) {
      return res.status(404).json({ message: "No comments found!" });
    }
    res.status(200).json(allComments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error!" });
  }
};

const editPostComment = async (req: Request, res: Response) => {
  const { postId, commentId } = req.params;
  const { text } = req.body;
  if (!mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  if (!text) {
    return res.status(400).json({ message: "Comment text is required" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }
    const comment = post.comments.find((c) => c._id == commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found!" });
    }
    if (req.session.userID == comment.userId) {
      comment.text = text.trim();
      comment.editedAt = new Date();
      await post.save();
      return res.status(200).json({ message: "Comment Updated" });
    }
    res.status(403).json({ message: "Forbidden" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error!" });
  }
};

const deletePostComment = async (req: Request, res: Response) => {
  const { postId, commentId } = req.params;
  if (!mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }
    const comment = post.comments.find((c) => c._id == commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found!" });
    }
    if (req.session.userID == comment.userId || isAdmin(req)) {
      post.comments = post.comments.filter((c) => c._id != commentId);
      await post.save();
      return res.status(200).json({ message: "Comment has been deleted" });
    }
    return res.status(403).json({ message: "Forbidden!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error!" });
  }
};

const notFound = (req: Request, res: Response) => {
  res.status(404).json({ message: "404 Page/Path Not Found!" });
};

export {
  getAllPost,
  getOnePost,
  createPost,
  editPost,
  deletePost,
  likePost,
  createPostComment,
  getPostComment,
  editPostComment,
  deletePostComment,
  notFound,
};
