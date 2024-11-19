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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
