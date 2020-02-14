// /* eslint-disable object-shorthand, func-names */
// const mongoose = require('mongoose');

// const { Schema } = mongoose;

// const SpoolBucketSchema = new Schema({
//   group: {
//     type: [Number],
//     required: [true, 'The spool group is required.']
//   },
//   profiles: [
//     {
//       profileId: {
//         type: Number,
//         required: [true, "Discussant's profile ID is required."]
//       },
//       profile: {
//         type: Schema.Types.ObjectId,
//         ref: 'Profile'
//       },
//       archived: {
//         displayName: {
//           type: String,
//           required: [true, "Discussant's display name must be archived."]
//         }
//       }
//     }
//   ],

//   seq: {
//     type: Number,
//     index: true,
//     unique: true,
//     required: [true, 'Bucket number is required.']
//   },

//   profileLinks: [Number], // delete bucket when this is empty, which implies deletion of the entire bucket chain

//   previousBucket: {
//     // to crawl backwards through discussion
//     type: Schema.Types.ObjectId,
//     ref: 'SpoolBucket',
//     default: null
//   },
//   dateBucketCreated: {
//     type: Date,
//     default: Date.now
//   },
//   messages: {
//     type: [
//       {
//         from: {
//           type: Number,
//           required: [true, "Sender's profile ID is required."]
//         },
//         subject: {
//           type: String,
//           trim: true,
//           maxlength: 256
//         },
//         body: {
//           type: String,
//           trim: true,
//           maxlength: 20000,
//           required: [true, 'A message body is required.']
//         },
//         dateCreated: {
//           type: Date,
//           default: Date.now
//           // index: true
//         }
//       }
//     ]
//   }
// });

// const SpoolBucket = mongoose.model('SpoolBucket', SpoolBucketSchema);

// module.exports = SpoolBucket;

/* eslint-disable object-shorthand, func-names */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const SpoolBucketSchema = new Schema({
  spoolGroup: {
    type: Schema.Types.ObjectId,
    ref: 'SpoolGroup',
    index: true,
    required: [true, 'The spool group reference is required.']
  },
  profiles: [
    {
      profileId: {
        type: Number,
        required: [true, "Discussant's profile ID is required."]
      },
      profile: {
        type: Schema.Types.ObjectId,
        ref: 'Profile'
      },
      archived: {
        displayName: {
          type: String,
          required: [true, "Discussant's display name must be archived."]
        }
      }
    }
  ],

  seq: {
    type: Number,
    index: true,
    unique: true,
    required: [true, 'Bucket number is required.']
  },

  previousBucket: {
    // to crawl backwards through discussion
    type: Schema.Types.ObjectId,
    ref: 'SpoolBucket',
    default: null
  },
  dateBucketCreated: {
    type: Date,
    default: Date.now
  },
  messages: {
    type: [
      {
        from: {
          type: Number,
          required: [true, "Sender's profile ID is required."]
        },
        subject: {
          type: String,
          trim: true,
          maxlength: 256
        },
        body: {
          type: String,
          trim: true,
          maxlength: 20000,
          required: [true, 'A message body is required.']
        },
        dateCreated: {
          type: Date,
          default: Date.now
          // index: true
        }
      }
    ]
  }
});

const SpoolBucket = mongoose.model('SpoolBucket', SpoolBucketSchema);

module.exports = SpoolBucket;
