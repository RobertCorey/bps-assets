let bps = bps || {};

let DataService = class {
  getData () {
    return $.get('../data/boston-assets.json');
  }
};

bps.dataService = new DataService();