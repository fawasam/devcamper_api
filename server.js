const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
dotenv.config();

//middleware
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/error");

//route files
const bootcamp = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");

//connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

//app use
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  //   res.send("<h1>Hello world</h1> ");
  //   res.json({ name: "Brad" });
  //   res.sendStatus(400);
  //   res.status(400).json({ success: false });
  res.status(200).json({ success: true, data: { name: "Brad" } });
});

//Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File upload
app.use(fileUpload());

// SET STATIC FOLDER
app.use(express.static(path.join(__dirname, "public")));

//Mount routes
app.use("/api/v1/bootcamps", bootcamp);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);

//error middleware
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`.yellow.bold);
});

//Handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  //close server & exit immediately
  server.close(() => process.exit(1));
});
