const ValidationContract = require("../validators/fluent-validator");
const repository = require("../repositories/customer-repository");
const md5 = require("md5");

const emailService = require("../services/email-service");
const authService = require("../services/auth-service");

exports.post = async (req, res, next) => {
  let contract = new ValidationContract();
  contract.hasMinLen(
    req.body.name,
    3,
    "O Nome deve conter pelo menos 3 caracteres"
  );
  contract.isEmail(req.body.email, "E-mail inválido");
  contract.hasMinLen(
    req.body.password,
    3,
    "A senha deve conter pelo menos 3 caracteres"
  );

  // Se os dados forem inválidos
  if (!contract.isValid()) {
    res.status(400).send(contract.errros()).end();
    return;
  }

  try {
    await repository.create({
      ...req.body,
      password: md5(req.body.password + global.SALT_KEY),
      roles: ["user"],
    });

    emailService.send(
      req.body.email,
      "Bem Vindo ao Node Store",
      global.EMAIL_TMPL.replace("{0}", req.body.name)
    );

    res.status(201).send({ message: "Cliente cadastrado com sucesso!" });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      message: "Falha ao processa sua requisição",
    });
  }
};

exports.authenticate = async (req, res, next) => {
  try {
    const customer = await repository.authenticate({
      email: req.body.email,
      password: md5(req.body.password + global.SALT_KEY),
    });

    if (!customer)
      return res.status(404).send({ message: "Usuário ou senha inválidos" });

    const { email, name, _id, roles } = customer;

    const token = await authService.generateToken({
      email,
      name,
      id: _id,
      roles,
    });
    res.status(201).send({
      token,
      data: {
        email,
        name,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      message: "Falha ao processa sua requisição",
    });
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const token =
      req.body.token || req.query.token || req.headers["x-access-token"];
    const data = await authService.decodeToken(token);

    const customer = await repository.getById(data.id);

    if (!customer)
      return res.status(404).send({ message: "Client não encontrado" });

    const { email, name, _id, roles } = customer;

    const tokenData = await authService.generateToken({
      email,
      name,
      id: _id,
      roles,
    });
    res.status(201).send({
      token: tokenData,
      data: {
        email,
        name,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      message: "Falha ao processa sua requisição",
    });
  }
};
