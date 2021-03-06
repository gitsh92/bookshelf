/* eslint-disable object-shorthand, func-names */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const BookSchema = new Schema(
  {
    _id: {
      type: Number
    },
    title: {
      type: String,
      required: [true, 'A title is required.']
    },
    image_url: String,
    authors: {
      type: [
        {
          name: {
            type: String,
            required: ['An author must have a name.']
          },
          role: String,
          authorId: Number,
          image_url: String,
          small_image_url: String
        }
      ],

      validate: {
        validator: function(arr) {
          return arr.length > 0;
        },
        message: 'At least 1 author is required.'
      }
    },

    ratings: {
      type: [
        {
          profileId: {
            type: Number,
            index: true,
            required: [true, 'A rating must have an associated profile.']
          },
          rating: {
            type: Number,
            enum: [1, 2, 3, 4, 5],
            required: [true, 'A rating must have a value.']
          }
        }
      ]
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

BookSchema.virtual('average_rating').get(function() {
  if (this.ratings.length === 0) return 0;

  return (
    this.ratings.reduce((acc, next) => {
      return acc + next.rating;
    }, 0) / this.ratings.length
  );
});
BookSchema.virtual('ratings_count').get(function() {
  return this.ratings.length;
});

BookSchema.statics.getAuthorRatingsData = function(authorId) {
  return this.aggregate([
    {
      $match: { 'authors.authorId': authorId }
    },
    {
      $addFields: {
        book_ratings_count: { $size: '$ratings' },
        book_average_rating: { $avg: '$ratings.rating' }
      }
    },
    {
      $group: {
        _id: null,
        author_ratings_count: { $sum: '$book_ratings_count' },
        author_average_rating: { $avg: '$book_average_rating' }
      }
    },

    {
      $project: {
        _id: 0,
        author_ratings_count: { $ifNull: ['$author_ratings_count', 0] },
        author_average_rating: { $ifNull: ['$author_average_rating', 0.0] }
      }
    }
  ]);
};

const Book = mongoose.model('Book', BookSchema);

module.exports = Book;
