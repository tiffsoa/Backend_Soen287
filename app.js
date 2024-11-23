const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');

// Parse incoming request bodies
app.use(bodyParser.json());
app.use(cors());

// Utility functions to handle reading and writing to JSON files
const getServices = () => {
    const data = fs.readFileSync('./services.json');
    return JSON.parse(data);
};

const saveServices = (services) => {
    fs.writeFileSync('./services.json', JSON.stringify(services, null, 2));
};

const getInvoices = () => {
    const data = fs.readFileSync('./invoices.json');
    return JSON.parse(data);
};

const saveInvoices = (invoices) => {
    fs.writeFileSync('./invoices.json', JSON.stringify(invoices, null, 2));
};

const getCompanies = () => {
    const data = fs.readFileSync('./companies.json');
    return JSON.parse(data);
};

const getBookings = () => {
    const data = fs.readFileSync('./bookings.json');
    return JSON.parse(data);
};

const getCustomers = () => {
    const data = fs.readFileSync('./customer.json');
    return JSON.parse(data);
};

const saveCustomers = (customers) => {
    fs.writeFileSync('./customer.json', JSON.stringify(customers, null, 2));
};

const addCustomer = (customer) => {
    const customers = getCustomers();
    customers.push(customer);
    saveCustomers(customers);
};

const findCustomerByEmail = (email) => {
    const customers = getCustomers();
    return customers.find(customer => customer.email === email);
};

// Sign up page route

app.post('/signup', (req, res) => {
    const { lastName, firstName, phone, email, password } = req.body; //take these fields from the html and send what the 
    // customer filled them with in the request body 
    const customers = getCustomers(); // store all customers from customer.json in const customers
    console.log(lastName, firstName, phone, email, password) //this was just for the sake of debugging

    if (!email) {  //in signup case, if the email field is not completed, send an error message
        return res.status(400).json({error: "Email is required"});  //status 400 means error, something went wrong
    }

    const customer = findCustomerByEmail(email); // here customer stores any customer that has the email that was given
    // basically if you can find a customer with that email in the database then the customer already exists

    if (customer) { //if customer was found
        res.status(404).json({error: "Customer already exists"}); //send error again because customer already exists
    } else { //else create a new customer with the given attributes
        const newCustomer = {
            id: customers[customers.length - 1].id + 1,
            name: firstName + " " + lastName,
            email: email,
            password: password,
            services: []
        }
        res.json(newCustomer); // send this new customer as a json response to the frontend (look in the frontend js to see what we do with this)
        addCustomer(newCustomer); // add the new customer to the database by using our helper function
    }
});


// Bookings route
// fetching data from booking form and sending it to bookings.json 
app.get('/bookings/:id', (req, res) => {
    const bookingId = parseInt(req.params.id); 
    const bookings = getBookings();
    const booking = bookings.find( b => b.id === bookingId );

    if (!booking) {
        return res.status(404).json({error: 'Booking not found'});
    }
    res.status(200).json(booking);
});


// Admin dashboard service routes

// Get all services
app.get('/services', (req, res) => {
    const services = getServices();
    res.json(services);
});

// Get a single service by ID
app.get('/services/:id', (req, res) => {
    const services = getServices();
    const service = services.find((s) => s.id === parseInt(req.params.id));
    if (service) {
        res.json(service);
    } else {
        res.status(404).json({ error: 'Service not found' });
    }
});

// Add a new service
app.post('/services', (req, res) => {
    const services = getServices();
    const { name, companyId, description, price, date, time, status } = req.body;

    if (!name || !description || !price || !companyId) {
        return res.status(400).json({ error: 'Missing required fields: name, description, price, or companyId' });
    }

    const newService = {
        id: services.length ? services[services.length - 1].id + 1 : 1,
        name,
        companyId,
        description,
        price,
        date,
        time,
        status,
    };
    services.push(newService);
    saveServices(services);
    res.status(201).json(newService);
});

// Update an existing service
app.put('/services/:id', (req, res) => {
    const services = getServices();
    const serviceIndex = services.findIndex((s) => s.id === parseInt(req.params.id));
    if (serviceIndex !== -1) {
        const updatedService = {
            ...services[serviceIndex],
            ...req.body,
        };
        services[serviceIndex] = updatedService;
        saveServices(services);
        res.json(updatedService);
    } else {
        res.status(404).json({ error: 'Service not found' });
    }
});

