const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const sqlStr = require("sqlstring");

app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//SQL DATABASE CREDENTIALS
let con = mysql.createConnection({
  host: "sql6.freemysqlhosting.net",
  user: "sql6422660",
  password: "CYJUL9iq3h",
  database: "sql6422660",
});

con.connect(err => {
  if (err) throw err;
  console.log("Connected with Database!");
});

//Get Requests
app.get("/getDoctorsData", cors(), (req, res) => {
  let sql = `select CONCAT(Fname," ", Lname) as name,pay,contact,Did as "key",d.depname from doctor inner join department d on d.deptId = doctor.deptid`;

  con.query(sql, (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/getDoctorsData/:did", cors(), (req, res) => {
  let sql = `select doctor.*,d.depName from doctor inner join department d on d.deptId = doctor.deptid where doctor.did = ${req.params.did}`;

  con.query(sql, (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/getPatientsData", cors(), (req, res) => {
  let sql = `select Pid as "key", Concat(Fname," ", Lname) as name, disease,contact,address from patient p`;

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
app.post("/deletePatientsData", cors(), (req, res) => {
  let data = req.body;

  let sql = `delete from patient where Pid = ${data.id}`;

  con.query(sql, (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/deleteDoctorsData", cors(), (req, res) => {
  let data = req.body;

  let sql = `delete from doctor where Did = ${data.id}`;

  con.query(sql, (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/todaysAppointments", cors(), (req, res) => {
  let date = new Date();
  date = date.toJSON().slice(0, 10);
  let sql =
    `select a.appDate,a.appTime,id as "key", Concat(d.fname," ",d.lname) as dName, Concat(p.fname," ",p.Lname) as pName from appointments a inner join doctor d on a.doctorId = d.Did inner join patient p on a.patientId = p.Pid where CURDATE() = ` +
    sqlStr.escape(date);
  con.query(sql, (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});
app.get("/getDepartmentData", cors(), (req, res) => {
  let sql = `SELECT * FROM department`;
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

        resolve(data);
      });
    });
  };

  (async () => {
    await getData(sql);
  })();

  sql = "SELECT sum(total) as totalRevenue FROM `bill`";
  (async () => {
    await getData(sql);
  })();
  sql = "SELECT count(private_ward_id) as privateWard FROM `patient`";
  (async () => {
    await getData(sql);
  })();

  sql = "SELECT count(general_ward_id) as generalWard FROM `patient`";
  (async () => {
    await getData(sql);
  })();
  sql = "SELECT count(*) as dCount FROM `doctor`";
  (async () => {
    await getData(sql);
  })();

  sql = "SELECT count(*) as donorCount FROM `donor`";
  (async () => {
    await getData(sql);

    res.send(data[0]);
  })();
});

app.post("/insertDoctorsData", cors(), (req, res) => {
  let data = req.body;

  let isoDate = new Date(req.body.joinDate);
  isoDate = isoDate.toJSON().slice(0, 10);
  let sql =
    `insert into doctor(fname,lname,contact,joinDate,pay,address,deptid) values (` +
    sqlStr.escape(data.Fname) +
    `,` +
    sqlStr.escape(data.Lname) +
    `,${data.contact},` +
    sqlStr.escape(isoDate) +
    `,${data.pay},` +
    sqlStr.escape(data.address) +
    `,${data.Deptid});`;
  con.query(sql, (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/insertPatientsData", cors(), (req, res) => {
  let data = req.body;
  console.log(data);
  let isoDate = req.body.admitDate;
  if (typeof isoDate !== "undefined") {
    isoDate = new Date(req.body.admitDate);
    isoDate = isoDate.toJSON().slice(0, 10);
  }
  console.log(typeof isoDate);
  let sql =
    `insert into patient(fname,lname,contact,admitDate,disease,address,did,private_Ward_Id,general_Ward_ID,bed_no) values (` +
    sqlStr.escape(data.Fname) +
    `,` +
    sqlStr.escape(data.Lname) +
    `,${data.contact},` +
    `${typeof isoDate !== "undefined" ? sqlStr.escape(isoDate) : `null`}` +
    `,${sqlStr.escape(data.disease)},` +
    sqlStr.escape(data.address) +
    `,${data.did},${
      data.privateWardId.length !== 0 ? data.privateWardId : `null`
    },${data.generalWardID.length !== 0 ? data.generalWardID : `null`},${
      data.bed_no.length !== 0 ? data.bed_no : `0`
    });`;
  con.query(sql, (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/updateDoctorsData", cors(), (req, res) => {
  let data = req.body;
  console.log(data);
  let isoDate = new Date(req.body.joinDate);
  isoDate = isoDate.toJSON().slice(0, 10);
  let sql = `update doctor set fname = ${sqlStr.escape(
    data.Fname
  )},lname = ${sqlStr.escape(data.Lname)},contact = ${
    data.contact
  },joinDate = ${sqlStr.escape(isoDate)},pay =${
    data.pay
  },address = ${sqlStr.escape(data.address)},deptid = ${
    data.Deptid
  } where did = ${data.did};`;
  con.query(sql, (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/updatePatientsData", cors(), (req, res) => {
  let data = req.body;
  console.log(data);
  let isoDate = req.body.admitDate;
  if (typeof isoDate !== "undefined") {
    isoDate = new Date(req.body.admitDate);
    isoDate = isoDate.toJSON().slice(0, 10);
  }
  console.log(typeof isoDate);
  let sql = `update patient set fname = ${sqlStr.escape(
    data.Fname
  )},lname = ${sqlStr.escape(data.Lname)},contact = ${
    data.contact
  },admitDate = ${
    typeof isoDate !== "undefined" ? sqlStr.escape(isoDate) : `null`
  },disease = ${sqlStr.escape(data.disease)},address = ${sqlStr.escape(
    data.address
  )},did =${data.did} ,private_Ward_Id = ${
    data.privateWardId.length !== 0 ? data.privateWardId : `null`
  },general_Ward_ID = ${
    data.generalWardID.length !== 0 ? data.generalWardID : `null`
  },bed_no = ${data.bed_no.length !== 0 ? data.bed_no : `0`} where pid = ${
    data.Pid
  }`;

  con.query(sql, (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});
app.listen(process.env.PORT || "3001", () => {
  console.log("Connected at 3001");
});
