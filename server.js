const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbInstance = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Root123!",
  database: "spanner_test_db",
});

dbInstance.connect((err) => {
  if (err) console.log(err);
  else console.log("database connected successfully...");
});

app.post("/create-shop-user", async (req, res) => {
  try {
    const { userName, password } = req.body;
    const shopId = `rmmmech-${Math.floor(1000 + Math.random() * 9000)}`;

    await new Promise((resolve, reject) => {
      dbInstance.query(
        `SELECT id FROM Mechanic WHERE name='${userName}' AND password = '${password}'`,
        (err, result) => {
          if (err) {
            reject({ status: 400, message: err });
          } else if (result[0]) {
            reject({ status: 400, message: "User already exsist" });
          } else {
            dbInstance.query(
              `INSERT INTO Mechanic (id, password, name, shopId) VALUES (DEFAULT, '${password}', '${userName}', '${shopId}')`,
              (creationRrr) => {
                if (creationRrr) {
                  reject({ status: 400, message: creationRrr });
                } else {
                  resolve();
                }
              }
            );
          }
        }
      );
    });

    return res.send({ status: 200, errorMessage: null });
  } catch (error) {
    return res.send({ status: 400, errorMessage: error.message });
  }
});

app.post("/shop-user-login", async (req, res) => {
  try {
    const { userName, password } = req.body;
    const { status, result } = await new Promise((resolve, reject) => {
      dbInstance.query(
        `SELECT id FROM Mechanic WHERE name = '${userName}' AND password='${password}'`,
        (err, result) => {
          if (err) {
            reject({ status: 400, message: err });
          } else if (!result || result.length == 0 || !result[0]) {
            reject({ status: 400, message: "can't get the user details" });
          } else {
            resolve({ status: 200, result: result[0] });
          }
        }
      );
    });

    return res.send({ status, result, errorMessage: null });
  } catch (error) {
    return res.send({ status: 400, errorMessage: error.message });
  }
});

app.get("/get-shop-user-data", async (req, res) => {
  try {
    const { id } = req.body;
    const { status, result } = await new Promise((resolve, reject) => {
      dbInstance.query(
        `SELECT * FROM Mechanic where id = ${id || null}`,
        (err, result) => {
          if (err) {
            reject({ status: 400, message: err });
          } else if (!result || result.length == 0 || !result[0]) {
            reject({ status: 400, message: "can't get the user details" });
          } else {
            resolve({ status: 200, result: result[0] });
          }
        }
      );
    });

    return res.send({ status, result, errorMessage: null });
  } catch (error) {
    return res.send({ status: 400, errorMessage: error?.message });
  }
});

app.post("/create-update-delete-work", async (req, res) => {
  try {
    const { id, name, isDelete = false } = req.body;

    const { status, result } = await new Promise((resolve, reject) => {
      if (isDelete && id) {
        dbInstance.query(
          `DELETE FROM Works WHERE id = ${id}`,
          (err, result) => {
            if (err) return reject({ status: 400, message: err });
            return resolve({ status: 200, result });
          }
        );
      } else if (id && name) {
        dbInstance.query(
          `UPDATE Works SET name = '${name}' WHERE id = ${id}`,
          (err, result) => {
            if (err) return reject({ status: 400, message: err });
            return resolve({ status: 200, result });
          }
        );
      } else {
        dbInstance.query(
          `INSERT INTO Works (id, name) VALUES (default, '${name}')`,
          (err, result) => {
            if (err) return reject({ status: 400, message: err });
            return resolve({ status: 200, result });
          }
        );
      }
    });

    return res.send({ status, result });
  } catch (error) {
    return res.send({ status: 400, errorMessage: error?.message });
  }
});

app.get("/get-all-works", async (req, res) => {
  try {
    const { status, result } = await new Promise((resolve, reject) => {
      dbInstance.query(`SELECT * FROM Works`, (err, result) => {
        if (err) return reject({ status: 400, message: err });
        return resolve({ status: 200, result });
      });
    });

    return res.send({ status, result });
  } catch (error) {
    return res.send({ status: 400, errorMessage: error?.message });
  }
});

// app.post("/create-service", async(req, res) => {
//     try {
//         const {
//             customerName, mobileNumber, bikeNumber, brand, model, color, year,
//             chassisNumber, bikeFrontImage, bikeBackImage, bikeLeftImage, bikeRightImage,
//             arrivalDate, estimatedDeliveryDate, actualDeliveryDate, status, remarks, paymentMethod,
//             amount, paymentStatus, advanceAmount, balanceAmount
//         } = req.body;
//         await new Promise((resolve, reject) => {
//             try {

//                 dbInstance.query(`SELECT id FROM Customer WHERE phoneNumber = '${mobileNumber}'`, (err, result) => {
//                     if(err) reject({ status: 400, message: err });
//                     else if(result?.[0]?.id) {

//                     } else {
//                         dbInstance.query('')
//                     }
//                 })
//             }catch(error) {
//                 return res.send({ status: 400, errorMessage: error?.message });
//             }
//         })
//     }catch(error) {
//         return res.send({ status: 400, errorMessage: error.message });
//     }
// });

// revert commit >>>>

app.listen(8080, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("server runing in 8080 port");
  }
});
