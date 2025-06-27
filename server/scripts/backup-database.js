#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const config = require('../src/config/config');

const execAsync = promisify(exec);

async function createBackup() {
	try {
		console.log('🗄️  Creating database backup...');

		// Create backups directory if it doesn't exist
		const backupDir = path.join(__dirname, '..', 'backups');
		try {
			await fs.mkdir(backupDir, { recursive: true });
		} catch (err) {
			// Directory might already exist
		}

		// Generate backup filename with timestamp
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

		// Extract database name from URI
		const dbName = config.mongodb.uri.split('/').pop().split('?')[0];

		console.log(`📦 Backing up database: ${dbName}`);
		console.log(`💾 Backup file: ${backupFile}`);

		// Use mongoexport to create backup
		const collections = ['users', 'blogposts']; // Main collections
		const backupData = {};

		for (const collection of collections) {
			try {
				console.log(`📋 Exporting collection: ${collection}`);

				const command = `mongoexport --uri="${config.mongodb.uri}" --collection=${collection} --jsonArray`;
				const { stdout } = await execAsync(command);

				if (stdout.trim()) {
					backupData[collection] = JSON.parse(stdout);
					console.log(`✅ Exported ${backupData[collection].length} documents from ${collection}`);
				} else {
					backupData[collection] = [];
					console.log(`⚠️  Collection ${collection} is empty`);
				}
			} catch (error) {
				console.error(`❌ Failed to export ${collection}:`, error.message);
				backupData[collection] = [];
			}
		}

		// Save backup data
		await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));

		console.log(`✅ Backup created successfully: ${backupFile}`);

		// Clean up old backups (keep last 5)
		await cleanupOldBackups(backupDir);

		return backupFile;
	} catch (error) {
		console.error('❌ Backup failed:', error.message);
		throw error;
	}
}

async function cleanupOldBackups(backupDir) {
	try {
		const files = await fs.readdir(backupDir);
		const backupFiles = files
			.filter((file) => file.startsWith('backup-') && file.endsWith('.json'))
			.map((file) => ({
				name: file,
				path: path.join(backupDir, file),
				stat: null,
			}));

		// Get file stats
		for (const file of backupFiles) {
			try {
				file.stat = await fs.stat(file.path);
			} catch (err) {
				// Skip files we can't stat
			}
		}

		// Sort by creation time (newest first)
		const sortedFiles = backupFiles.filter((file) => file.stat).sort((a, b) => b.stat.mtime - a.stat.mtime);

		// Delete old backups (keep last 5)
		const filesToDelete = sortedFiles.slice(5);

		for (const file of filesToDelete) {
			try {
				await fs.unlink(file.path);
				console.log(`🗑️  Deleted old backup: ${file.name}`);
			} catch (err) {
				console.warn(`⚠️  Failed to delete ${file.name}:`, err.message);
			}
		}

		if (filesToDelete.length === 0) {
			console.log('📁 No old backups to clean up');
		}
	} catch (error) {
		console.warn('⚠️  Failed to clean up old backups:', error.message);
	}
}

async function restoreBackup(backupFile) {
	try {
		console.log(`🔄 Restoring backup from: ${backupFile}`);

		// Read backup data
		const backupData = JSON.parse(await fs.readFile(backupFile, 'utf-8'));

		// Extract database name from URI
		const dbName = config.mongodb.uri.split('/').pop().split('?')[0];

		for (const [collection, documents] of Object.entries(backupData)) {
			if (documents.length > 0) {
				console.log(`📋 Restoring collection: ${collection} (${documents.length} documents)`);

				// Create temporary file for import
				const tempFile = path.join(__dirname, `temp-${collection}.json`);
				await fs.writeFile(tempFile, JSON.stringify(documents, null, 2));

				try {
					const command = `mongoimport --uri="${config.mongodb.uri}" --collection=${collection} --file="${tempFile}" --jsonArray --drop`;
					await execAsync(command);
					console.log(`✅ Restored ${collection}`);
				} catch (error) {
					console.error(`❌ Failed to restore ${collection}:`, error.message);
				} finally {
					// Clean up temp file
					try {
						await fs.unlink(tempFile);
					} catch (err) {
						// Ignore cleanup errors
					}
				}
			}
		}

		console.log('✅ Backup restored successfully');
	} catch (error) {
		console.error('❌ Restore failed:', error.message);
		throw error;
	}
}

// CLI interface
if (require.main === module) {
	const command = process.argv[2];
	const arg = process.argv[3];

	if (command === 'create') {
		createBackup()
			.then((backupFile) => {
				console.log(`\n🎉 Backup complete: ${backupFile}`);
				process.exit(0);
			})
			.catch((error) => {
				console.error('\n💥 Backup failed:', error.message);
				process.exit(1);
			});
	} else if (command === 'restore' && arg) {
		restoreBackup(arg)
			.then(() => {
				console.log('\n🎉 Restore complete');
				process.exit(0);
			})
			.catch((error) => {
				console.error('\n💥 Restore failed:', error.message);
				process.exit(1);
			});
	} else {
		console.log(`
📋 Database Backup Utility

Usage:
  node scripts/backup-database.js create           Create a new backup
  node scripts/backup-database.js restore <file>   Restore from backup file

Examples:
  node scripts/backup-database.js create
  node scripts/backup-database.js restore backups/backup-2024-01-01T10-00-00-000Z.json

Note: This requires MongoDB tools (mongoexport/mongoimport) to be installed.
		`);
		process.exit(1);
	}
}

module.exports = { createBackup, restoreBackup };
