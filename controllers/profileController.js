const Profile = require('../models/Profile');
const Book = require('../models/Book');
const catchAsync = require('../utils/asyncErrorWrapper');
const AppError = require('../utils/AppError');

// TODO: factor this out into a helper function to be exported into usersController
// OR work out a forwarding to this route
// OR use a mongoose middleware somehow
// a profile will be initialized on account registration

// exports.createProfile = catchAsync(async (req, res, next) => {
//   res.status(201).json();
// });

// @DESC: For fetching profiles by id. Returns any public profile, and returns a
// private profile if it belongs to the user or a friend of the user.
// @ACCESS: private
// @NB: Optional id param references either an auto-incrementing id field (which is not MongoDB's _id)
// or profile handle from the Profile model. The profile handle cannot begin with a digit, which is
// how we distinguish the parameter type.
// TODO: refactor into separate handlers based on profile fetch condition - use middleware to fork request
exports.getProfile = catchAsync(async (req, res, next) => {
  let profile;
  if (!req.params.id) {
    // user fetching own profile
    // console.log('here');
    profile = await Profile.findOne({
      user: req.user._id
    }).populate('books.bookId');
  } else {
    // fetching a profile by id.
    const nums = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
    // if regex matches, search profile by handle, else search by profile id
    if (!nums.has(req.params.id[0])) {
      // profile = await Profile.findOne({
      //   handle: req.params.id
      // });

      const reg = new RegExp(`^${req.params.id}$`, 'i');
      profile = await Profile.findOne({ handle: { $regex: reg } }).populate(
        'books.bookId'
      );
    } else {
      profile = await Profile.findOne({
        id: req.params.id
      }).populate('books.bookId');
    }

    if (!profile) {
      return next(new AppError('This profile does not exist.', 404));
    }

    // if not own profile
    if (!(profile.user.toString() === req.user.id)) {
      // TODO: check if it is a friend's profile, and if so, return it regardless

      if (!profile.isPublic) {
        return res.status(200).json({
          status: 'success',
          code: 'PRIVATE',
          message: 'This profile is private.',
          data: {
            profile: {
              isPublic: false,
              displayName: profile.displayName,
              handle: profile.handle,
              avatar: profile.avatar
            }
          }
        });
      }

      // remove userdata declared private
      // const profileJson = profile.toJSON();
      // console.log(profile._doc);
      Object.keys(profile._doc).forEach(k => {
        if (profile._doc[k].private) {
          delete profile._doc[k];
        }
      });

      delete profile._doc.friendRequests;
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      profile
    }
  });
});

exports.checkHandleAvailability = catchAsync(async (req, res) => {
  // handle async requests for cleared input field, shouldn't be needed since frontend cancels empty lookups
  if (!req.params.handle) {
    return res.status(200).json({
      status: 'fail'
    });
  }

  const reg = new RegExp(`^${req.params.handle}$`, 'i');
  const profile = await Profile.findOne({ handle: { $regex: reg } });
  const handleTaken = !!profile;

  res.status(200).json({
    status: 'success',
    data: {
      handleTaken
    }
  });
});

