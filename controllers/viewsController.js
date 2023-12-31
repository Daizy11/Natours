const Tour = require('../models/tourModels');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const booking = require('../models/bookingsModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  try {
    const tours = await Tour.find();
    //2, Build Template
    //3, Render that tamplate using tour data from 1

    res.status(200).render('overview', {
      title: 'The Forest Hiker Tour',
      tours,
      //1. GEt Tour Data Form collection
    });
  } catch (err) {
    console.log(err);
  }
});

exports.getTour = catchAsync(async (req, res, next) => {
  // get the data, for requested tour (include review and guide )

  // const tour = factory.getOne({slug:req.params.slug},{path:'reviews',field:'review rating user'})
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.login = (req, res) => {
  res.status(200).render('login', {
    title: 'log into your account',
  });
};

(exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
}),
  (exports.updateUserData = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).render('account', {
      title: 'Your account',
      user: user,
    });
  }));

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1. find all booking
  const bookings = await booking.find({ user: req.user.id });
  // 2. Find tours with return id
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } }); //select all tours that have an id in tourIDs array
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.alert = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successdull, please check your email for confirmation. If your booking doesn't show up immediateky, please come back later";
  
  next()
};
