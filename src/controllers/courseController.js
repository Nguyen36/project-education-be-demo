const { getAllCourses, getCourseById,insertCourse } = require("../services/databaseService");

const getCourses = async (req, res) => {
  try {
    const courses = await getAllCourses();
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses for admin:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getCourseDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await getCourseById(id);
    if (course) {
      res.status(200).json(course);
    } else {
      res.status(404).json({ message: "Course not found." });
    }
  } catch (error) {
    console.error(`Error fetching course ${id} for admin:`, error);
    res.status(500).json({ message: "Internal server error." });
  }
};



const insertCourseController = async (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Name and price are required." });
  }

  try {
    const courseId = await insertCourse(name, price);
    res.status(200).json({ message: "Course inserted successfully", courseId });
  } catch (error) {
    console.error("Error inserting course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  insertCourseController,
  getCourses,
  getCourseDetails
};
