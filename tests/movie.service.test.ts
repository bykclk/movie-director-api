import mongoose, { Types } from 'mongoose';
import { Movie, IMovie } from '../src/models/movie.model';
import { Director, IDirector } from '../src/models/director.model';

// Mock function declarations
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockPublishCacheClear = jest.fn();
const mockNatsPublish = jest.fn();
const mockNatsSubscribe = jest.fn();

// Mock NATS
jest.mock('../src/config/nats', () => ({
  __esModule: true,
  getNatsClient: jest.fn(() => ({
    publish: mockNatsPublish,
    subscribe: mockNatsSubscribe,
  })),
}));

// Mock CacheService
jest.mock('../src/services/cache.service', () => ({
  CacheService: {
    getInstance: jest.fn(() => ({
      get: mockGet,
      set: mockSet,
      publishCacheClear: mockPublishCacheClear,
    })),
  },
}));

// Import after mocks
import { MovieService } from '../src/services/movie.service';

describe('MovieService', () => {
  let testDirector: IDirector & { _id: Types.ObjectId };

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-director-test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  beforeEach(async () => {
    await Movie.deleteMany({});
    await Director.deleteMany({});

    // Create a test director for all tests to use
    testDirector = await Director.create({
      firstName: 'Test',
      lastName: 'Director',
      birthDate: new Date('1970-01-01'),
      biography: 'Test Biography',
    }) as IDirector & { _id: Types.ObjectId };

    // Reset mock functions
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await Movie.deleteMany({});
    await Director.deleteMany({});
  });

  describe('createMovie', () => {
    it('should create a new movie with valid data', async () => {
      const movieData = {
        title: 'Test Movie',
        director: testDirector._id,
        releaseYear: 2020,
        genre: ['Drama'] as string[],
        duration: 120,
        description: 'Test Description',
        rating: 8.5,
      };

      const movie = await MovieService.createMovie(movieData);

      expect(movie).toBeDefined();
      expect(movie.title).toBe(movieData.title);
      expect(movie.director.toString()).toBe(testDirector._id.toString());
      expect(movie.releaseYear).toBe(movieData.releaseYear);
      expect(movie.genre).toEqual(expect.arrayContaining(movieData.genre));
      expect(movie.duration).toBe(movieData.duration);
      expect(movie.description).toBe(movieData.description);
      expect(movie.rating).toBe(movieData.rating);
    });

    it('should create a movie with multiple genres', async () => {
      const movieData = {
        title: 'Multi-Genre Movie',
        director: testDirector._id,
        releaseYear: 2020,
        genre: ['Drama', 'Action', 'Thriller'] as string[],
        duration: 150,
        description: 'Test Description',
        rating: 9.0,
      };

      const movie = await MovieService.createMovie(movieData);
      expect(movie.genre).toHaveLength(3);
      expect(movie.genre).toEqual(expect.arrayContaining(movieData.genre));
    });

    it('should fail to create movie without required fields', async () => {
      const invalidMovieData: Partial<IMovie> = {
        title: 'Invalid Movie',
      };

      await expect(MovieService.createMovie(invalidMovieData)).rejects.toThrow();
    });
  });

  describe('getMovieById', () => {
    it('should return null for non-existent movie', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const movie = await MovieService.getMovieById(nonExistentId.toString());
      expect(movie).toBeNull();
    });

    it('should return movie by ID with populated director', async () => {
      const createdMovie = await Movie.create({
        title: 'Test Movie',
        director: testDirector._id,
        releaseYear: 2020,
        genre: ['Drama'],
        duration: 120,
        description: 'Test Description',
        rating: 8.5,
      }) as IMovie & { _id: Types.ObjectId };

      const movie = await MovieService.getMovieById(createdMovie._id.toString());
      expect(movie).toBeDefined();
      expect(movie?.title).toBe(createdMovie.title);
      expect(movie?.director).toBeDefined();
      if (
        movie?.director &&
        typeof movie.director === 'object' &&
        '_id' in movie.director &&
        movie.director._id instanceof Types.ObjectId
      ) {
        expect(movie.director._id.toString()).toBe(testDirector._id.toString());
      }
    });
  });

  describe('updateMovie', () => {
    it('should update movie with valid data', async () => {
      const movie = await Movie.create({
        title: 'Original Title',
        director: testDirector._id,
        releaseYear: 2020,
        genre: ['Drama'],
        duration: 120,
        description: 'Original Description',
        rating: 8.5,
      }) as IMovie & { _id: Types.ObjectId };

      const updateData: Partial<IMovie> = {
        title: 'Updated Title',
        description: 'Updated Description',
        rating: 9.0,
      };

      const updatedMovie = await MovieService.updateMovie(movie._id.toString(), updateData);
      expect(updatedMovie).toBeDefined();
      expect(updatedMovie?.title).toBe(updateData.title);
      expect(updatedMovie?.description).toBe(updateData.description);
      expect(updatedMovie?.rating).toBe(updateData.rating);
      // Original data should remain unchanged
      expect(updatedMovie?.director).toBeDefined();
      expect(updatedMovie?.releaseYear).toBe(movie.releaseYear);
    });

    it('should return null when updating non-existent movie', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData: Partial<IMovie> = {
        title: 'Updated Title',
      };

      const result = await MovieService.updateMovie(nonExistentId.toString(), updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteMovie', () => {
    it('should delete existing movie', async () => {
      const movie = await Movie.create({
        title: 'Movie to Delete',
        director: testDirector._id,
        releaseYear: 2020,
        genre: ['Drama'],
        duration: 120,
        description: 'Test Description',
        rating: 8.5,
      }) as IMovie & { _id: Types.ObjectId };

      const deletedMovie = await MovieService.deleteMovie(movie._id.toString());
      expect(deletedMovie).toBeDefined();
      expect(deletedMovie?.title).toBe(movie.title);

      // Verify movie is actually deleted
      const findMovie = await Movie.findById(movie._id);
      expect(findMovie).toBeNull();
    });

    it('should return null when deleting non-existent movie', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const result = await MovieService.deleteMovie(nonExistentId.toString());
      expect(result).toBeNull();
    });
  });

  describe('searchMovies', () => {
    beforeEach(async () => {
      await Movie.create([
        {
          title: 'The Test Movie',
          director: testDirector._id,
          releaseYear: 2020,
          genre: ['Drama'],
          duration: 120,
          description: 'First Test Description',
          rating: 8.5,
        },
        {
          title: 'Another Movie',
          director: testDirector._id,
          releaseYear: 2021,
          genre: ['Action'],
          duration: 130,
          description: 'Second Test Description',
          rating: 7.5,
        },
        {
          title: 'Third Test Film',
          director: testDirector._id,
          releaseYear: 2022,
          genre: ['Drama', 'Action'],
          duration: 140,
          description: 'Third Test Description',
          rating: 9.0,
        },
      ]);
    });

    it('should find movies by title search', async () => {
      const movies = await MovieService.searchMovies('Test');
      expect(movies).toHaveLength(2);
      expect(movies.map(m => m.title)).toEqual(
        expect.arrayContaining(['The Test Movie', 'Third Test Film'])
      );
    });

    it('should return empty array for no matches', async () => {
      const movies = await MovieService.searchMovies('NonExistent');
      expect(movies).toHaveLength(0);
    });
  });

  describe('getMoviesByDirector', () => {
    beforeEach(async () => {
      const anotherDirector = await Director.create({
        firstName: 'Another',
        lastName: 'Director',
        birthDate: new Date('1980-01-01'),
        biography: 'Another Biography',
      }) as IDirector & { _id: Types.ObjectId };

      await Movie.create([
        {
          title: 'Director One Movie 1',
          director: testDirector._id,
          releaseYear: 2020,
          genre: ['Drama'],
          duration: 120,
          description: 'Description One',
          rating: 8.5,
        },
        {
          title: 'Director One Movie 2',
          director: testDirector._id,
          releaseYear: 2021,
          genre: ['Action'],
          duration: 130,
          description: 'Description Two',
          rating: 7.5,
        },
        {
          title: 'Director Two Movie',
          director: anotherDirector._id,
          releaseYear: 2022,
          genre: ['Drama'],
          duration: 140,
          description: 'Description Three',
          rating: 9.0,
        },
      ]);
    });

    it('should return all movies by a specific director', async () => {
      const movies = await MovieService.getMoviesByDirector(testDirector._id.toString());
      expect(movies).toHaveLength(2);
      movies.forEach(movie => {
        expect(movie.director).toBeDefined();
        if (
          movie.director &&
          typeof movie.director === 'object' &&
          '_id' in movie.director &&
          movie.director._id instanceof Types.ObjectId
        ) {
          expect(movie.director._id.toString()).toBe(testDirector._id.toString());
        }
      });
    });

    it('should return empty array for director with no movies', async () => {
      const newDirector = await Director.create({
        firstName: 'New',
        lastName: 'Director',
        birthDate: new Date('1990-01-01'),
        biography: 'New Biography',
      }) as IDirector & { _id: Types.ObjectId };

      const movies = await MovieService.getMoviesByDirector(newDirector._id.toString());
      expect(movies).toHaveLength(0);
    });
  });

  describe('getMoviesByGenre', () => {
    beforeEach(async () => {
      await Movie.create([
        {
          title: 'Drama Movie',
          director: testDirector._id,
          releaseYear: 2020,
          genre: ['Drama'],
          duration: 120,
          description: 'Drama Description',
          rating: 8.5,
        },
        {
          title: 'Action Movie',
          director: testDirector._id,
          releaseYear: 2021,
          genre: ['Action'],
          duration: 130,
          description: 'Action Description',
          rating: 7.5,
        },
        {
          title: 'Mixed Genre Movie',
          director: testDirector._id,
          releaseYear: 2022,
          genre: ['Drama', 'Action'],
          duration: 140,
          description: 'Mixed Description',
          rating: 9.0,
        },
      ]);
    });

    it('should return all movies of a specific genre', async () => {
      const dramaMovies = await MovieService.getMoviesByGenre('Drama');
      expect(dramaMovies).toHaveLength(2);
      dramaMovies.forEach(movie => {
        expect(movie.genre).toContain('Drama');
      });
    });

    it('should return empty array for non-existent genre', async () => {
      const movies = await MovieService.getMoviesByGenre('NonExistentGenre');
      expect(movies).toHaveLength(0);
    });
  });

  describe('getAllMovies', () => {
    beforeEach(async () => {
      // Create another test director
      const anotherDirector = await Director.create({
        firstName: 'Another',
        lastName: 'Director',
        birthDate: new Date('1980-01-01'),
        biography: 'Another Biography',
      });

      // Create test movies
      await Movie.create([
        {
          title: 'A Test Movie',
          director: testDirector._id,
          releaseYear: 2020,
          genre: ['Drama'],
          duration: 120,
          description: 'First Description',
          rating: 8.5,
        },
        {
          title: 'B Test Movie',
          director: anotherDirector._id,
          releaseYear: 2021,
          genre: ['Action'],
          duration: 130,
          description: 'Second Description',
          rating: 7.5,
        },
        {
          title: 'C Test Movie',
          director: testDirector._id,
          releaseYear: 2022,
          genre: ['Drama', 'Action'],
          duration: 140,
          description: 'Third Description',
          rating: 9.0,
        },
      ]);
    });

    it('should return all movies sorted by title', async () => {
      const movies = await MovieService.getAllMovies();
      
      expect(movies).toHaveLength(3);
      expect(movies[0].title).toBe('A Test Movie');
      expect(movies[1].title).toBe('B Test Movie');
      expect(movies[2].title).toBe('C Test Movie');
    });

    it('should populate director information correctly', async () => {
      const movies = await MovieService.getAllMovies();
      
      movies.forEach(movie => {
        expect(movie.director).toBeDefined();
        if (movie.director && typeof movie.director === 'object') {
          expect(movie.director._id).toBeDefined();
        }
      });
    });

    it('should return empty array when no movies exist', async () => {
      await Movie.deleteMany({}); // Clear all movies
      const movies = await MovieService.getAllMovies();
      expect(movies).toHaveLength(0);
    });

    it('should include all movie fields in the response', async () => {
      const movies = await MovieService.getAllMovies();
      
      movies.forEach(movie => {
        expect(movie).toHaveProperty('title');
        expect(movie).toHaveProperty('releaseYear');
        expect(movie).toHaveProperty('genre');
        expect(movie).toHaveProperty('duration');
        expect(movie).toHaveProperty('description');
        expect(movie).toHaveProperty('rating');
        expect(Array.isArray(movie.genre)).toBe(true);
        expect(typeof movie.duration).toBe('number');
        expect(typeof movie.rating).toBe('number');
      });
    });
  });

  describe('Cache Operations', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should handle cache errors gracefully when getting movies', async () => {
      mockGet.mockRejectedValue(new Error('Cache error'));

      const movies = await MovieService.getAllMovies();
      
      expect(movies).toBeDefined();
      expect(Array.isArray(movies)).toBeTruthy();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle cache errors gracefully when setting movies', async () => {
      mockSet.mockRejectedValue(new Error('Cache error'));
      mockGet.mockResolvedValue(null);

      // Create a test movie but prefix with underscore since we don't use it directly
      const _movie = await Movie.create({
        title: 'Test Movie',
        director: testDirector._id,
        releaseYear: 2020,
        genre: ['Drama'],
        duration: 120,
        description: 'Test Description',
        rating: 8.5,
      });

      const movies = await MovieService.getAllMovies();
      
      expect(movies).toBeDefined();
      expect(Array.isArray(movies)).toBeTruthy();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle cache clear errors gracefully', async () => {
      mockPublishCacheClear.mockRejectedValue(new Error('Cache clear error'));

      const movieData = {
        title: 'New Movie',
        director: testDirector._id,
        releaseYear: 2020,
        genre: ['Drama'],
        duration: 120,
        description: 'New Description',
        rating: 8.5,
      };

      const createdMovie = await MovieService.createMovie(movieData);
      
      expect(createdMovie).toBeDefined();
      expect(createdMovie.title).toBe(movieData.title);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate all related caches when updating a movie', async () => {
      const movie = await Movie.create({
        title: 'Original Movie',
        director: testDirector._id,
        releaseYear: 2020,
        genre: ['Drama'],
        duration: 120,
        description: 'Original Description',
        rating: 8.5,
      }) as IMovie & { _id: Types.ObjectId };

      await MovieService.updateMovie(movie._id.toString(), { title: 'Updated Movie' });

      expect(mockPublishCacheClear).toHaveBeenCalled();
      const publishCalls = mockPublishCacheClear.mock.calls;
      expect(publishCalls.length).toBeGreaterThanOrEqual(1);
    });

    it('should invalidate genre-specific cache when movie genre is updated', async () => {
      const movie = await Movie.create({
        title: 'Genre Movie',
        director: testDirector._id,
        releaseYear: 2020,
        genre: ['Drama'],
        duration: 120,
        description: 'Genre Description',
        rating: 8.5,
      }) as IMovie & { _id: Types.ObjectId };

      await MovieService.updateMovie(movie._id.toString(), { 
        genre: ['Action', 'Thriller']
      });

      expect(mockPublishCacheClear).toHaveBeenCalled();
    });

    it('should invalidate director-specific cache when movie director is updated', async () => {
      const newDirector = await Director.create({
        firstName: 'New',
        lastName: 'Director',
        birthDate: new Date('1990-01-01'),
        biography: 'New Biography',
      }) as IDirector & { _id: Types.ObjectId };

      const movie = await Movie.create({
        title: 'Director Movie',
        director: testDirector._id,
        releaseYear: 2020,
        genre: ['Drama'],
        duration: 120,
        description: 'Director Description',
        rating: 8.5,
      }) as IMovie & { _id: Types.ObjectId };

      await MovieService.updateMovie(movie._id.toString(), { 
        director: newDirector._id
      });

      expect(mockPublishCacheClear).toHaveBeenCalled();
    });
  });
});