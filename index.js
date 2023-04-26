import express from "express";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import logger from "morgan";
import multer from "multer";

const upload = multer({ dest: "./public/upload" });
const router = express.Router();

const app = express();
const port = 5001;
// Bulid-In middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/static", express.static(path.join(__dirname, "public")));
// Application-level middleware
const loggerMiddleware = (req, res, next) => {
  console.log(`${new Date()} ---Request [${req.method} [${req.url}]]`);
  next();
};
app.use(loggerMiddleware);

//Third party middleware
app.use(logger("dev"));

// Router-level middleware functions
app.use("/api/users", router);
const fakeAuth = (req, res, next) => {
  const authStatus = true;
  if (authStatus) {
    console.log("User authStatus : ", authStatus);
    next();
  } else {
    res.status(401);
    throw new Error("User is not authorized");
  }
};

const getUsers = (req, res) => {
  res.json({ message: "Get all Users" });
};

const createUser = (req, res) => {
  res.json({ message: "create Users" });
};
router.use(fakeAuth);
router.route("/").get(getUsers).post(createUser);

// Error-handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  switch (statusCode) {
    case 401:
      res.json({
        title: "Unauthorized",
        message: err.message,
      });
      break;

    case 404:
      res.json({
        title: "Not Found",
        message: err.message,
      });
      break;

    case 500:
      res.json({
        title: "Server Error",
        message: err.message,
      });
      break;

    default:
      break;
  }
};

// end point for uploding
app.post(
  "/upload",
  upload.single("image"),
  (req, res, next) => {
    console.log("Upload function");
    console.log(req.file, req.body);
    res.send(req.file);
  },
  (err, req, res, next) => {
    res.status(400).send({ err: err.message });
  }
);

app.all("*", (req, res) => {
  res.status(404);
  throw new Error("Route not found");
});

app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server is Running at port ${port}`);
});
