let bps = bps || {};

let DataService = class {
  getData () {
    return $.get('../data/merged.json');
  }
  getCategories () {
    return $.get('../data/categories.json');
  }
};

bps.dataService = new DataService();