exports.getProfileByUserId = catchAsync(async (req, res, next) => {
  const profile = await Profile.findOne({
    user: req.params.userId
  });
  if (!profile) {
    return next(new AppError('No user owning this profile exists.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      profile
    }
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const updatedProfile = await Profile.findOneAndUpdate(
    {
      user: req.user._id
    },
    req.body,
    {
      runValidators: true,
      new: true
    }
  );
  if (!updatedProfile) {
    return next(
      new AppError('The user owning this profile no longer exists.', 404)
    );
  }

  const updatedUser = {
    ...req.user,
    profile: {
      ...req.user.profile._doc,
      handle: updatedProfile.handle
    }
  };

  res.status(200).json({
    status: 'success',
    // token,
    data: {
      user: updatedUser,
      profile: updatedProfile
    }
  });
});

/**
 * req.body arrives with a `shelf` key taking one of the following values
 * shelf: 'to-read',
 * shelf: 'reading',
 * shelf: 'read',
 * shelf: '' (used for clearing a book from its current shelf)
 *
 * A book's primary shelf field, if it is shelved, must be exactly one of
 * `to-read`, `reading`, or `read`.
 *
 * After adjusting the book's shelf, we must make sure it exists in the
 * Book collection.
 *
 */
exports.updateBookshelves = catchAsync(async (req, res, next) => {
  let profile;
  const bookId = +req.body.bookId;
  if (req.body.shelf === '') {
    profile = await Profile.findOneAndUpdate(
      {
        user: req.user._id,
        'books.bookId': bookId
      },
      {
        $pull: {
          books: {
            bookId
          }
        }
      },
      {
        runValidators: true
      }
    );
  } else {
    profile = await Profile.findOneAndUpdate(
      {
        user: req.user._id,
        'books.bookId': bookId
      },
      {
        $set: {
          'books.$.primaryShelf': req.body.shelf,
          'books.$.dateShelved': Date.now()
        }
      },
      {
        runValidators: true
      }
    );
    if (!profile)
      profile = await Profile.findOneAndUpdate(
        {
          user: req.user._id
        },
        {
          $push: {
            books: {
              bookId,
              primaryShelf: req.body.shelf
            }
          }
        },
        {
          runValidators: true
        }
      );
  }

  if (!(await Book.exists({ _id: bookId }))) {
    const book = {
      _id: bookId,
      title: req.body.title,
      authors: req.body.authors,
      image_url: req.body.image_url
    };
    await Book.create(book);
  }

  res.status(200).json({
    status: 'success'
  });
});

exports.handleRating = catchAsync(async (req, res) => {
  // update ratings in user profile
  // create book if it doesn't exist
  // update ratings on book
  // req.body.rating = 0 implies remove rating

  const bookId = +req.body.bookId;
  const rating = +req.body.rating;
  // const newRating = req.body.newRating;
  const removedRating = !rating; // no `rating` field or rating of 0 implies user revoked a rating

  const profile = await Profile.findOne({ user: req.user._id });
  const ix = profile.ratings.findIndex(r => r.bookId === bookId);

  if (ix !== -1) {
    // here if user updated a previous rating for the book
    if (removedRating) {
      profile.ratings.splice(ix, 1);
    } else {
      profile.ratings[ix].rating = rating;
    }
  } else if (!removedRating) {
    // here if user did not have a previous rating for the book
    profile.ratings.push({ bookId, rating });
  }
  await profile.save();
  // create book if it doesn't already exist
  if (!(await Book.exists({ _id: bookId }))) {
    if (!removedRating) {
      // remove this?
      const book = {
        _id: bookId,
        title: req.body.title,
        authors: req.body.authors,
        image_url: req.body.image_url,
        ratings: [
          {
            profileId: req.user.profile.id,
            rating
          }
        ]
      };

      await Book.create(book);
    }
  } else if (removedRating) {
    // book exists in db, this block handles removal of rating whether the user has rated it or not
    await Book.findByIdAndUpdate(bookId, {
      $pull: {
        ratings: {
          profileId: req.user.profile.id
        }
      }
    });
  } else {
    // else book exists, user has set a rating, to be patched in or pushed on to ratings array
    const updatedRating = await Book.findOneAndUpdate(
      { _id: bookId, 'ratings.profileId': req.user.profile.id },
      {
        $set: {
          'ratings.$.rating': rating
        }
      }
    );

    if (!updatedRating) {
      await Book.findOneAndUpdate(
        { _id: bookId },
        {
          $push: {
            ratings: {
              profileId: req.user.profile.id,
              rating
            }
          }
        }
      );
    }
  }

  res.status(200).json({ status: 'success' });
});

// // admin
// exports.updateProfileByUserId = catchAsync(async (req, res, next) => {
//   const updatedProfile = await Profile.findOneAndUpdate(
//     {
//       user: req.params.userId
//     },
//     req.body,
//     {
//       runValidators: true,
//       new: true
//     }
//   );
//   if (!updatedProfile) {
//     return next(
//       new AppError('The user owning this profile no longer exists.', 404)
//     );
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       profile: updatedProfile
//     }
//   });
// });

exports.sendFriendRequest = catchAsync(async (req, res) => {
  // add a Sent request to sender's friendRequests, and a Received request
  // to recipient's friendRequests

  const otherProfileId = +req.params.profileId; // number

  if (req.user.profile.id === otherProfileId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Users cannot friend themselves.'
    });
  }

  const updatedProfile = await Profile.findOneAndUpdate(
    { id: otherProfileId },
    {
      $addToSet: {
        friendRequests: {
          kind: 'Received',
          profile: req.user.profile._id
        }
      }
    }
  );

  if (!updatedProfile) {
    return res.status(404).json({
      status: 'fail',
      message: 'That profile does not exist.'
    });
  }

  await Profile.findByIdAndUpdate(req.user.profile._id, {
    $addToSet: {
      friendRequests: { kind: 'Sent', profile: updatedProfile._id }
    }
  });

  res.status(200).json({ status: 'success' });
});

