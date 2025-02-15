# Movie Director API

A RESTful API service for managing movies and directors, built with Node.js (TypeScript), MongoDB, and Docker.

## Features

- RESTful API endpoints for movies and directors
- MongoDB database with Mongoose ODM
- TypeScript for type safety
- Docker containerization
- Swagger API documentation
- Redis caching (optional)
- Unit testing with Jest
- Clean architecture

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- MongoDB (if running locally)
- Redis (optional, for caching)

## Installation

1. Clone the repository:
```bash
git clone git@github.com:bykclk/movie-director-api.git
cd movie-director-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration.

## Running the Application

### Using Docker (Recommended)

```bash
docker-compose up
```

### Local Development

1. Start MongoDB locally
2. Start Redis (optional)
3. Run the development server:
```bash
npm run dev
```

## API Endpoints

### Movies
- `POST /api/v1/movies` - Create a movie
- `GET /api/v1/movies` - Get all movies
- `GET /api/v1/movies/:id` - Get movie by ID
- `PUT /api/v1/movies/:id` - Update movie
- `DELETE /api/v1/movies/:id` - Delete movie

### Directors
- `POST /api/v1/directors` - Create a director
- `GET /api/v1/directors` - Get all directors
- `GET /api/v1/directors/:id` - Get director by ID
- `PUT /api/v1/directors/:id` - Update director
- `DELETE /api/v1/directors/:id` - Delete director

## API Documentation

Access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

## Testing

Run the test suite:
```bash
npm test
```

## Project Structure

```
src/
├── controllers/    # Request handlers
├── services/      # Business logic
├── models/        # Database models
├── routes/        # API routes
├── middlewares/   # Custom middlewares
├── config/        # Configuration files
tests/             # Unit tests
docker/            # Docker configuration
```

## License

MIT 