// Delete a service (Simulate cancellation)
app.delete('/services/:id', (req, res) => {
    const services = getServices();
    const filteredServices = services.filter((s) => s.id !== parseInt(req.params.id));
    if (filteredServices.length !== services.length) {
        saveServices(filteredServices);
        res.json({ message: 'Service canceled successfully' });
    } else {
        res.status(404).json({ error: 'Service not found' });
    }
});

// Customer dashboard routes

// Get all services for customer dashboard
app.get('/customer/:id/services', (req, res) => {
    const services = getServices();
    res.json(services);
});

// Get invoices for a specific customer
app.get('/customer/:id/invoices', (req, res) => {
    const invoices = getInvoices();
    const customerId = parseInt(req.params.id);
    const customerInvoices = invoices.filter(invoice => invoice.customerId === customerId);

    if (customerInvoices.length > 0) {
        res.json(customerInvoices);
    } else {
        res.status(404).json({ error: 'No invoices found for this customer' });
    }
});

// Add an invoice for a customer
app.post('/customer/:id/invoices', (req, res) => {
    const customerId = parseInt(req.params.id);
    const { serviceId, amount, status, dueDate } = req.body;

    if (!serviceId || !amount || !status || !dueDate) {
        return res.status(400).json({ error: 'Missing required fields: serviceId, amount, status, or dueDate' });
    }

    const invoices = getInvoices();
    const newInvoice = {
        id: invoices.length ? invoices[invoices.length - 1].id + 1 : 1,
        customerId,
        serviceId,
        amount,
        status,
        dueDate,
        createdAt: new Date().toISOString(),
    };
    invoices.push(newInvoice);
    saveInvoices(invoices);
    res.status(201).json(newInvoice);
});

// Add a service to a customer's list (simulate service booking)
app.post('/customer/:id/services', (req, res) => {
    const customerId = parseInt(req.params.id);
    const customers = getCustomers();
    const customer = customers.find(c => c.id === customerId);

    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }

    const { serviceId } = req.body;
    const services = getServices();

    if (services.find(service => service.id === serviceId)) {
        customer.services.push(serviceId);
        saveCustomers(customers);
        res.status(201).json({ message: 'Service added to customer profile', services: customer.services });
    } else {
        res.status(400).json({ error: 'Service not found' });
    }
});

// Update customer details (e.g., name, email)
app.put('/customer/:id', (req, res) => {
    const customerId = parseInt(req.params.id);
    const customers = getCustomers();
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }

    // Update customer data
    const { name, email, password } = req.body;
    if (name) customer.name = name;
    if (email) customer.email = email;
    if (password) customer.password = password;

    saveCustomers(customers);
    res.json({ message: 'Customer details updated successfully', customer });
});

// Password Update Route
app.post('/update-password', (req, res) => {
    const { customerId, currentPassword, newPassword, confirmPassword } = req.body;

    // Fetch the customer data from the file
    let customers = getCustomers();
    let customer = customers.find(c => c.id === customerId);

    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if the current password is correct
    if (customer.password !== currentPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Validate new password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            error: 'New password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.'
        });
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New password and confirmation do not match.' });
    }

    // Update the password in customer data
    customer.password = newPassword;

    // Save the updated customers data
    saveCustomers(customers);

    // Respond with success
    res.status(200).json({ message: 'Password updated successfully' });
});

// Sign out simulation (clear session/cookie)
app.post('/customer/signout', (req, res) => {
    // Simulate sign out
    res.json({ message: 'Signed out successfully' });
});

// Placeholder route for testing
app.get('/', (req, res) => {
    res.status(200).send("Welcome to the Root URL of the Server");
});


// Post request test
app.post('/submit', (req, res) => {
    const userData = req.body;
    console.log('Received user data:', userData);
    res.status(200).send({
        message: 'Data received successfully',
        receivedData: userData
    });
});

// Put request test
app.put('/update', (req, res) => {
    const updatedData = req.body;
    console.log('Received updated data:', updatedData);
    res.status(200).send({
        message: 'Data updated successfully',
        updatedData: updatedData
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
