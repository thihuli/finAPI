const express = require("express");
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json())

const customers = [];

//midleware
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find(customer => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({error: "Usuário não encontrado"})
  }

  //repassando informação da middleware para a request
  request.customer = customer

  return next();
};

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
};

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
  
  return response.status(201).json({msg: "Conta criada com sucesso", customers} )
});

app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
  //recuperando o customer repassao da middleware
  const { customer } = request;
  


  return response.json(customer.statement)
})

app.post("/deposito", verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation)

  return response.status(201).json({msg: "Deposito Feito com sucesso"})
})

app.post("/saque", verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({error: "Saldo insuficiente!"})
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).send("Saque realizado com sucesso")
})

app.listen(3333);