exports.cancelFriendRequest = catchAsync(async (req, res) => {
  const otherProfile = await Profile.findOneAndUpdate(
    { id: +req.params.profileId },
    { $pull: { friendRequests: { profile: req.user.profile._id } } }
  );

  await Profile.findByIdAndUpdate(req.user.profile._id, {
    $pull: { friendRequests: { profile: otherProfile._id } }
  });

  res.status(200).json({ status: 'success' });
});

exports.acceptFriendRequest = catchAsync(async (req, res) => {
  // ensure outgoing friend request exists
  // remove outstanding friend request entries
  // add each profile to the other's friends list

  const otherProfile = await Profile.findOneAndUpdate(
    {
      id: +req.params.profileId,
      friendRequests: {
        $elemMatch: { kind: 'Sent', profile: req.user.profile._id }
      }
    },
    {
      $pull: { friendRequests: { profile: req.user.profile._id } },
      $push: { friends: req.user.profile._id }
    }
  );

  await Profile.findOneAndUpdate(
    {
      _id: req.user.profile._id,
      friendRequests: {
        $elemMatch: { kind: 'Received', profile: otherProfile._id }
      }
    },
    {
      $pull: { friendRequests: { profile: otherProfile._id } },
      $push: { friends: otherProfile._id }
    }
  );

  res.status(200).json({ status: 'success' });
});

exports.rejectFriendRequest = catchAsync(async (req, res) => {
  // const otherProfile = await Profile.findOneAndUpdate(
  //   {
  //     id: +req.params.profileId,
  //     friendRequests: {
  //       $elemMatch: { kind: 'Sent', profile: req.user.profile._id }
  //     }
  //   },
  //   {
  //     $pull: { friendRequests: { profile: req.user.profile._id } }
  //     // $push: { friends: req.user.profile._id }
  //   }
  // );

  const otherProfile = await Profile.findOne({
    id: +req.params.profileId
  });

  await Profile.findOneAndUpdate(
    {
      _id: req.user.profile._id,
      friendRequests: {
        $elemMatch: { kind: 'Received', profile: otherProfile._id }
      }
    },
    {
      $pull: { friendRequests: { profile: otherProfile._id } }
      // $push: { friends: otherProfile._id }
    }
  );

  res.status(200).json({ status: 'success' });
});

exports.removeFriend = catchAsync(async (req, res) => {
  const otherProfile = await Profile.findOneAndUpdate(
    {
      id: +req.params.profileId
    },
    {
      $pull: { friends: req.user.profile._id }
    }
  );

  await Profile.findOneAndUpdate(
    {
      _id: req.user.profile._id
    },
    {
      $pull: { friends: otherProfile._id }
    }
  );

  res.status(200).json({ status: 'success' });
});
