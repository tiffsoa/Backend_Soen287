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

const getCustomers = () => {
    const data = fs.readFileSync('./customer.json');
    return JSON.parse(data);
};

const saveCustomers = (customers) => {
    fs.writeFileSync('./customer.json', JSON.stringify(customers, null, 2));
};

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
    const newService = {
        id: services.length + 1,
        name: req.body.name,
        company: req.body.company,
        description: req.body.description,
        price: req.body.price,
        date: req.body.date,
        time: req.body.time,
        status: req.body.status,
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

// Delete a service
app.delete('/services/:id', (req, res) => {
    const services = getServices();
    const filteredServices = services.filter((s) => s.id !== parseInt(req.params.id));
    if (filteredServices.length !== services.length) {
        saveServices(filteredServices);
        res.json({ message: 'Service deleted successfully' });
    } else {
        res.status(404).json({ error: 'Service not found' });
    }
});

// Customer dashboard routes

// Get all services for customer dashboard
app.get('/customer/services', (req, res) => {
    const services = getServices();
    res.json(services);
});

// Get a specific customer's services
app.get('/customer/:id/services', (req, res) => {
    const customerId = parseInt(req.params.id);
    const customers = getCustomers();
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }

    const customerServices = customer.services.map(serviceId => {
        return getServices().find(service => service.id === serviceId);
    });

    res.json(customerServices);
});

// Add a service to a customer's list (simulate service booking)
app.post('/customer/:id/services', (req, res) => {
    const customerId = parseInt(req.params.id);
    const customers = getCustomers();
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }

    const serviceId = req.body.serviceId;
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

// Test route for services (send service data as JSON)
app.get('/services/test', (req, res) => {
    res.json(getServices());
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
