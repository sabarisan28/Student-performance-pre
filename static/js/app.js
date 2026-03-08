const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'your_database'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL!');
});

connection.query('SELECT * FROM users', (err, results) => {
  if (err) throw err;
  console.log(results);
});

connection.end();
