const express = require("express");
const router = express.Router();

// Health route
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Items routes
const itemsController = require("../controllers/itemsController");

router.get("/items", itemsController.getItems);
router.post("/items", itemsController.createItem);

// Admin routes
const courseController = require("../controllers/courseController");
const adminRouter = express.Router();
adminRouter.get("/courses", courseController.getCourses);
adminRouter.get("/courses/:id", courseController.getCourseDetails);
// adminRouter.post("/courses/:id/update-payment", courseController.updatePaymentStatus);
adminRouter.post("/courses/insert", courseController.insertCourseController);
router.use("/admin", adminRouter);

// Registration routes
const registrationRoutes = require("./registrationRoutes");
router.use("/", registrationRoutes);

module.exports = router;
