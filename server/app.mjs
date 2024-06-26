import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  const newAssignment = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
  };
  if (
    !newAssignment.title ||
    !newAssignment.content ||
    !newAssignment.category
  ) {
    return res.status(404).json({
      message: "missing data from client",
    });
  }
  try {
    await connectionPool.query(
      `insert into assignments (user_id, title, content, category, length, status, created_at, updated_at, published_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        1,
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.content.length,
        newAssignment.status,
        newAssignment.created_at,
        newAssignment.updated_at,
        newAssignment.published_at,
      ]
    );
    return res.status(200).json({
      message: "create assignment successfully",
    });
  } catch (e) {
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }
});

app.get("/assignments", async (req, res) => {
  try {
    const result = await connectionPool.query("select * from assignments");
    return res.status(200).json({
      data: result.rows,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.get("/assignments/:assignmentsId", async (req, res) => {
  const assignmentsId = req.params.assignmentsId;

  try {
    const result = await connectionPool.query(
      `select * from assignments where assignment_id=$1`,
      [assignmentsId]
    );
    if (!result.rows.length) {
      return res
        .status(404)
        .json({ message: "Server could not find a requested assignment" });
    }

    return res.status(200).json({
      data: result.rows,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const editAssignment = {
    ...req.body,
    updated_at: new Date(),
  };
  const assignmentId = req.params.assignmentId;

  try {
    const result = await connectionPool.query(
      `update assignments set title=$2, content=$3, category=$4, length=$5, status=$6, updated_at=$7 where assignment_id=$1`,
      [
        assignmentId,
        editAssignment.title,
        editAssignment.content,
        editAssignment.category,
        editAssignment.content.length,
        editAssignment.status,
        editAssignment.updated_at,
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }
    return res.status(200).json({ message: "Updated assignment sucessfully" });
  } catch (e) {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;
  console.log(assignmentId);
  let result;
  try {
    result = await connectionPool.query(
      `delete from assignments where assignment_id=$1`,
      [assignmentId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }

    return res.status(200).json({ message: "Deleted assignment sucessfully" });
  } catch (e) {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
