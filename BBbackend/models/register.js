const mongoose = require("mongoose");

// create schema
const studentSchema = new mongoose.Schema({
  studentName: {
    type: String,
  },
  uid: {
    type: String,
    unique: true,
  },
  semester: {
    type: Number,
  },
  password: {
    type: String,
  },
});

//now need to crate a collection

const Register = new mongoose.model("RegisterStudent", studentSchema);

module.exports = Register;
