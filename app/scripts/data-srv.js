let bps = bps || {};

let DataService = class {
  getData () {
    return $.get('../data/boston-assets.json');
  }
  getCategories () {
    return $.get('../data/categories.json');
  }
};

bps.dataService = new DataService();