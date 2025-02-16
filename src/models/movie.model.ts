import { Schema, model, Document, Types } from "mongoose";
import { IDirector } from "./director.model";

export interface IMovie extends Document {
  title: string;
  director: Types.ObjectId | IDirector;
  releaseYear: number;
  genre: string[];
  duration: number;
  description: string;
  imdbId: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
    },
    director: {
      type: Schema.Types.ObjectId,
      ref: "Director",
      required: [true, "Director is required"],
    },
    releaseYear: {
      type: Number,
      required: [true, "Release year is required"],
      min: [1888, "Release year must be after 1888"],
      max: [new Date().getFullYear(), "Release year cannot be in the future"],
    },
    genre: {
      type: [String],
      required: [true, "At least one genre is required"],
      validate: {
        validator: (value: string[]) =>
          Array.isArray(value) && value.length > 0,
        message: "At least one genre must be specified",
      },
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot be longer than 2000 characters"],
    },
    imdbId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^tt\d{7,8}$/, "Please enter a valid IMDB ID (e.g., tt1234567)"],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [0, "Rating must be between 0 and 10"],
      max: [10, "Rating must be between 0 and 10"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Index for improved query performance
movieSchema.index({ title: 1, releaseYear: 1 });
movieSchema.index({ director: 1 });

export const Movie = model<IMovie>("Movie", movieSchema);
