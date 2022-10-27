const express = require("express");
require('dotenv').config();
const mysql = require("mysql");
const cors = require("cors");
const PORT = process.env.PORT || 3050;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const URL = "http://127.0.0.1:5173";

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const jwt = require("jsonwebtoken");
const e = require("express");

const app = express();

// app.use(bodyParser.json());
app.use(express.json());
// Conexion backend to frontend
app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:3050"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", URL);
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

// MySQL
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "facturaChallenge",
});

//Route
app.get("/", (req, res) => {
  res.send("Welcome to my API!");
});

//Crud
// All Bills
app.get("/bills", (req, res) => {
  res.send("Welcome to the dashboard where you can see your last 10 bills");
});

app.get("/facturas/:id", (req, res) => {
  res.send("Get facturas por id");
});

app.post("/agregar-factura", (req, res) => {
  res.send("We are here");
  const concepto = req.body.concepto;
  const monto = req.body.monto;
  const fecha = req.body.fecha;
  const tipo = req.body.tipo;
  const categoria = req.body.categoria;
  console.log(concepto, monto, fecha, tipo, categoria);

  connection.query(
    "INSERT INTO facturas (concepto, monto, fecha, tipo, categoria) VALUES (?,?,?,?,?)",
    [concepto, monto, fecha, tipo, categoria],
    (err, result) => {
      console.log(err);
    }
  );
});

// Todos los turnos, mostrar los ultimos 10 turnos
app.get("/facturas", (req, res) => {
  connection.query(
    "SELECT * FROM facturas ORDER BY fecha desc LIMIT 10",
    (error, result) => {
      if (error) {
        console.log(error);
      } else {
        res.send(result);
      }
    }
  );
});


app.get("/facturas/:id", (req, res) => {
  res.send("Get facturas by id");
});

app.put("/update/:id", (req, res) => {
  const concepto = req.body.concepto;
  const monto = req.body.monto;
  const fecha = req.body.fecha;
  const tipo = req.body.tipo;
  const categoria = req.body.categoria;
  const id = req.params.id;

  console.log(id, concepto, monto, fecha, tipo, categoria);

  connection.query(
    `UPDATE facturas SET concepto = "${concepto}", monto = ${monto}, fecha = "${fecha}", tipo = "${tipo}", categoria = "${categoria}"  WHERE id = ${id}`,
    (error, result) => {
      if (error) {
        console.log(error);
        res.send({ error: error });
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  connection.query(`DELETE FROM facturas WHERE id = ${id}`, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      res.send(result);
    }
  });
});

// Edit va con update, pasar el id y ver si se envia a AgregarFactura con los valores completados o bien en un modal

app.get("/facturas-ingresos", (req, res) => {
  connection.query(
    "SELECT * FROM facturas WHERE tipo = 'ingreso'",
    (error, result) => {
      if (error) {
        console.log(error);
      } else {
        res.send(result);
      }
    }
  );
});

app.get("/facturas-egresos", (req, res) => {
  connection.query(
    "SELECT * FROM facturas WHERE tipo = 'egreso'",
    (error, result) => {
      if (error) {
        console.log(error);
      } else {
        res.send(result);
      }
    }
  );
});

app.get("/categoria-hogar", (req, res) => {
  connection.query(
    "SELECT * FROM facturas WHERE categoria = 'comida'",
    (error, result) => {
      if (error) {
        console.log(error);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

// Crud
// All Users
app.get("/users", (req, res) => {
  res.send("Welcome to my users page! Here you can find the list");
});

app.get("/users/:id", (req, res) => {
  res.send("Get user by id");
});

app.get("/login", (req, res) => {
  console.log(req.session.user);
  if (req.session.user) {
    console.log();
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email, password);

  connection.query(
    `SELECT * FROM usuarios WHERE email = "${email}" AND password = "${password}"`,
    (error, result) => {
      if (error) {
        res.send({ error: error });
      }

      if (result.length > 0) {
        res.send(result);
      } else {
        res.send({ message: "Wrong username/password combination" });
      }
    }
  );
});

app.post("/register", (req, res) => {
  // res.send("We are here");
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  connection.query(
    "INSERT INTO usuarios (username, email, password) VALUES (?,?,?)",
    [username, email, password],
    (err, result) => {
      console.log(err);
      res.send(result);
    }
  );
});

app.put("/update-users/:id", (req, res) => {
  const nombreCompleto = req.body.nombreCompleto;
  const empresa = req.body.empresa;
  const cargo = req.body.cargo;
  const edad = req.body.edad;
  const genero = req.body.genero;
  const id = req.params.id;

  console.log(id, concepto, monto, fecha, tipo, categoria);

  connection.query(
    `UPDATE facturas SET nombreCompleto = "${nombreCompleto}", empresa = ${empresa}, cargo = "${cargo}", edad = "${edad}", genero = "${genero}"  WHERE id = ${id}`,
    (error, result) => {
      if (error) {
        console.log(error);
        res.send({ error: error });
      } else {
        res.send(result);
      }
    }
  );
});

// Check Connect
connection.connect((error) => {
  if (error) throw error;
  console.log("Database server running!");
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
