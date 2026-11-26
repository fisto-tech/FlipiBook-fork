const dns = require('dns');
const mongoose = require('mongoose');
global.mongoose = mongoose;

// Configure reliable public DNS servers for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (_) {}

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (isConnecting) return;

  try {
    isConnecting = true;
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('[Admin User Service] Warning: MONGO_URI not defined, running without DB connection.');
      isConnecting = false;
      return;
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });
    isConnecting = false;
    console.log(`[Admin User Service] MongoDB Connected: ${conn.connection.host}`);

    // Drop stale legacy unique indexes if they exist to prevent E11000 duplicate key errors
    try {
      // 1. Check adminroles collection
      const roleCols = await mongoose.connection.db.listCollections({ name: 'adminroles' }).toArray();
      if (roleCols.length > 0) {
        const indexes = await mongoose.connection.db.collection('adminroles').indexes();
        const roleIdIndex = indexes.find((idx) => idx.name === 'roleId_1');
        if (roleIdIndex) {
          await mongoose.connection.db.collection('adminroles').dropIndex('roleId_1');
          console.log('[Admin User Service] Successfully dropped stale legacy index: roleId_1 from adminroles');
        }
      }

      // 2. Check adminusers collection
      const userCols = await mongoose.connection.db.listCollections({ name: 'adminusers' }).toArray();
      if (userCols.length > 0) {
        const userIndexes = await mongoose.connection.db.collection('adminusers').indexes();
        const dropIndexIfExists = async (idxName) => {
          if (userIndexes.some((idx) => idx.name === idxName)) {
            await mongoose.connection.db.collection('adminusers').dropIndex(idxName);
            console.log(`[Admin User Service] Successfully dropped stale legacy index: ${idxName} from adminusers`);
          }
        };
        await dropIndexIfExists('userId_1');
        await dropIndexIfExists('email_1');

        // Clean up any duplicate Fist-O ADMIN documents keeping only one
        try {
          const adminDocs = await mongoose.connection.db
            .collection('adminusers')
            .find({
              $or: [
                { userid: { $regex: /^admin$/i } },
                { userId: { $regex: /^admin$/i } },
                { e_mailid: 'admin@flipibook.com' }
              ]
            })
            .sort({ _id: 1 })
            .toArray();

          if (adminDocs.length > 1) {
            // Keep the first document, delete the remaining duplicates
            const idsToDelete = adminDocs.slice(1).map((doc) => doc._id);
            await mongoose.connection.db
              .collection('adminusers')
              .deleteMany({ _id: { $in: idsToDelete } });
            console.log(`[Admin User Service] Cleaned up ${idsToDelete.length} duplicate ADMIN accounts from adminusers`);
          }
        } catch (cleanErr) {
          console.warn('[Admin User Service] Error cleaning duplicate admin accounts:', cleanErr.message);
        }
      }
    } catch (idxErr) {
      console.warn('[Admin User Service] Note on dropping legacy indexes:', idxErr.message);
    }
  } catch (error) {
    isConnecting = false;
    console.error(`[Admin User Service] Database connection error: ${error.message}`);
  }
};

mongoose.connection.on('disconnected', () => {
  isConnecting = false;
  console.warn('[Admin Service] MongoDB disconnected. Reconnecting in 3s...');
  setTimeout(connectDB, 3000);
});

module.exports = connectDB;
