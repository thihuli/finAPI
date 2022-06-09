const express = require("express");
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json())

const customers = [];

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return response.status(400).json({error: "Usuário já existe"})
  }
  
  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: []
  });
  
  return response.status(201).send("Conta criada com sucesso")
});

app.get("/statement", (request, response) => {
  const { cpf } = request.headers;

  const customer = customers.find(customer => customer.cpf === cpf);
  console.log('state', customer)
  if (!customer) {
    return response.status(400).json({error: "Usuário não encontrado"})
  }

  return response.json(customer.statement)
})

app.listen(3333);