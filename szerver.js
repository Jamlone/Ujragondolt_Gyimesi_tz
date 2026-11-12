const express = require("express");
const mysql = require("mysql2");
const app = express();

app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "fitness_db",
    port: 3307,
    decimalNumbers: true
});

function lekerdez(res, sql, params = []) {
    db.query(sql, params, (err, result) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ hiba: "Hiba történt" });
        }
        res.json(result);
    });
}


app.get("/berletek", (req, res) => {
    lekerdez(res, `
        SELECT b.id, b.megnevezes, b.ar, b.ervenyesseg_nap, b.elerheto,
               t.nev AS tipus_nev
        FROM berletek b
        JOIN tipusok t ON b.tipus_id = t.id
        ORDER BY b.ar ASC`);
});


app.get("/berletek/elerheto", (req, res) => {
    lekerdez(res, `
        SELECT * FROM berletek
        WHERE elerheto = 1 AND ervenyesseg_nap <= 30`);
});


app.get("/berletek/kereses/:szoveg", (req, res) => {
    lekerdez(res,
        `SELECT * FROM berletek WHERE megnevezes LIKE ?`,
        [`%${req.params.szoveg}%`]
    );
});


app.get("/tipusok/statisztika", (req, res) => {
    lekerdez(res, `
        SELECT t.nev AS tipus_nev,
               COUNT(b.id) AS berletek_szama,
               ROUND(AVG(b.ar), 1) AS atlagos_ar
        FROM tipusok t
        JOIN berletek b ON b.tipus_id = t.id
        GROUP BY t.id, t.nev`);
});


app.get("/berletek/dragak", (req, res) => {
    lekerdez(res, `
        SELECT megnevezes, ar, ervenyesseg_nap
        FROM berletek
        WHERE ar > 20000
        ORDER BY ervenyesseg_nap DESC`);
});

app.listen(3000, () => {
    console.log("Szerver fut: http://localhost:3000");
});