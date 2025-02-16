import { Schema, model, Document } from "mongoose";

export interface IDirector extends Document {
  firstName: string;
  lastName: string;
  birthDate: Date;
  biography: string;
  createdAt: Date;
  updatedAt: Date;
}

const directorSchema = new Schema<IDirector>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    birthDate: {
      type: Date,
      required: [true, "Birth date is required"],
    },
    biography: {
      type: String,
      required: [true, "Biography is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Virtual for full name
directorSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for improved search performance
directorSchema.index({ firstName: 1, lastName: 1 });

export const Director = model<IDirector>("Director", directorSchema);
