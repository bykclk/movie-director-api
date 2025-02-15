import { Request, Response, NextFunction } from "express";
import { DirectorService } from "../services/director.service";

export class DirectorController {
  // Create director
  static async createDirector(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const director = await DirectorService.createDirector(req.body);
      res.status(201).json({
        success: true,
        data: director,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all directors
  static async getAllDirectors(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const directors = await DirectorService.getAllDirectors();
      res.status(200).json({
        success: true,
        data: directors,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get director by ID
  static async getDirectorById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const director = await DirectorService.getDirectorById(req.params.id);
      if (!director) {
        res.status(404).json({
          success: false,
          message: "Director not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: director,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update director
  static async updateDirector(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const director = await DirectorService.updateDirector(
        req.params.id,
        req.body,
      );
      if (!director) {
        res.status(404).json({
          success: false,
          message: "Director not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: director,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete director
  static async deleteDirector(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const director = await DirectorService.deleteDirector(req.params.id);
      if (!director) {
        res.status(404).json({
          success: false,
          message: "Director not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Director deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Search directors
  static async searchDirectors(
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
      const directors = await DirectorService.searchDirectors(query);
      res.status(200).json({
        success: true,
        data: directors,
      });
    } catch (error) {
      next(error);
    }
  }
}
