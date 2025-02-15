import { Director, IDirector } from "../models/director.model";

export class DirectorService {
  // Create a new director
  static async createDirector(
    directorData: Partial<IDirector>,
  ): Promise<IDirector> {
    const director = new Director(directorData);
    return await director.save();
  }

  // Get all directors
  static async getAllDirectors(): Promise<IDirector[]> {
    return await Director.find().sort({ firstName: 1, lastName: 1 });
  }

  // Get director by ID
  static async getDirectorById(id: string): Promise<IDirector | null> {
    return await Director.findById(id);
  }

  // Update director
  static async updateDirector(
    id: string,
    directorData: Partial<IDirector>,
  ): Promise<IDirector | null> {
    return await Director.findByIdAndUpdate(id, directorData, {
      new: true,
      runValidators: true,
    });
  }

  // Delete director
  static async deleteDirector(id: string): Promise<IDirector | null> {
    return await Director.findByIdAndDelete(id);
  }

  // Search directors by name
  static async searchDirectors(query: string): Promise<IDirector[]> {
    const searchRegex = new RegExp(query, "i");
    return await Director.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    }).sort({ firstName: 1, lastName: 1 });
  }
}
