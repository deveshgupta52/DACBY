import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import "./src/jobs/cron.js";


connectDB();

app.listen(3000, () => {
    console.log(`Server running on port 3000`);
});

