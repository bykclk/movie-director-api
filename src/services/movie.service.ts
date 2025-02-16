import { Movie, IMovie } from "../models/movie.model";
import { CacheService } from "./cache.service";

const cacheService = CacheService.getInstance("movie");

export class MovieService {
  // Create a new movie
  static async createMovie(movieData: Partial<IMovie>): Promise<IMovie> {
    const movie = new Movie(movieData);
    const savedMovie = await movie.save();
    try {
      await cacheService.publishCacheClear();
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
    return savedMovie;
  }

  // Get all movies with populated director
  static async getAllMovies(): Promise<IMovie[]> {
    const cacheKey = "all-movies";
    try {
      const cachedMovies = await cacheService.get<IMovie[]>(cacheKey);
      if (cachedMovies) {
        return cachedMovies;
      }
    } catch (error) {
      console.error("Error getting from cache:", error);
    }

    const movies = await Movie.find()
      .populate("director", "firstName lastName")
      .sort({ title: 1 });

    try {
      await cacheService.set(cacheKey, movies);
    } catch (error) {
      console.error("Error setting cache:", error);
    }
    return movies;
  }

  // Get movie by ID with populated director
  static async getMovieById(id: string): Promise<IMovie | null> {
    const cacheKey = `movie-${id}`;
    try {
      const cachedMovie = await cacheService.get<IMovie>(cacheKey);
      if (cachedMovie) {
        return cachedMovie;
      }
    } catch (error) {
      console.error("Error getting from cache:", error);
    }

    const movie = await Movie.findById(id).populate(
      "director",
      "firstName lastName",
    );

    if (movie) {
      try {
        await cacheService.set(cacheKey, movie);
      } catch (error) {
        console.error("Error setting cache:", error);
      }
    }
    return movie;
  }

  // Update movie
  static async updateMovie(
    id: string,
    movieData: Partial<IMovie>,
  ): Promise<IMovie | null> {
    const movie = await Movie.findByIdAndUpdate(id, movieData, {
      new: true,
      runValidators: true,
    }).populate("director", "firstName lastName");

    if (movie) {
      try {
        await cacheService.publishCacheClear();
      } catch (error) {
        console.error("Error clearing cache:", error);
      }
    }
    return movie;
  }

  // Delete movie
  static async deleteMovie(id: string): Promise<IMovie | null> {
    const movie = await Movie.findByIdAndDelete(id);
    if (movie) {
      try {
        await cacheService.publishCacheClear();
      } catch (error) {
        console.error("Error clearing cache:", error);
      }
    }
    return movie;
  }

  // Search movies by title or director name
  static async searchMovies(query: string): Promise<IMovie[]> {
    const cacheKey = `search-${query}`;
    try {
      const cachedResults = await cacheService.get<IMovie[]>(cacheKey);
      if (cachedResults) {
        return cachedResults;
      }
    } catch (error) {
      console.error("Error getting from cache:", error);
    }

    const searchRegex = new RegExp(query, "i");
    const movies = await Movie.find({
      $or: [
        { title: searchRegex },
        { "director.firstName": searchRegex },
        { "director.lastName": searchRegex },
      ],
    })
      .populate("director", "firstName lastName")
      .sort({ title: 1 });

    try {
      await cacheService.set(cacheKey, movies);
    } catch (error) {
      console.error("Error setting cache:", error);
    }
    return movies;
  }

  // Get movies by director ID
  static async getMoviesByDirector(directorId: string): Promise<IMovie[]> {
    const cacheKey = `director-movies-${directorId}`;
    try {
      const cachedMovies = await cacheService.get<IMovie[]>(cacheKey);
      if (cachedMovies) {
        return cachedMovies;
      }
    } catch (error) {
      console.error("Error getting from cache:", error);
    }

    const movies = await Movie.find({ director: directorId })
      .populate("director", "firstName lastName")
      .sort({ releaseYear: -1 });

    try {
      await cacheService.set(cacheKey, movies);
    } catch (error) {
      console.error("Error setting cache:", error);
    }
    return movies;
  }

  // Get movies by genre
  static async getMoviesByGenre(genre: string): Promise<IMovie[]> {
    const cacheKey = `genre-movies-${genre}`;
    try {
      const cachedMovies = await cacheService.get<IMovie[]>(cacheKey);
      if (cachedMovies) {
        return cachedMovies;
      }
    } catch (error) {
      console.error("Error getting from cache:", error);
    }

    const movies = await Movie.find({ genre: genre })
      .populate("director", "firstName lastName")
      .sort({ rating: -1 });

    try {
      await cacheService.set(cacheKey, movies);
    } catch (error) {
      console.error("Error setting cache:", error);
    }
    return movies;
  }
}
