import { Movie, IMovie } from "../models/movie.model";

export class MovieService {
  // Create a new movie
  static async createMovie(movieData: Partial<IMovie>): Promise<IMovie> {
    const movie = new Movie(movieData);
    return await movie.save();
  }

  // Get all movies with populated director
  static async getAllMovies(): Promise<IMovie[]> {
    return await Movie.find()
      .populate("director", "firstName lastName")
      .sort({ title: 1 });
  }

  // Get movie by ID with populated director
  static async getMovieById(id: string): Promise<IMovie | null> {
    return await Movie.findById(id)
      .populate("director", "firstName lastName");
  }

  // Update movie
  static async updateMovie(
    id: string,
    movieData: Partial<IMovie>,
  ): Promise<IMovie | null> {
    return await Movie.findByIdAndUpdate(id, movieData, {
      new: true,
      runValidators: true,
    }).populate("director", "firstName lastName");
  }

  // Delete movie
  static async deleteMovie(id: string): Promise<IMovie | null> {
    return await Movie.findByIdAndDelete(id);
  }

  // Search movies by title or director name
  static async searchMovies(query: string): Promise<IMovie[]> {
    const searchRegex = new RegExp(query, "i");
    return await Movie.find({
      $or: [
        { title: searchRegex },
        { "director.firstName": searchRegex },
        { "director.lastName": searchRegex }
      ],
    })
      .populate("director", "firstName lastName")
      .sort({ title: 1 });
  }

  // Get movies by director ID
  static async getMoviesByDirector(directorId: string): Promise<IMovie[]> {
    return await Movie.find({ director: directorId })
      .populate("director", "firstName lastName")
      .sort({ releaseYear: -1 });
  }

  // Get movies by genre
  static async getMoviesByGenre(genre: string): Promise<IMovie[]> {
    return await Movie.find({ genre: genre })
      .populate("director", "firstName lastName")
      .sort({ rating: -1 });
  }
}
