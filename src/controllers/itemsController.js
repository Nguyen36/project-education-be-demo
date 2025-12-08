const itemsService = require('../services/itemsService');

const getItems = (req, res, next) => {

  try {

    const items = itemsService.getAllItems();

    res.json(items);

  } catch (error) {

    next(error);

  }

};

const createItem = (req, res, next) => {

  try {

    const newItem = itemsService.createItem(req.body);

    res.status(201).json(newItem);

  } catch (error) {

    next(error);

  }

};

module.exports = { getItems, createItem };
