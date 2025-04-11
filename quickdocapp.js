const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Load database configuration
const config = require('./config');



// Connect to MySQL database
const pool = mysql.createPool(config.db);


// Parse incoming form data
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.urlencoded());
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Login route
app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: 'views' });
});

// Registration route
app.get('/register', (req, res) => {
  res.sendFile('register.html', { root: 'views' });
});

// User form route (accessible after login)
app.get('/user-form', (req, res) => {
  // Logic to check if user is logged in (e.g., session variable)
  if (true/* user is logged in */) {
    res.sendFile('user-form.html', { root: 'views' });
  } else {
    res.redirect('/login'); // Redirect to login if not logged in
  }
});

// Login form processing (POST request)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch user from database
    const [rows] = await pool.query('SELECT * FROM registeredusers WHERE name = ?', [username]);
    const user = rows[0];
    res.setHeader('Content-Type', 'application/json');
    const responseFailData = {
      success : false
    } 
    const responseSuccessData = {
      success : true
    }
    if (!user) {
         res.statusCode = 401;
         return res.status(401).send(responseFailData);
    }

    // Compare hashed password with user's password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.statusCode = 401;
      return res.status(401).send(responseFailData);
    }
    else{
      res.statusCode = 200;
      res.status(200).send(responseSuccessData);
    }
    // Login successful (store session data here)
    //res.redirect('/'); // Redirect to user form

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Registration form processing (POST request)
app.post('/register', async (req, res) => {
  
  const { username, email, password } = req.body;

  try {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    await pool.query('INSERT INTO registeredusers (name, email,password) VALUES (?, ?, ?)', [username, email,hashedPassword]);
    res.send('Registration successful! Please login.');

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Registration form processing (POST request)
app.post('/bookappointment', async (req, res) => {
  
  const { currentUser,aname, aemail,phone,adate,atime,doctor } = req.body;

  try {
       // Insert appointment into database
    await pool.query('INSERT INTO appointments (bookingusername, name, email, phonenumber, date, time, doctorname) \
      VALUES (?, ?, ?, ?, ?, ?, ?)', [currentUser,aname, aemail,phone,adate,atime,doctor]);
    res.send('Appointment booked successfully!');

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Function to fetch appointments from db and send it to client
app.get('/get-appointments', async (req, res) => {
  try {
    // Define the SQL query to select data (replace with your table and columns)
    const { currentuser } = req.query
    const sql = `SELECT name, doctorname, DATE_FORMAT(date, '%d-%m-%Y') as date, time FROM appointments where bookingusername = "` + currentuser + `"`;
   
    // Execute the query using async/await with connection pool
    const [rows] = await pool.query(sql);

    // Return the fetched data as JSON
    res.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' }); // Handle errors gracefully
  }
});
app.post('/addToCart', async (req, res) => {
  const { tabletName, tabletId, price } = req.body; // Destructure data from request body

  try {
    const connection = await pool.getConnection();
    const query = `INSERT INTO cart (tabletName, tabletId, price) VALUES (?, ?, ?)`;
    const [results] = await connection.execute(query, [tabletName, tabletId, price]);

    if (results.affectedRows === 1) {
      res.json({ success: true }); // Respond with success message
    } else {
      console.error('Error adding item to cart:', results);
      res.status(500).json({ success: false, message: 'Failed to add item to cart' });
    }

    connection.release(); // Release connection back to the pool
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/orderitems', async (req, res) => {
  
  const { currentUser,address, ordertotal,orderitems } = req.body; 

  try {
       // Insert appointment into database
    await pool.query('INSERT INTO orders (orderitems, price, user, address) \
      VALUES (?, ?, ?, ?)', [orderitems,ordertotal, currentUser,address]);
    res.send('Order placed successfully!');

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Function to fetch orders from db and send it to client
app.get('/get-orders', async (req, res) => {
  try {
    // Define the SQL query to select data (replace with your table and columns)
    const { currentuser } = req.query
    const sql = `SELECT orderitems, DATE_FORMAT(orderdate, '%d-%m-%Y %H:%i') as orderdate, price FROM orders where user = "` + currentuser + `"`;
   
    // Execute the query using async/await with connection pool
    const [rows] = await pool.query(sql);

    // Return the fetched data as JSON
    res.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' }); // Handle errors gracefully
  }
});

//Function to get next appointment
app.get('/get-next-appointment', async (req, res) => {
  try {
    // Define the SQL query to select data (replace with your table and columns)
    const { currentuser } = req.query
    const sql = "SELECT concat_ws(' ',date,time) as apntdatetime FROM quickdoc.appointments where  concat_ws(' ',date,time) > now() and bookingusername = '"+ currentuser + "' order by date asc, time asc";
   
    // Execute the query using async/await with connection pool
    const [rows] = await pool.query(sql);

    // Return the fetched data as JSON
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' }); // Handle errors gracefully
  }
});



app.listen(port, () => console.log(`Server listening on port ${port}`));
