
const mongoose = require("mongoose");

const clientOption = {
  keepAlive: true,
  useNewUrlParser: true,
};
const option = { useNewUrlParser: true };

const initClientDbConnection = () => {
  const db = mongoose.createConnection(process.env.MONGO_URL, clientOption);

  db.on("error", console.error.bind(console, "MongoDB Connection Error>> : "));
  db.once("open", function() {
    console.log("Client MongoDB Connection OK");
  });
  return db;
};

module.exports = {
    initClientDbConnection
};
