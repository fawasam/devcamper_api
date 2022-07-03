const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
dotenv.config();

const connectDB = require("./config/db");
//middleware
const logger = require("./middleware/logger");

//route files
const bootcamp = require("./routes/bootcamps");

//connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

//app use
app.use(express.json());
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

//Mount routes
app.use("/api/v1/bootcamps", bootcamp);

const server = app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`.yellow.bold);
});

//Handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  //close server & exit immediately
  server.close(() => process.exit(1));
});
