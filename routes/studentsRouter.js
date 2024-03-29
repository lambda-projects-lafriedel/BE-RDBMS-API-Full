const express = require("express");
const knex = require("knex");
const knexConfig = require("../knexfile");
const router = express.Router();

const db = knex(knexConfig.development);

const errors = {
  "19": "A record with that name already exists.",
  default_error: "There was an error."
};

// POST to /api/students
router.post("/", async (req, res) => {
  try {
    const [id] = await db("students").insert(req.body);
    res.status(201).json(id);
  } catch (error) {
    const errorMsg = errors[error.errno] || errors["default_error"];
    res.status(500).json(errorMsg);
  }
});

// GET To /api/students
router.get("/", async (req, res) => {
  try {
    const students = await db("students");
    res.status(200).json(students);
  } catch (error) {
    const errorMsg = errors[error.errno] || errors["default_error"];
    res.status(500).json(errorMsg);
  }
});

// GET to /api/students/:id
router.get("/:id", async (req, res) => {
  try {
    const student = await db("students")
      .join("cohorts", "cohorts.id", "students.cohort_id")
      .select("students.id", "students.name", "cohorts.name as cohort")
      .where("students.id", req.params.id);

    if (student.length > 0) {
      const [reqStudent] = student;
      res.status(200).json(reqStudent);
    } else {
      res
        .status(404)
        .json({
          error: `A student with an ID of ${req.params.id} does not exist.`
        });
    }
  } catch (error) {
    const errorMsg = errors[error.errno] || errors["default_error"];
    res.status(500).json(errorMsg);
  }
});

// PUT to /api/students/:id
router.put("/:id", async (req, res) => {
  try {
    const num = await db("students")
      .where("id", req.params.id)
      .update(req.body);
    if (num > 0) {
      const [student] = await db("students").where("id", req.params.id);
      res.status(200).json(student);
    } else {
      res
        .status(404)
        .json({
          error: `A student with an ID of ${req.params.id} does not exist.`
        });
    }
  } catch (error) {
    const errorMsg = errors[error.errno] || errors["default_error"];
    res.status(500).json(errorMsg);
  }
});

// DELETE to /api/students/:id
router.delete("/:id", async (req, res) => {
  try {
    const student = await db("students")
      .where("id", req.params.id)
      .del();
    if (student > 0) {
      res.status(204).end();
    } else {
      res
        .status(404)
        .json({
          error: `A student with an ID of ${req.params.id} does not exist.`
        });
    }
  } catch (error) {
    const errorMsg = errors[error.errno] || errors["default_error"];
    res.status(500).json(errorMsg);
  }
});

module.exports = router;
