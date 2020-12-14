import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";

const getCart = async (req, res, next) => {
  try {
    const { account_id, scope } = req;
    // Get brief
    let cart = await models.Cart.query()
      .where({ account_id })
      .withGraphFetched(`[items, user]`)
      .orderBy("created_at", "desc");

    if (cart.length === 0)
      cart = await models.Cart.query().insert({ account_id });

    // Send the clientss
    return res.status(200).send(cart);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const addCartItem = async (req, res, next) => {
  try {
    const { account_id, scope } = req;

    const new_venue = await models.CartItem.query().insertGraph(req.body);

    // Send the clients
    return res.status(201).json("CartItems Created Successfully").send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { account_id, scope } = req;

    const { cart_item_id } = req.params;

    const new_venue = await models.CartItem.query().deleteById(cart_item_id);

    // Send the clients
    return res.status(201).json("CartItems Deleted Successfully").send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const cartController = {
  getCart,
  addCartItem,
  removeCartItem,
};

export default cartController;
