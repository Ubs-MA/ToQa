const Joi = require("joi");

const stockSchema = Joi.object({
    stock: Joi.number()
        .integer()
        .min(0)
        .required(),
});

module.exports = {
    stockSchema,
};