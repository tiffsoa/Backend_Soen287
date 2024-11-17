const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors');
const services = require('./services.json');

app.use(cors());

app.get('/', (req, res)=>{
    res.status(200);
    res.send("Welcome to root URL of Server");
});

// this is a test to link with the actual website
app.get('/services/test', (req, res)=>{
    res.json(services); // send the services data as JSON for good formatting
});

app.get('/services', (req, res)=>{
    const { search } = req.query;

    console.log("search", search);

    
    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(search)
    );

    console.log("filteredServices", filteredServices);
    res.json(filteredServices); // send the services data as JSON for good formatting
});


// this is a post test
app.post('/submit', (req, res) => {
    // The data sent in the request body will be in req.body
    const userData = req.body;

    console.log('Received user data:', userData);

    // Send a response back to the client
    res.status(200).send({
        message: 'Data received successfully',
        receivedData: userData
    });
});

//this is a put test
app.put('/update', (req, res) => {
    // The data sent in the request body will be in req.body
    const updatedData = req.body;

    
    console.log('Received updated data:', updatedData);

    // Send a response back to the client
    res.status(200).send({
        message: 'Data updated successfully',
        updatedData: updatedData
    });
});

// Load and save services from services.json
const getServices = () => {
    const data = fs.readFileSync('./services.json');
    return JSON.parse(data);
};

const saveServices = (services) => {
    fs.writeFileSync('./services.json', JSON.stringify(services, null, 2));
};

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
