import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let mongodInstance = null;
let activeStorageType = 'disconnected';

export const getDbStorageType = () => {
  if (mongoose.connection.readyState !== 1) return 'disconnected';
  return activeStorageType;
};

/**
 * Safely masks database credentials for logging
 */
export const maskMongoUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
};

/**
 * Derives connection options with safe timeouts and default dbName
 */
const getConnectOptions = (uri) => {
  const options = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  };

  try {
    const parsed = new URL(uri);
    // If user provided cluster URI without database name (e.g. mongodb+srv://cluster.../?retryWrites=true)
    if (!parsed.pathname || parsed.pathname === '/') {
      options.dbName = 'neighbourly';
    }
  } catch {
    if (!uri.includes('/neighbourly')) {
      options.dbName = 'neighbourly';
    }
  }

  return options;
};

export const connectDB = async () => {
  // If already connected, return active connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  let uri = env.MONGODB_URI;

  try {
    if (!uri && env.isDev) {
      if (!mongodInstance) {
        logger.info('MONGODB_URI not specified. Starting in-memory MongoDB for zero-config development...');
        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          mongodInstance = await MongoMemoryServer.create();
          uri = mongodInstance.getUri();
          logger.info(`In-memory MongoDB started at: ${uri}`);
        } catch (err) {
          logger.warn({ err }, 'Failed to start in-memory MongoDB. Falling back to default mongodb://127.0.0.1:27017/neighbourly');
          uri = 'mongodb://127.0.0.1:27017/neighbourly';
        }
      } else {
        uri = mongodInstance.getUri();
      }
    }

    if (!uri) {
      throw new Error('MONGODB_URI is required in production environment.');
    }

    const isAtlas = uri.startsWith('mongodb+srv://') || uri.includes('.mongodb.net');
    const connectOptions = getConnectOptions(uri);

    logger.info(`Connecting to MongoDB${isAtlas ? ' Atlas' : ''} (${maskMongoUri(uri)})...`);

    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, connectOptions);

    if (mongodInstance) {
      activeStorageType = 'in_memory_ephemeral';
    } else if (isAtlas) {
      activeStorageType = 'cloud_atlas';
    } else {
      activeStorageType = 'local_persistent';
    }

    logger.info(`MongoDB Connected successfully to ${mongoose.connection.host} [Database: ${mongoose.connection.name}, Mode: ${activeStorageType}]`);
    return mongoose.connection;
  } catch (error) {
    logger.error({ err: error.message }, 'MongoDB connection error');

    const isAtlas = uri && (uri.startsWith('mongodb+srv://') || uri.includes('.mongodb.net'));
    if (isAtlas) {
      logger.error('================================================================');
      logger.error(' MongoDB Atlas Connection Troubleshooting:');
      logger.error(' 1. Network Access: Ensure your current IP is whitelisted in Atlas:');
      logger.error('    MongoDB Atlas -> Network Access -> Add IP Address (or 0.0.0.0/0 for testing)');
      logger.error(' 2. User Credentials: Check database username and password in server/.env');
      logger.error(' 3. Special Characters: If your password has symbols like @, :, ?, URL-encode them');
      logger.error(' 4. Cluster Status: Check if the Atlas cluster is active and reachable');
      logger.error('================================================================');
    }

    // Only fallback to in-memory in dev if NO explicit URI was configured
    // This prevents silently discarding data when Atlas connection has an issue
    if (env.isDev && !env.MONGODB_URI && !mongodInstance) {
      try {
        logger.info('Attempting in-memory MongoDB fallback...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const fallbackUri = mongodInstance.getUri();
        await mongoose.connect(fallbackUri, { dbName: 'neighbourly' });
        activeStorageType = 'in_memory_ephemeral';
        logger.info(`MongoDB Connected via in-memory instance: ${fallbackUri} [Mode: in_memory_ephemeral]`);
        return mongoose.connection;
      } catch (fallbackError) {
        activeStorageType = 'disconnected';
        logger.error({ err: fallbackError.message }, 'Failed in-memory fallback connection');
        throw error;
      }
    }
    activeStorageType = 'disconnected';
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongodInstance) {
      await mongodInstance.stop();
      mongodInstance = null;
    }
    activeStorageType = 'disconnected';
    logger.info('MongoDB disconnected');
  } catch (err) {
    logger.error({ err: err.message }, 'Error disconnecting MongoDB');
  }
};

