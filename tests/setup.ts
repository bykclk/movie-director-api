import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Increase timeout for async operations
jest.setTimeout(10000); 