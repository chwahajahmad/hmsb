let mysql = require("mysql");
let express = require("express");
let cors = require("cors");
let bodyParser = require("body-parser");
let sqlStr = require("sqlstring");
app = express();
let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "hospital",
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
con.connect(err => {
  if (err) throw err;
  console.log("Connected!");
});

app.get("/getDoctorsData", cors(), (req, res) => {
  let sql = "select * from doctor";

  con.query(sql, (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/getPatientsData", cors(), (req, res) => {
  let sql = "select * from patient";

  con.query(sql, (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});
app.get("/getPatientsData/:pId", cors(), (req, res) => {
  let sql = `select * from patient where pid = ${req.params.pId}`;

  con.query(sql, (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});
app.post("/insertAppointmentData", cors(), (req, res) => {
  let data = req.body;
  console.log("App Time" + req.body.appTime);
  let isoDate = new Date(req.body.appDate);

  isoDate = isoDate.toJSON().slice(0, 10).replace("T", " ");

  let isoTime = new Date(req.body.appTime);

  isoTime = isoTime.toJSON().slice(12, 19);

  let sql =
    `insert into appointments(doctorId,patientId,appDate,appTime) values (${data.doctorId},${data.patientId},` +
    sqlStr.escape(isoDate) +
    `,` +
    sqlStr.escape(isoTime) +
    ");";
  con.query(sql, (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/todaysAppointments", cors(), (req, res) => {
  let date = new Date();
  date = date.toJSON().slice(0, 10);
  let sql =
    `select a.appDate,a.appTime,id as "key", d.fname as dfname,d.lname as dlname,p.fname as pfname,p.Lname as plname from appointments a inner join doctor d on a.doctorId = d.Did inner join patient p on a.patientId = p.Pid where CURDATE() = ` +
    sqlStr.escape(date);
  con.query(sql, (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/dashboardStats", cors(), (req, res) => {
  let data = [];
  let sql = "SELECT count(*) as pCount FROM patient";

  const getData = sql => {
    return new Promise((resolve, reject) => {
      con.query(sql, (err, result, fields) => {
        if (err) throw err;
        data[0] = { ...data[0], ...result[0] };
        console.log(data);
        resolve(result);
      });
    });
  };

  (async () => {
    await getData(sql);
    console.log("Data: " + data[0]);
  })();

  sql = "SELECT sum(total) as totalRevenue FROM `bill`";
  (async () => {
    await getData(sql);
    console.log("Data: " + data[0]);
  })();
  sql = "SELECT count(private_ward_id) as privateWard FROM `patient`";
  (async () => {
    await getData(sql);
    console.log("Data: " + data[0]);
  })();

  sql = "SELECT count(general_ward_id) as generalWard FROM `patient`";
  (async () => {
    await getData(sql);
    console.log("Data: " + data[0]);
  })();
  sql = "SELECT count(*) as dCount FROM `doctor`";
  (async () => {
    await getData(sql);
    console.log("Data: " + data[0]);
  })();

  sql = "SELECT count(*) as donorCount FROM `Donor`";
  (async () => {
    await getData(sql);
    console.log("Data: " + data[0]);
    res.send(data[0]);
  })();
});
app.listen("3001", () => {
  console.log("Connected at 3000");
});
