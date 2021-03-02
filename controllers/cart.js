import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";

import _ from "lodash";

const getCart = async (req, res, next) => {
  try {
    const { account_id, scope } = req;
    // Get brief
    let cart = await models.Cart.query()
      .where({ account_id })
      .withGraphFetched(`[items]`)
      .first();

    if (!cart) cart = await models.Cart.query().insert({ account_id });

    // Send the clientss
    return res.status(200).send(cart);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const addCartItem = async (req, res, next) => {
  try {
    const { account_id } = req.params;
    let cart = await models.Cart.query().where({ account_id }).first();
    if (!cart) {
      cart = await models.Cart.query().insert({ account_id });
    }
    for (let item of req.body) {
      item.cart_id = cart.id;
      item.ordered = true;
    }
    const response = await models.CartItem.query().insertGraph(req.body);
    // Send the clients
    return res.status(200).send({ Status: true, insertedData: response });
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { account_id, scope } = req;

    const { cart_item_id } = req.params;

    await models.CartItem.query().deleteById(cart_item_id);

    // Send the clients
    return res.status(201).json("CartItems Deleted Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const getUserCart = async (req, res, next) => {
  try {
    const { account_id } = req.params;
    // Get brief
    const cart = await models.Cart.query().where({ account_id }).first();

    const cart_items = await models.CartItem.query()
      .withGraphFetched("[eventproduct, venueproduct]")
      .where({
        cart_id: cart.id,
        ordered: true,
      });
    const data = _.map(cart_items, (i) =>
      _.pick(i, "quantity", "eventproduct", "venueproduct", "data")
    );

    cart.items = data;
    // Send the clientss
    return res.status(200).send(cart);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const getOrdersSummary = async (req, res, next) => {
  try {
    const { account_id } = req.params;

    // Get brief
    let cart = await models.Cart.query().where({ account_id }).first();

    if (!cart) cart = await models.Cart.query().insert({ account_id });

    const cart_items = await models.CartItem.query()
      .withGraphFetched("[eventproduct, venueproduct]")
      .where({
        cart_id: cart.id,
        ordered: true,
        billed: false,
      });
    const data = _.map(cart_items, (i) =>
      _.pick(
        i,
        "quantity",
        "eventproduct",
        "venueproduct",
        "data",
        "payment_type"
      )
    );

    cart.items = data;
    // Send the clientss
    return res.status(200).send(cart);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const updateCartItems = async (req, res, next) => {
  try {
    const { cart_item } = req.params;
    // Get brief

    const cart = await models.CartItem.query()
      .update({ ordered: true, data: req.body })
      .where("id", cart_item);

    // Send the clientss
    return res.status(200).json("Updated Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const updateBill = async (req, res, next) => {
  try {
    const { account_id } = req.params;
    // Get brief

    const { payment_type } = req.body;

    const cart = await models.Cart.query().where({ account_id }).first();
    const cart_items = await models.CartItem.query()
      .update({ billed: true, payment_type: payment_type })
      .where({ cart_id: cart.id, ordered: true });

    // Send the clientss
    return res.status(200).json("Updated Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const putCartUpdate = async (req, res, next) => {
  try {
    const { ids, customer_id, payment_type } = req.body;
    const { account_id } = req;
    const response = await models.CartItem.query().whereIn("id", ids).update({
      billed: true,
      payment_type: payment_type,
      updated_by: account_id,
    });
    return res.status(200).send({ Status: true, insertedData: response });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ Status: false, error: JSON.stringify(e) });
  }
};

const cartController = {
  getCart,
  addCartItem,
  removeCartItem,
  getUserCart,
  getOrdersSummary,
  updateCartItems,
  updateBill,
  putCartUpdate,
};

export default cartController;
