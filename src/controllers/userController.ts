import bcrypt from 'bcrypt';
import User from '../models/Users.js';
import mongoose from 'mongoose';
import { Request, Response } from 'express';

const publicUserFields = {
  loginAttempts: 0,
  password: 0,
  createdAt: 0,
  updatedAt: 0,
  role: 0,
  email: 0,
  __v: 0,
};

const getUserControl = async (req: Request, res: Response) => {
  try {
    const allUsers = await User.find(
      {},
      {
        ...publicUserFields,
      }
    );
    if (allUsers.length === 0) {
      return res.status(404).json({ message: "No users found!" });
    }
    res.json(allUsers);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createUserControl = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, username } = req.body;

  if (!firstName || !lastName || !email || !password || !username) {
    return res.status(400).json({ message: "firstName, lastName, email, username and password are required" });
  }

  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: "Password must be between 8 and 128 characters" });
  }

  const newUser = new User({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password,
  });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    newUser.password = hashedPassword;
    await newUser.save();
    res
      .status(201)
      .json({ message: `User ${newUser.username} has been created.` });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email or username already exists" });
    }
    console.log(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOneUserControl = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const oneUser = await User.findOne(
      { _id: id },
      {
        ...publicUserFields,
      }
    );
    if (!oneUser) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).json(oneUser);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const editUserControl = async (req: Request, res: Response) => {
  const { firstName, lastName } = req.body;
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (req.session.role !== "admin" && req.session.userID != id) {
    return res.status(403).json({ message: "Forbidden!" });
  }

  if (!firstName && !lastName) {
    return res.status(400).json({ message: "Provide firstName or lastName to update" });
  }

  const updates: { firstName?: string; lastName?: string; updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (firstName) {
    updates.firstName = firstName.trim();
  }

  if (lastName) {
    updates.lastName = lastName.trim();
  }

  try {
    const updateOneUser = await User.findByIdAndUpdate(id, updates);
    if (!updateOneUser) {
      return res.status(404).json({ message: "User not found!" });
    }
    res
      .status(200)
      .json({ message: `Changes has been made to the user ${id}` });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUserControl = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    if (req.session.role === "admin" || req.session.userID == id) {
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found!" });
      }
      req.session.destroy((err) => {
        if (err) {
          console.log('unable to log out');          
          console.error(err);          
        }
      });
      return res
        .status(200)
        .json({ message: `User ${id} has been successfully deleted` });
    }
    return res.status(403).json({ message: "403! Forbidden!" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const auth = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    if (username && password) {
      const findUser = await User.findOne({ username: username.trim() });
      if (!findUser) {
        return res
          .status(400)
          .json({ message: "Invalid Username or Password" });
      }
      if (findUser.loginAttempts >= 10) {
        return res.status(400).json({
          message:
            "Account Locked, Max attempts reached, go to /help for more info",
        });
      }
      const comparePass = await bcrypt.compare(password, findUser.password);
      if (!comparePass) {
        findUser.loginAttempts += 1;
        await findUser.save();
        return res.status(400).json({ message: "Wrong username or password!" });
      }
      req.session.userID = findUser._id.toString();
      req.session.role = findUser.role;
      req.session.user = findUser.username;
      req.session.fullName = findUser.firstName + " " + findUser.lastName;
      findUser.loginAttempts = 0;
      await findUser.save();
      return res
        .status(200)
        .json({ message: `Logged in successfully. Hello ${findUser.username}` });
    } else {
      res.status(400).json({ message: "Username and password are required" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('unable to log out');          
      console.error(err);          
    }
  });
  res.redirect("/");
};

const notFound = (req: Request, res: Response) => {
  res.status(404).json({ message: "404 Page/Path Not Found!" });
};

export {
  getUserControl,
  createUserControl,
  getOneUserControl,
  editUserControl,
  deleteUserControl,
  auth,
  logout,
  notFound,
};
