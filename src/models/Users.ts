import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/UserInterface.js";

const userSchema = new Schema<IUser>({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: [true, 'Username is Required!'],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is Required!"],
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is Required!"],
        min: 8,
        max: 128
    },
    role: {
        type: String,
        enum: ['user', 'admin'], default: 'user'
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
}); 

userSchema.pre<IUser>('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const User = model<IUser>('User', userSchema);

export default User;
