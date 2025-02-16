import { Router } from "express";
import { MovieController } from "../controllers/movie.controller";
import { body, param } from "express-validator";
import { validate } from "../middlewares/validation.middleware";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       required:
 *         - title
 *         - director
 *         - releaseYear
 *         - genre
 *         - duration
 *         - description
 *         - rating
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the movie
 *         title:
 *           type: string
 *           description: The title of the movie
 *         director:
 *           type: string
 *           description: The ID of the director
 *         releaseYear:
 *           type: number
 *           description: The year the movie was released
 *         genre:
 *           type: array
 *           items:
 *             type: string
 *           description: The genres of the movie
 *         duration:
 *           type: number
 *           description: The duration of the movie in minutes
 *         description:
 *           type: string
 *           description: A detailed description of the movie
 *         imdbId:
 *           type: string
 *           description: The IMDB ID of the movie (optional)
 *         rating:
 *           type: number
 *           description: The rating of the movie (0-10)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the movie was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the movie was last updated
 */

// Validation middleware
const createMovieValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("director").isMongoId().withMessage("Valid director ID is required"),
  body("releaseYear")
    .isInt({ min: 1888, max: new Date().getFullYear() })
    .withMessage(
      `Release year must be between 1888 and ${new Date().getFullYear()}`,
    ),
  body("genre")
    .isArray({ min: 1 })
    .withMessage("At least one genre is required"),
  body("genre.*").trim().notEmpty().withMessage("Genre cannot be empty"),
  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 minute"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 2000 })
    .withMessage("Description cannot be longer than 2000 characters"),
  body("imdbId")
    .optional()
    .trim()
    .matches(/^tt\d{7,8}$/)
    .withMessage("Please enter a valid IMDB ID (e.g., tt1234567)"),
  body("rating")
    .isFloat({ min: 0, max: 10 })
    .withMessage("Rating must be between 0 and 10"),
  validate,
];

const updateMovieValidation = [
  param("id").isMongoId().withMessage("Invalid movie ID"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),
  body("director")
    .optional()
    .isMongoId()
    .withMessage("Valid director ID is required"),
  body("releaseYear")
    .optional()
    .isInt({ min: 1888, max: new Date().getFullYear() })
    .withMessage(
      `Release year must be between 1888 and ${new Date().getFullYear()}`,
    ),
  body("genre")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one genre is required"),
  body("genre.*")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Genre cannot be empty"),
  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 minute"),
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty")
    .isLength({ max: 2000 })
    .withMessage("Description cannot be longer than 2000 characters"),
  body("imdbId")
    .optional()
    .trim()
    .matches(/^tt\d{7,8}$/)
    .withMessage("Please enter a valid IMDB ID (e.g., tt1234567)"),
  body("rating")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("Rating must be between 0 and 10"),
  validate,
];

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create a new movie
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       201:
 *         description: The movie was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 */
router.post("/", createMovieValidation, MovieController.createMovie);

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: List of all movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
router.get("/", MovieController.getAllMovies);

/**
 * @swagger
 * /movies/search:
 *   get:
 *     summary: Search movies by title
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query string
 *     responses:
 *       200:
 *         description: List of movies matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
router.get("/search", MovieController.searchMovies);

/**
 * @swagger
 * /movies/director/{directorId}:
 *   get:
 *     summary: Get movies by director ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: directorId
 *         schema:
 *           type: string
 *         required: true
 *         description: Director ID
 *     responses:
 *       200:
 *         description: List of movies by the specified director
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
router.get(
  "/director/:directorId",
  param("directorId").isMongoId().withMessage("Invalid director ID"),
  validate,
  MovieController.getMoviesByDirector,
);

/**
 * @swagger
 * /movies/genre/{genre}:
 *   get:
 *     summary: Get movies by genre
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: genre
 *         schema:
 *           type: string
 *         required: true
 *         description: Movie genre
 *     responses:
 *       200:
 *         description: List of movies in the specified genre
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
router.get("/genre/:genre", MovieController.getMoviesByGenre);

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Get movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Movie details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Movie not found
 */
router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid movie ID"),
  validate,
  MovieController.getMovieById,
);

/**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Update movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Movie ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       200:
 *         description: The movie was updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Movie not found
 */
router.put("/:id", updateMovieValidation, MovieController.updateMovie);

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Delete movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Movie was deleted successfully
 *       404:
 *         description: Movie not found
 */
router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid movie ID"),
  validate,
  MovieController.deleteMovie,
);

export default router;
