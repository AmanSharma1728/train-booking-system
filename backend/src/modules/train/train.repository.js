const Train = require("./train.model")

 class TrainRepository{
    async findByQuery(filter){
       return await Train.find(filter)
    }
}

module.exports = TrainRepository