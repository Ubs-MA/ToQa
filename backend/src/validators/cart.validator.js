const Joi = require("joi");

const addCartItemSchema = Joi.object({
    product: Joi.string().required(),

    variant: Joi.string().required(),

    quantity: Joi.number()
        .integer()
        .min(1)
        .required(),
});

const updateCartItemSchema = Joi.object({
    quantity: Joi.number()
        .integer()
        .min(1)
        .required(),
});

module.exports = {
    addCartItemSchema,
    updateCartItemSchema,
};