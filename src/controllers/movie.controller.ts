import { Request, Response, NextFunction } from "express";
import { MovieService } from "../services/movie.service";

export class MovieController {
  // Create movie
  static async createMovie(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const movie = await MovieService.createMovie(req.body);
      res.status(201).json({
        success: true,
        data: movie,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all movies
  static async getAllMovies(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const movies = await MovieService.getAllMovies();
      res.status(200).json({
        success: true,
        data: movies,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get movie by ID
  static async getMovieById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const movie = await MovieService.getMovieById(req.params.id);
      if (!movie) {
        res.status(404).json({
          success: false,
          message: "Movie not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: movie,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update movie
  static async updateMovie(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const movie = await MovieService.updateMovie(req.params.id, req.body);
      if (!movie) {
        res.status(404).json({
          success: false,
          message: "Movie not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: movie,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete movie
  static async deleteMovie(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const movie = await MovieService.deleteMovie(req.params.id);
      if (!movie) {
        res.status(404).json({
          success: false,
          message: "Movie not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Movie deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Search movies
  static async searchMovies(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { query } = req.query;
      if (typeof query !== "string") {
        res.status(400).json({
          success: false,
          message: "Search query is required",
        });
        return;
      }
      const movies = await MovieService.searchMovies(query);
      res.status(200).json({
        success: true,
        data: movies,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get movies by director
  static async getMoviesByDirector(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const movies = await MovieService.getMoviesByDirector(
        req.params.directorId,
      );
      res.status(200).json({
        success: true,
        data: movies,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get movies by genre
  static async getMoviesByGenre(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { genre } = req.params;
      const movies = await MovieService.getMoviesByGenre(genre);
      res.status(200).json({
        success: true,
        data: movies,
      });
    } catch (error) {
      next(error);
    }
  }
}
