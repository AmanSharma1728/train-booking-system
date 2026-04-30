const Train = require("./train.model")

 class TrainRepository{
  async findById(id) {
    return await Train.findOne({ id: id });
  }

  async findByQuery(filter) {
    return await Train.find(filter);
  }

  async decrementInventory(trainId, classCode, count) {
    console.log(`[DEBUG] Decrementing inventory for Train: ${trainId}, Class: ${classCode}, Count: ${count}`);
    const update = {
      $inc: { [`inventory.${classCode}.available`]: -count },
    };
    const updatedTrain = await Train.findOneAndUpdate({ id: trainId }, update, { new: true });
    console.log(`[DEBUG] Updated Train Availability:`, updatedTrain?.inventory?.get(classCode)?.available);
    return updatedTrain;
  }

  async incrementInventory(trainId, classCode, count) {
    console.log(`[DEBUG] Incrementing inventory for Train: ${trainId}, Class: ${classCode}, Count: ${count}`);
    const update = {
      $inc: { [`inventory.${classCode}.available`]: count },
    };
    return await Train.findOneAndUpdate({ id: trainId }, update, { new: true });
  }
}

module.exports = TrainRepository