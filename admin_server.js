const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Load and save services from services.json
const getServices = () => {
    const data = fs.readFileSync('./services.json');
    return JSON.parse(data);
};

const saveServices = (services) => {
    fs.writeFileSync('./services.json', JSON.stringify(services, null, 2));
};

// Routes

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

// Start the server
app.listen(PORT, () => {
    console.log(`Admin Dashboard Backend is running on http://localhost:${PORT}`);
});

