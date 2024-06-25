import express, { json } from "express";
import connectionPool from "./utils/db.mjs";
require('dotenv').config();


const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;




const app = express();
const port = 4001;
app.use(express.json());


app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req, res) => {
  let results;
  try{
    results = await connectionPool.query(`SELECT * FROM assignments`);
  } catch(error) {
    return res.status(500).json({
       "message": "Server could not read assignment because database connection" 
      });
    }
  return res.status(200).json({
  data: results.rows
});
  });

app.get("/assignments/:assignmentId", async (req, res) => {
  //สร้างตัวแปลจากendpointขึ้นมาดึงข้อมูลจากเซิฟเวอด้วย req.params
  const reqFromUser = req.params.assignmentId;
    try{
  const results = await connectionPool.query(
    `SELECT * FROM assignments WHERE assignment_id = $1`
    ,[reqFromUser]
  );//เพิ่มconditional logicถาไม่พบข้อมูลให้แจ้งรหัส404
   if(!results.rows[0]){
    return res.status(404).json({ 
      "message": "Server could not find a requested assignment to update" });
  } 
    return res.status(200).json({
    data: results.rows[0],
  });
} catch(error) {
  return res.status(500).json({ "message": "Server could not read assignment because database connection" })
}
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;//สร้างตัวแปลดึงข้อมูลจากdb ใช้req.params
  try {
    const updatedAssignment = { ...req.body, updated_at: new Date() }; // สร้าง object ใหม่ updatedAssignment โดยเพิ่ม updated_at

    await connectionPool.query(
        `UPDATE assignments
 SET title = $2,
     content = $3,
     category = $4,
     length = $5,
     status = $6,
     updated_at = $7
 WHERE assignment_id = $1`,
          [
            assignmentId,
          updatedAssignment.title,
          updatedAssignment.content,
          updatedAssignment.category,
          updatedAssignment.length,
          updatedAssignment.status,
          updatedAssignment.updated_at
        ]
  );
      return res.status(200).json({ 
        "message": "Updated assignment sucessfully" });
      } catch(error) {
        console.error('Error updating assignment:', error);
      return res.status(500).json({ 
        "message": "Server could not update assignment because database connection" 
      });}
    });

    app.delete("/assignments/:assignmentId", async (req, res) => {
      const assignmentId = req.params.assignmentId; // ดึง assignmentId จาก req.params
    
      try {
        //  DELETE statement
        await connectionPool.query(
          `DELETE FROM assignments
           WHERE assignment_id = $1`,
          [assignmentId]
        );
    
        
        return res.status(200).json({ 
          message: "Deleted assignment successfully" 
        });
      } catch (error) {
        // Handle database error
        console.error('Error deleting assignment:', error);
        return res.status(500).json({ 
          message: "Server could not delete assignment because database connection" 
        });
      }
    });
    

 app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
