const path = require("path");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  public

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // http://localhost:5000/api/v1/bootcamps?averageCost[lte]=10000&location.city=Kingston

  res.status(200).json(res.advancedResults);
});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  public

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Crete bootcamp
// @route   POST /api/v1/bootcamps
// @access  private

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Delete  bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  private

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  bootcamp.remove();
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get  bootcamp within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  private

exports.getBootcampInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //GET latitude and longitude from geocoder

  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //calc radius using radians
  //divide ditance by radius of earth
  //Earth Radius =3,963 mi / 6,378 km

  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc    Upload photo for  bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  private

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  // console.log(req.files.file);
  const file = req.files.file;

  // example file upload data
  //   {
  //   name: 'girl.jpg',
  //   data: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 01 00 48 00 48 00 00 ff e2 0c 58 49 43 43 5f 50 52 4f 46 49 4c 45 00 01 01 00 00 0c 48 4c 69 6e 6f 02 10 00 00 ... 54717 more bytes>,
  //   size: 54767,
  //   encoding: '7bit',
  //   tempFilePath: '',
  //   truncated: false,
  //   mimetype: 'image/jpeg',
  //   md5: '309207f742bb9b62d9602b12e63efafb',
  //   mv: [Function: mv]
  // }

  // make sure the images is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload a image file`, 400));
  }

  // CHECK FILESIZE
  if (file.size > process.env.MAX_PHOTO_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload a image less than ${process.env.MAX_PHOTO_UPLOAD}`,
        400
      )
    );
  }

  //create custome file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.PHOTO_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});

// @desc    Upload video for  bootcamp
// @route   PUT /api/v1/bootcamps/:id/video
// @access  private

exports.bootcampVideoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  const file = req.files.file;

  //example
  //   {
  //   name: 'VID_20220507_114151.mp4',
  //   data: <Buffer 00 00 00 18 66 74 79 70 6d 70 34 32 00 00 00 00 69 73 6f 6d 6d 70 34 32 00 00 09 4e 6d 6f 6f 76 00 00 00 6c 6d 76 68 64 00 00 00 00 de 9b be 2b de 9b ... 3151496 more bytes>,
  //   size: 3151546,
  //   encoding: '7bit',
  //   tempFilePath: '',
  //   truncated: false,
  //   mimetype: 'video/mp4',
  //   md5: '0ad65cbeb1583c79615763f5a373a3fe',
  //   mv: [Function: mv]
  // }

  // make sure the images is a photo
  if (!file.mimetype.startsWith("video")) {
    return next(new ErrorResponse(`Please upload a image file`, 400));
  }

  // // CHECK FILESIZE
  if (file.size > process.env.MAX_VIDEO_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload a image less than ${process.env.MAX_VIDEO_UPLOAD}`,
        400
      )
    );
  }

  // //create custome file name
  file.name = `video_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.VIDEO_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
