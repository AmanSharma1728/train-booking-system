const Train = require("./train.model")

 class TrainRepository{
  async findById(id) {
    return await Train.findOne({ id: id });
  }

  async findByQuery(filter) {
    return await Train.find(filter);
  }
}

module.exports = TrainRepository