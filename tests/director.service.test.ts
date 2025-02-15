import mongoose, { Types } from 'mongoose';
import { DirectorService } from '../src/services/director.service';
import { Director, IDirector } from '../src/models/director.model';
import { Movie } from '../src/models/movie.model';

describe('DirectorService', () => {
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
    await Director.deleteMany({});
    await Movie.deleteMany({});
  });

  afterEach(async () => {
    await Director.deleteMany({});
    await Movie.deleteMany({});
  });

  describe('createDirector', () => {
    it('should create a new director with valid data', async () => {
      const directorData: Partial<IDirector> = {
        firstName: 'Test',
        lastName: 'Director',
        birthDate: new Date('1970-01-01'),
        biography: 'Test Biography',
      };

      const director = await DirectorService.createDirector(directorData);

      expect(director).toBeDefined();
      expect(director.firstName).toBe(directorData.firstName);
      expect(director.lastName).toBe(directorData.lastName);
      expect(director.birthDate).toEqual(directorData.birthDate);
      expect(director.biography).toBe(directorData.biography);
    });

    it('should fail to create director without required fields', async () => {
      const invalidDirectorData: Partial<IDirector> = {
        firstName: 'Test',
      };

      await expect(DirectorService.createDirector(invalidDirectorData)).rejects.toThrow();
    });

    it('should create director with trimmed string fields', async () => {
      const directorData: Partial<IDirector> = {
        firstName: '  Test  ',
        lastName: '  Director  ',
        birthDate: new Date('1970-01-01'),
        biography: '  Test Biography  ',
      };

      const director = await DirectorService.createDirector(directorData);

      expect(director.firstName).toBe('Test');
      expect(director.lastName).toBe('Director');
      expect(director.biography).toBe('Test Biography');
    });
  });

  describe('getAllDirectors', () => {
    it('should return all directors sorted by firstName and lastName', async () => {
      const directors = [
        {
          firstName: 'Charlie',
          lastName: 'Director',
          birthDate: new Date('1970-01-01'),
          biography: 'Biography 1',
        },
        {
          firstName: 'Alice',
          lastName: 'Director',
          birthDate: new Date('1975-01-01'),
          biography: 'Biography 2',
        },
        {
          firstName: 'Bob',
          lastName: 'Director',
          birthDate: new Date('1980-01-01'),
          biography: 'Biography 3',
        },
      ];

      await Director.create(directors);

      const result = await DirectorService.getAllDirectors();
      expect(result).toHaveLength(3);
      expect(result[0].firstName).toBe('Alice');
      expect(result[1].firstName).toBe('Bob');
      expect(result[2].firstName).toBe('Charlie');
    });

    it('should return empty array when no directors exist', async () => {
      const directors = await DirectorService.getAllDirectors();
      expect(directors).toHaveLength(0);
    });
  });

  describe('getDirectorById', () => {
    it('should return null for non-existent director', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const director = await DirectorService.getDirectorById(nonExistentId.toString());
      expect(director).toBeNull();
    });

    it('should return director by ID', async () => {
      const createdDirector = await Director.create({
        firstName: 'Test',
        lastName: 'Director',
        birthDate: new Date('1970-01-01'),
        biography: 'Test Biography',
      }) as IDirector & { _id: Types.ObjectId };

      const director = await DirectorService.getDirectorById(createdDirector._id.toString());
      expect(director).toBeDefined();
      expect(director?.firstName).toBe(createdDirector.firstName);
      expect(director?.lastName).toBe(createdDirector.lastName);
    });
  });

  describe('updateDirector', () => {
    it('should update director with valid data', async () => {
      const director = await Director.create({
        firstName: 'Original',
        lastName: 'Name',
        birthDate: new Date('1970-01-01'),
        biography: 'Original Biography',
      }) as IDirector & { _id: Types.ObjectId };

      const updateData: Partial<IDirector> = {
        firstName: 'Updated',
        lastName: 'Name',
        biography: 'Updated Biography',
      };

      const updatedDirector = await DirectorService.updateDirector(director._id.toString(), updateData);
      expect(updatedDirector).toBeDefined();
      expect(updatedDirector?.firstName).toBe(updateData.firstName);
      expect(updatedDirector?.lastName).toBe(updateData.lastName);
      expect(updatedDirector?.biography).toBe(updateData.biography);
      // Original birthDate should remain unchanged
      expect(updatedDirector?.birthDate).toEqual(director.birthDate);
    });

    it('should return null when updating non-existent director', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData: Partial<IDirector> = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const result = await DirectorService.updateDirector(nonExistentId.toString(), updateData);
      expect(result).toBeNull();
    });

    it('should update with trimmed string fields', async () => {
      const director = await Director.create({
        firstName: 'Original',
        lastName: 'Name',
        birthDate: new Date('1970-01-01'),
        biography: 'Original Biography',
      }) as IDirector & { _id: Types.ObjectId };

      const updateData: Partial<IDirector> = {
        firstName: '  Updated  ',
        lastName: '  Name  ',
      };

      const updatedDirector = await DirectorService.updateDirector(director._id.toString(), updateData);
      expect(updatedDirector?.firstName).toBe('Updated');
      expect(updatedDirector?.lastName).toBe('Name');
    });
  });

  describe('deleteDirector', () => {
    it('should delete existing director', async () => {
      const director = await Director.create({
        firstName: 'Director',
        lastName: 'ToDelete',
        birthDate: new Date('1970-01-01'),
        biography: 'Test Biography',
      }) as IDirector & { _id: Types.ObjectId };

      const deletedDirector = await DirectorService.deleteDirector(director._id.toString());
      expect(deletedDirector).toBeDefined();
      expect(deletedDirector?.firstName).toBe(director.firstName);
      expect(deletedDirector?.lastName).toBe(director.lastName);

      // Verify director is actually deleted
      const findDirector = await Director.findById(director._id);
      expect(findDirector).toBeNull();
    });

    it('should return null when deleting non-existent director', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const result = await DirectorService.deleteDirector(nonExistentId.toString());
      expect(result).toBeNull();
    });
  });

  describe('searchDirectors', () => {
    beforeEach(async () => {
      await Director.create([
        {
          firstName: 'Martin',
          lastName: 'Scorsese',
          birthDate: new Date('1942-11-17'),
          biography: 'Famous director from New York',
        },
        {
          firstName: 'Christopher',
          lastName: 'Nolan',
          birthDate: new Date('1970-07-30'),
          biography: 'Known for complex narratives',
        },
        {
          firstName: 'Martin',
          lastName: 'McDonagh',
          birthDate: new Date('1970-03-26'),
          biography: 'Award-winning filmmaker',
        },
      ]);
    });

    it('should find directors by firstName or lastName search', async () => {
      const directors = await DirectorService.searchDirectors('Martin');
      expect(directors).toHaveLength(2);
      expect(directors.map(d => `${d.firstName} ${d.lastName}`)).toEqual(
        expect.arrayContaining(['Martin Scorsese', 'Martin McDonagh'])
      );
    });

    it('should return empty array for no matches', async () => {
      const directors = await DirectorService.searchDirectors('NonExistent');
      expect(directors).toHaveLength(0);
    });

    it('should be case insensitive', async () => {
      const directors = await DirectorService.searchDirectors('martin');
      expect(directors).toHaveLength(2);
    });

    it('should match partial names', async () => {
      const directors = await DirectorService.searchDirectors('Nol');
      expect(directors).toHaveLength(1);
      expect(`${directors[0].firstName} ${directors[0].lastName}`).toBe('Christopher Nolan');
    });
  });
}); 