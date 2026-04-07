const mongoose = require('mongoose');

function envIsTruthy(name) {
  return /^(1|true|yes)$/i.test(String(process.env[name] ?? '').trim());
}

/** MongoDB field name left over from older schemas; not used by this API. */
const OBSOLETE_UID_FIELD = 'firebaseUid';

/**
 * Some MongoDB deployments still have a unique index on an obsolete optional UID
 * field (`firebaseUid` in the database). This app only persists phone/JWT users
 * and never sets that field, so multiple docs get null and inserts hit E11000.
 *
 * Drops index `firebaseUid_1` plus any other index whose key includes that field.
 */
async function dropObsoleteUidIndexes() {
  const db = mongoose.connection.db;

  const tryDropIndex = async (coll, indexName) => {
    try {
      await coll.dropIndex(indexName);
      console.log(`MongoDB: dropped obsolete index ${indexName}`);
    } catch (e) {
      if (e?.codeName === 'IndexNotFound' || e?.code === 27) return;
      if (e?.code === 26 || /ns does not exist/i.test(String(e?.message || ''))) {
        return;
      }
      console.warn(`MongoDB: could not drop index ${indexName}:`, e.message);
    }
  };

  try {
    const coll = db.collection('users');
    await tryDropIndex(coll, `${OBSOLETE_UID_FIELD}_1`);

    let indexes = [];
    try {
      indexes = await coll.indexes();
    } catch (e) {
      if (e?.code === 26 || /ns does not exist/i.test(String(e?.message || ''))) {
        return;
      }
      throw e;
    }

    for (const idx of indexes) {
      if (idx.name === '_id_') continue;
      const key = idx.key || {};
      if (!Object.prototype.hasOwnProperty.call(key, OBSOLETE_UID_FIELD)) continue;
      await tryDropIndex(coll, idx.name);
    }
  } catch (e) {
    if (e?.code === 26 || /ns does not exist/i.test(String(e?.message || ''))) {
      return;
    }
    console.error('MongoDB obsolete uid index cleanup:', e.message);
  }
}

async function unsetObsoleteUidField() {
  try {
    const coll = mongoose.connection.collection('users');
    const r = await coll.updateMany(
      { [OBSOLETE_UID_FIELD]: { $exists: true } },
      { $unset: { [OBSOLETE_UID_FIELD]: '' } }
    );
    if (r.modifiedCount > 0) {
      console.log(
        `MongoDB: removed obsolete ${OBSOLETE_UID_FIELD} from ${r.modifiedCount} user document(s)`
      );
    }
  } catch (e) {
    console.warn('MongoDB obsolete uid field cleanup:', e.message);
  }
}

const connectDB = async () => {
  let uri;

  if (envIsTruthy('MONGO_DEV_MEMORY')) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const memory = await MongoMemoryServer.create();
    uri = memory.getUri();
    console.log(
      'MongoDB: in-memory server (MONGO_DEV_MEMORY=1). Data is lost when the process exits.'
    );
  } else {
    uri = process.env.MONGODB_URI?.trim();
    if (!uri) {
      console.error(
        'MongoDB: MONGODB_URI is not set. Add it to .env (see .env.example), ' +
          'or set MONGO_DEV_MEMORY=1 for a local in-memory database (dev only).'
      );
      process.exit(1);
    }
  }

  const dbName = process.env.MONGODB_DB_NAME?.trim();

  try {
    const conn = await mongoose.connect(uri, {
      dbName: dbName || undefined,
      serverSelectionTimeoutMS: 10_000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    if (conn.connection.name) {
      console.log(`MongoDB database: ${conn.connection.name}`);
    }

    await dropObsoleteUidIndexes();
    await unsetObsoleteUidField();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (/bad auth|authentication failed/i.test(error.message)) {
      console.error(
        'Hint: Atlas "bad auth" means the username/password in MONGODB_URI is wrong or the user was deleted. ' +
          'Reset the database user password in Atlas (Database Access), URL-encode special characters in the password, ' +
          'or use local MongoDB: mongodb://127.0.0.1:27017/stj_db'
      );
    }
    process.exit(1);
  }
};

connectDB.dropObsoleteUidIndexes = dropObsoleteUidIndexes;
connectDB.OBSOLETE_UID_FIELD = OBSOLETE_UID_FIELD;
module.exports = connectDB;
