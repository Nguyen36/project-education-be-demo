const { getAllCourses, getCourseById, updateStudentPaymentStatus } = require("../services/databaseService");

const updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { transaction_id } = req.body;

  if (!transaction_id) {
    return res.status(400).json({ message: "Transaction ID is required to update payment status." });
  }

  try {
    await updateStudentPaymentStatus(id, transaction_id);
    res.status(200).json({ message: "Payment status updated successfully."});
  } catch (error) {
    console.error(`Error updating payment status for course ${id}:`, error.message);
    res.status(500).json({ message: error.message || "Internal server error." });
  }
};
module.exports = {
  updatePaymentStatus,
};
