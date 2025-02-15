import { Router } from "express";
import { DirectorController } from "../controllers/director.controller";
import { body, param } from "express-validator";
import { validate } from "../middlewares/validation.middleware";

const router = Router();

// Validation middleware
const createDirectorValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("birthDate").isISO8601().withMessage("Valid birth date is required"),
  body("biography").trim().notEmpty().withMessage("Biography is required"),
  validate,
];

const updateDirectorValidation = [
  param("id").isMongoId().withMessage("Invalid director ID"),
  body("firstName").optional().trim().notEmpty().withMessage("First name cannot be empty"),
  body("lastName").optional().trim().notEmpty().withMessage("Last name cannot be empty"),
  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("Valid birth date is required"),
  body("biography")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Biography cannot be empty"),
  validate,
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Director:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - birthDate
 *         - biography
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the director
 *         firstName:
 *           type: string
 *           description: The first name of the director
 *         lastName:
 *           type: string
 *           description: The last name of the director
 *         birthDate:
 *           type: string
 *           format: date
 *           description: The birth date of the director
 *         biography:
 *           type: string
 *           description: The biography of the director
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the director was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the director was last updated
 */

/**
 * @swagger
 * /directors:
 *   post:
 *     summary: Create a new director
 *     tags: [Directors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Director'
 *     responses:
 *       201:
 *         description: The director was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Director'
 */
router.post("/", createDirectorValidation, DirectorController.createDirector);

/**
 * @swagger
 * /directors:
 *   get:
 *     summary: Get all directors
 *     tags: [Directors]
 *     responses:
 *       200:
 *         description: List of all directors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Director'
 */
router.get("/", DirectorController.getAllDirectors);

/**
 * @swagger
 * /directors/search:
 *   get:
 *     summary: Search directors by name
 *     tags: [Directors]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query string
 *     responses:
 *       200:
 *         description: List of directors matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Director'
 */
router.get("/search", DirectorController.searchDirectors);

/**
 * @swagger
 * /directors/{id}:
 *   get:
 *     summary: Get director by ID
 *     tags: [Directors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Director ID
 *     responses:
 *       200:
 *         description: Director details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Director'
 *       404:
 *         description: Director not found
 */
router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid director ID"),
  validate,
  DirectorController.getDirectorById,
);

/**
 * @swagger
 * /directors/{id}:
 *   put:
 *     summary: Update director by ID
 *     tags: [Directors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Director ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Director'
 *     responses:
 *       200:
 *         description: The director was updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Director'
 *       404:
 *         description: Director not found
 */
router.put("/:id", updateDirectorValidation, DirectorController.updateDirector);

/**
 * @swagger
 * /directors/{id}:
 *   delete:
 *     summary: Delete director by ID
 *     tags: [Directors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Director ID
 *     responses:
 *       200:
 *         description: Director was deleted successfully
 *       404:
 *         description: Director not found
 */
router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid director ID"),
  validate,
  DirectorController.deleteDirector,
);

export default router;
