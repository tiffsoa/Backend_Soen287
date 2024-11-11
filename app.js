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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
