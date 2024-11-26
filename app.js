const express = require("express");
const app = express();
const PORT = 3000;
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const mysql = require("mysql");

// Parse incoming request bodies
app.use(bodyParser.json());
app.use(cors({ origin: "http://127.0.0.1:5500", credentials: true }));
app.use(express.urlencoded({ extended: true }));

//connect to the database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "service_manager_website",
});
db.connect((err) => {
  if (err) {
    console.log("Error connecting to DB");
  } else {
    console.log("Connected");
  }
});

const getObjectByIdFromDb = (tableName, objectId) => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * FROM ${tableName} WHERE id = ?`;
    db.query(sql, [objectId], (err, result) => {
      if (err) reject("Could not retrieve data from table!");
      else if (result.length === 0) reject("Object not found!");
      else resolve(result[0]); // Return the first result since we're looking for a single service
    });
  });
};

// Utility functions to handle reading and writing to the database
const getServices = () => {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM services";
    db.query(sql, (err, result) => {
      if (err) reject("Could not retrieve data from table!");
      else resolve(result);
    });
  });
};

const addService = (service) => {
  return new Promise((resolve, reject) => {
    let sql = "INSERT INTO services SET ?";
    db.query(sql, service, (err, result) => {
      if (err) reject("Could not insert new service!");
      else resolve(service);
    });
  });
};

const editService = (updatedService, serviceId) => {
  return new Promise((resolve, reject) => {
    // Create an SQL query to update the service
    const sql =
      "UPDATE services SET name = ?, description = ?, price = ? WHERE id = ?";

    // Execute the query with the new values
    db.query(
      sql,
      [
        updatedService.name,
        updatedService.description,
        updatedService.price,
        serviceId,
      ],
      (err, result) => {
        if (err) {
          // If an error occurs during the update
          reject("Could not update the service!");
        } else if (result.affectedRows === 0) {
          // If no rows were affected (i.e., no service was found with the given ID)
          reject("Service not found!");
        } else {
          // If the update was successful
          resolve("Service updated successfully!");
        }
      }
    );
  });
};

const deleteService = (serviceId) => {
  return new Promise((resolve, reject) => {
    let sql = "DELETE FROM services WHERE id = ?";
    db.query(sql, [serviceId], (err, result) => {
      if (err) {
        reject("Could not delete service due to an error");
      } else if (result.affectedRows === 0) {
        reject("Service not found or already deleted");
      } else {
        resolve("Service deleted successfully!");
      }
    });
  });
};

const getCustomerByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM customers WHERE email = ?";

    db.query(sql, [email], (err, result) => {
      if (err) return reject("Could not retrieve customer!");
      if (result.length === 0) return resolve({});
      resolve(result[0]); // Returning the first matching customer
    });
  });
};

const getCompanyByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM companies WHERE email = ?";

    db.query(sql, [email], (err, result) => {
      if (err) return reject("Could not retrieve company!");
      if (result.length === 0) return reject("Company not found!");
      resolve(result[0]); // Returning the first matching company
    });
  });
};

const editCompany = (updatedCompany, companyId) => {
  return new Promise((resolve, reject) => {
    // Create an SQL query to update the customer
    const sql =
      "UPDATE companies SET name = ?, address = ?, logo = ? WHERE id = ?";

    // Execute the query with the new values
    db.query(
      sql,
      [
        updatedCompany.name,
        updatedCompany.address,
        updatedCompany.logo,
        companyId,
      ],
      (err, result) => {
        if (err) {
          // If an error occurs during the update
          reject("Could not update the company information!");
        } else if (result.affectedRows === 0) {
          // If no rows were affected (i.e., no customer was found with the given ID)
          reject("Company not found!");
        } else {
          // If the update was successful
          resolve("Company updated successfully!");
        }
      }
    );
  });
};

const getInvoices = () => {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM invoices";
    db.query(sql, (err, result) => {
      if (err) reject("Could not retrieve data from table!");
      else resolve(result);
    });
  });
};

const addInvoices = (invoice) => {
  console.log("invoice", invoice);
  return new Promise((resolve, reject) => {
    let sql = "INSERT INTO invoices SET ?";
    db.query(sql, invoice, (err, result) => {
      if (err) reject("Could not insert new invoice!");
      else resolve(invoice);
    });
  });
};

// for customer data
const getCustomers = () => {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM customers";
    db.query(sql, (err, result) => {
      if (err) reject("Could not retrieve data from table!");
      else resolve(result);
    });
  });
};

const addCustomer = (customer) => {
  console.log("customer", customer);
  return new Promise((resolve, reject) => {
    let sql = "INSERT INTO customers SET ?";
    db.query(sql, customer, (err, result) => {
      if (err) reject("Could not insert new customer!");
      else resolve(customer);
    });
  });
};

const editCustomer = (updatedCustomer, customerId) => {
  return new Promise((resolve, reject) => {
    // Create an SQL query to update the customer
    const sql =
      "UPDATE customers SET name = ?, email = ?, password = ? WHERE id = ?";

    // Execute the query with the new values
    db.query(
      sql,
      [
        updatedCustomer.name,
        updatedCustomer.email,
        updatedCustomer.password,
        customerId,
      ],
      (err, result) => {
        if (err) {
          // If an error occurs during the update
          reject("Could not update the customer information!");
        } else if (result.affectedRows === 0) {
          // If no rows were affected (i.e., no customer was found with the given ID)
          reject("Customer not found!");
        } else {
          // If the update was successful
          resolve("Customer updated successfully!");
        }
      }
    );
  });
};

const deleteCustomer = (customerId) => {
  return new Promise((resolve, reject) => {
    let sql = "DELETE FROM customers WHERE id = ?";
    db.query(sql, [customerId], (err, result) => {
      if (err) {
        reject("Could not delete customer due to an error");
      } else if (result.affectedRows === 0) {
        reject("Customer not found or already deleted");
      } else {
        resolve("Customer deleted successfully!");
      }
    });
  });
};

const addBooking = (booking) => {
  console.log("booking", booking);
  return new Promise((resolve, reject) => {
    let sql = "INSERT INTO bookings SET ?";
    db.query(sql, booking, (err, result) => {
      if (err) {
        console.error("Error:", err);
        reject("Could not insert new booking!");
      } else resolve(booking);
    });
  });
};

const getBookings = () => {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM bookings";
    db.query(sql, (err, result) => {
      if (err) reject("Could not retrieve data from table!");
      else resolve(result);
    });
  });
};

app.post("/signup", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.firstName + " " + req.body.lastName;

    if (!name || !email || !password) {
      return res.sendStatus(400);
    }

    const customerFromEmail = await getCustomerByEmail(email);

    console.log("customerFromemail", customerFromEmail);
    if (JSON.stringify(customerFromEmail) !== "{}") {
      res.status(400).json({ error: "Customer already exists!" });
    }

    const newCustomer = { name, email, password };

    addCustomer(newCustomer);
    res.json(newCustomer);
  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
});

app.get("/customers", async (req, res) => {
  try {
    const customers = await getCustomers();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/signin/company", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and Password are required!" });
  }

  // Find company by email
  try {
    const company = await getCompanyByEmail(email);
    if (!company) {
      return res.status(401).json({ error: "Invalid email or password!" });
    }

    if (company.password !== password) {
      return res.status(401).json({ error: "Invalid email or password!" });
    }

    res.json({
      message: "Login successful!",
      companyId: company.id,
      userRole: "company",
    });
  } catch (err) {
    console.log("Error:", err); // Handling the error gracefully
    return res.status(401).json({ error: "Invalid email or password!" });
  }
});

// Sign in for customers page route
app.post("/signin/customer", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and Password are required!" });
  }

  // Find customer by email
  try {
    const customer = await getCustomerByEmail(email);
    if (!customer) {
      return res.status(401).json({ error: "Invalid email or password!" });
    }

    if (customer.password !== password) {
      return res.status(401).json({ error: "Invalid email or password!" });
    }

    res.json({
      message: "Login successful!",
      customerEmail: customer.email,
      customerId: customer.id,
      userRole: "customer",
    });
  } catch (err) {
    console.log("Error:", err); // Handling the error gracefully
    return res.status(401).json({ error: "Invalid email or password!" });
  }
});

//admin dashboard route
//get admin profile
app.get("/admin/:id", async (req, res) => {
  const companyId = parseInt(req.params.id);

  try {
    //get company by id
    const result = await getObjectByIdFromDb("companies", companyId);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "Company not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/admin/:id", async (req, res) => {
  const companyId = parseInt(req.params.id);

  const { name, logo, address, description } = req.body;

  const updatedCompany = {};
  if (name) updatedCompany.name = name;
  if (logo) updatedCompany.logo = logo;
  if (address) updatedCompany.address = address;
  if (description) updatedCompany.description = description;

  try {
    const message = await editCompany(updatedCompany, companyId);
    res.json({ message, updatedCompany });
  } catch (error) {
    res.status(500).json({ error });
  }
});

//bookings route
app.post("/bookings/:id", async (req, res) => {
  const serviceId = parseInt(req.params.id);
  try {
    const {
      email,
      phoneNumber,
      address,
      frequency,
      serviceDate,
      comments,
      payment,
      terms,
    } = req.body;

    if (
      !email ||
      !phoneNumber ||
      !address ||
      !frequency ||
      !serviceDate ||
      !payment ||
      !terms
    ) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const newBooking = {
      email,
      phoneNumber,
      address,
      frequency,
      date: serviceDate,
      time: comments,
      payment,
      terms: terms ? 1 : 0, // Storing terms as 1 (true) or 0 (false)
      serviceId,
    };

    const booking = await addBooking(newBooking);
    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while saving the booking." });
  }
});

// Get all services (only those with matching company id) !!!!!!!!!!
app.get("/services", async (req, res) => {
  const services = await getServices();
  res.json(services);
});

// Get a single service by ID
app.get("/services/:id", async (req, res) => {
  const services = await getServices();
  const service = services.find((s) => s.id === parseInt(req.params.id));
  if (service) {
    res.json(service);
  } else {
    res.status(404).json({ error: "Service not found" });
  }
});

// Add a new service
app.post("/services", async (req, res) => {
  const { name, companyId, description, price } = req.body;

  if (!name || !description || !price) {
    return res.status(400).json({
      error: "Missing required fields: name, description, price, or companyId",
    });
  }

  const newService = {
    name,
    companyId: companyId || 1,
    description,
    price,
  };

  await addService(newService);
  res.status(201).json(newService);
});

// Update an existing service
app.put("/services/:id", async (req, res) => {
  const service = await getObjectByIdFromDb("services", req.params.id);

  if (service) {
    const updatedService = {
      ...service,
      ...req.body,
    };

    const newService = await editService(updatedService, req.params.id);
    res.json(newService);
  } else {
    res.status(404).json({ error: "Service not found" });
  }
});

// Delete a service (Simulate cancellation)
app.delete("/services/:id", async (req, res) => {
  const serviceId = req.params.id; // Get the service ID from the URL params

  try {
    const message = await deleteService(serviceId);
    res.json({ message }); // Send the success message as JSON
  } catch (err) {
    res.status(404).json({ error: err }); // Send the error message as JSON
  }
});

// Customer dashboard routes

//get all services for a customer dashboard (from booking)
//get the service id from booking then use service id to show service from services
app.get("/customer/services/:id", async (req, res) => {
  //take customer email from booking and verify if it matches the current customer's email
  //if it does then get the service id and check in services to show which service it is

  const customerId = parseInt(req.params.id);

  try {
    const customer = await getObjectByIdFromDb("customers", customerId);
    const customerEmail = customer.email;

    const bookings = await getBookings();
    const customerBookings = bookings.filter(
      (booking) => booking.email === customerEmail
    );

    if (customerBookings.length === 0) {
      return res
        .status(404)
        .json({ error: "No bookings found for this customer" });
    }

    const services = await getServices();
    const bookedServices = customerBookings.map((booking) => {
      const service = services.find(
        (service) => service.id === booking.serviceId
      );
      return {
        serviceDetails: service || null,
      };
    });
    res.json(bookedServices);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//get invoices for a customer
app.get("/customer/invoices/:id", async (req, res) => {
  const customerId = parseInt(req.params.id);

  try {
    const invoices = await getInvoices();
    const customerInvoices = invoices.filter(
      (invoice) => invoice.customerId === customerId
    );

    if (customerInvoices.length > 0) {
      res.json(customerInvoices);
    } else {
      res.status(404).json({ error: "No invoices found for this customer" });
    }
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//add invoice for a customer
app.post("/customer/invoices", async (req, res) => {
  const { serviceId, amount, status, dueDate } = req.body;

  if (!serviceId || !amount || !status || !dueDate) {
    return res.status(400).json({
      error: "Missing required fields: serviceId, amount, status, or dueDate",
    });
  }

  const newInvoice = {
    customerId,
    serviceId,
    amount,
    status,
    dueDate,
  };

  try {
    await addInvoices(newInvoice);
    res.status(201).json(newInvoice);
  } catch (err) {
    console.error("Error adding invoice:", err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

// Update customer details (e.g., name, email)
app.put("/customer", async (req, res) => {
  const customerId = req.session.customerId;

  const { name, email, password } = req.body;

  const updatedCustomer = {};
  if (name) updatedCustomer.name = name;
  if (email) updatedCustomer.email = email;
  if (password) updatedCustomer.password = password;

  try {
    const message = await editCustomer(updatedCustomer, customerId);
    res.json({ message, updatedCustomer });
  } catch (error) {
    res.status(500).json({ error });
  }
});

//delete account
app.delete("/customer/:id", async (req, res) => {
  const customerId = parseInt(req.params.id);

  await deleteCustomer(customerId)
    .then((message) => {
      res.status(200).json({ message });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

// Password Update Route
app.post("/update-password/:id", async (req, res) => {
  const customerId = parseInt(req.params.id);
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validate input fields
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Validate new password complexity
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      error:
        "New password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.",
    });
  }

  // Check if new password matches confirmation
  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ error: "New password and confirmation do not match." });
  }

  try {
    // Fetch customer from database by ID
    const [customerResult] = await new Promise((resolve, reject) => {
      const sql = "SELECT * FROM customers WHERE id = ?";
      db.query(sql, [customerId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (!customerResult) {
      return res.status(404).json({ error: "Customer not found." });
    }

    const customer = customerResult;

    // Check if current password matches
    if (customer.password !== currentPassword) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    // Update the password in the database
    await new Promise((resolve, reject) => {
      const updateSql = "UPDATE customers SET password = ? WHERE id = ?";
      db.query(updateSql, [newPassword, customerId], (err, result) => {
        if (err) reject(err);
        else if (result.affectedRows === 0)
          reject("Customer not found during update.");
        else resolve();
      });
    });

    // Respond with success
    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the password." });
  }
});

// Placeholder route for testing
app.get("/", (req, res) => {
  res.status(200).send("Welcome to the Root URL of the Server");
});

// Post request test
app.post("/submit", (req, res) => {
  const userData = req.body;
  console.log("Received user data:", userData);
  res.status(200).send({
    message: "Data received successfully",
    receivedData: userData,
  });
});

// Put request test
app.put("/update", (req, res) => {
  const updatedData = req.body;
  console.log("Received updated data:", updatedData);
  res.status(200).send({
    message: "Data updated successfully",
    updatedData: updatedData,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
