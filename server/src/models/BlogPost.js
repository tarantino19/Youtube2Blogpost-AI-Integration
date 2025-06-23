const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
	{
		heading: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		order: {
			type: Number,
			default: 0,
		},
	},
	{ _id: false }
);

const blogPostSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true,
	},
	videoUrl: {
		type: String,
		required: true,
	},
	videoId: {
		type: String,
		required: true,
		index: true,
	},
	videoTitle: {
		type: String,
		required: true,
	},
	videoThumbnail: {
		type: String,
	},
	videoDuration: {
		type: Number, // in seconds
	},
	videoChannel: {
		type: String,
	},
	transcript: {
		type: String,
		required: function () {
			return this.status === 'completed';
		},
	},
	generatedContent: {
		title: {
			type: String,
			required: function () {
				return this.status === 'completed';
			},
		},
		content: {
			type: String,
			required: function () {
				return this.status === 'completed';
			},
		},
		summary: {
			type: String,
		},
		tags: [
			{
				type: String,
				lowercase: true,
				trim: true,
			},
		],
		metaDescription: {
			type: String,
			maxlength: 160,
		},
		sections: [sectionSchema],
	},
	status: {
		type: String,
		enum: ['processing', 'completed', 'failed', 'draft'],
		default: 'processing',
		index: true,
	},
	error: {
		type: String,
	},
	wordCount: {
		type: Number,
		default: 0,
	},
	readingTime: {
		type: Number, // in minutes
		default: 0,
	},
	language: {
		type: String,
		default: 'en',
	},
	isPublished: {
		type: Boolean,
		default: false,
	},
	publishedAt: {
		type: Date,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		index: true,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Indexes for better query performance
blogPostSchema.index({ userId: 1, createdAt: -1 });
blogPostSchema.index({ userId: 1, videoId: 1 }, { unique: true });
blogPostSchema.index({ 'generatedContent.tags': 1 });

// Update the updatedAt timestamp before saving
blogPostSchema.pre('save', function (next) {
	this.updatedAt = Date.now();

	// Calculate word count and reading time
	if (this.generatedContent && this.generatedContent.content) {
		this.wordCount = this.generatedContent.content.split(/\s+/).length;
		this.readingTime = Math.ceil(this.wordCount / 200); // Average reading speed: 200 words/minute
	}

	// Set publishedAt when publishing
	if (this.isPublished && !this.publishedAt) {
		this.publishedAt = Date.now();
	}

	next();
});

// Virtual for formatted duration
blogPostSchema.virtual('formattedDuration').get(function () {
	if (!this.videoDuration) return '';

	const hours = Math.floor(this.videoDuration / 3600);
	const minutes = Math.floor((this.videoDuration % 3600) / 60);
	const seconds = this.videoDuration % 60;

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Method to get export data
blogPostSchema.methods.getExportData = function (format = 'markdown') {
	const data = {
		title: this.generatedContent.title,
		content: this.generatedContent.content,
		summary: this.generatedContent.summary,
		tags: this.generatedContent.tags,
		metaDescription: this.generatedContent.metaDescription,
		videoUrl: this.videoUrl,
		videoTitle: this.videoTitle,
		createdAt: this.createdAt,
		wordCount: this.wordCount,
		readingTime: this.readingTime,
	};

	if (format === 'html') {
		// Convert markdown to HTML (you might want to use a markdown parser)
		data.content = `<h1>${data.title}</h1>\n${data.content}`;
	}

	return data;
};

// Ensure virtuals are included in JSON
blogPostSchema.set('toJSON', {
	virtuals: true,
	transform: function (doc, ret) {
		delete ret.__v;
		return ret;
	},
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
