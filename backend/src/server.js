const app = require("./app");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");


const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);



const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();