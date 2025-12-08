let items = [

  { id: 1, name: 'Sample Item 1' },

  { id: 2, name: 'Sample Item 2' }

];

let nextId = 3;

const getAllItems = () => {

  return items;

};

const createItem = (itemData) => {

  const newItem = { id: nextId++, ...itemData };

  items.push(newItem);

  return newItem;

};

module.exports = { getAllItems, createItem };
