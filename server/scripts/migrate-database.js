const mongoose = require('mongoose');
const config = require('../src/config/config');

async function migrateDatabase() {
    try {
        console.log('🔄 Starting database migration...');
        
        // Connect to test database first
        const testUri = config.mongodb.uri.replace('/yttotext', '/test');
        await mongoose.connect(testUri, config.mongodb.options);
        console.log('✅ Connected to test database');
        
        const testDb = mongoose.connection.db;
        
        // Get all collections from 'test' database
        const collections = await testDb.listCollections().toArray();
        console.log(`📋 Found ${collections.length} collections in 'test' database`);
        
        if (collections.length === 0) {
            console.log('ℹ️  No collections found in test database. Nothing to migrate.');
            await mongoose.disconnect();
            process.exit(0);
        }
        
        // Store all data from test database
        const allData = {};
        
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`📖 Reading collection: ${collectionName}`);
            
            const sourceCollection = testDb.collection(collectionName);
            const documents = await sourceCollection.find({}).toArray();
            allData[collectionName] = documents;
            
            console.log(`✅ Read ${documents.length} documents from ${collectionName}`);
        }
        
        // Disconnect from test database
        await mongoose.disconnect();
        console.log('🔌 Disconnected from test database');
        
        // Connect to yttotext database
        await mongoose.connect(config.mongodb.uri, config.mongodb.options);
        console.log('✅ Connected to yttotext database');
        
        const yttoTextDb = mongoose.connection.db;
        
        // Insert data into yttotext database
        for (const [collectionName, documents] of Object.entries(allData)) {
            if (documents.length > 0) {
                console.log(`🔄 Migrating ${documents.length} documents to ${collectionName}`);
                const targetCollection = yttoTextDb.collection(collectionName);
                await targetCollection.insertMany(documents);
                console.log(`✅ Migrated ${documents.length} documents to ${collectionName}`);
            }
        }
        
        console.log('🎉 Migration completed successfully!');
        console.log('');
        console.log('📝 Next steps:');
        console.log('1. Verify your data in the yttotext database');
        console.log('2. If everything looks good, you can drop the test database');
        console.log('3. Restart your server to use the yttotext database');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Add option to drop test database after migration
async function dropTestDatabase() {
    try {
        console.log('🗑️  Dropping test database...');
        
        const testUri = config.mongodb.uri.replace('/yttotext', '/test');
        await mongoose.connect(testUri, config.mongodb.options);
        const testDb = mongoose.connection.db;
        
        await testDb.dropDatabase();
        console.log('✅ Test database dropped successfully');
        
    } catch (error) {
        console.error('❌ Failed to drop test database:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// Command line arguments
const args = process.argv.slice(2);

if (args.includes('--drop-test')) {
    dropTestDatabase();
} else {
    migrateDatabase();
}