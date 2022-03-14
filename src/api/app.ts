import * as express from "express";
import ms700Route from "./routes/Ms700Route";
//import awsRoute from "./routes/AwsRoute";

const app: express.Application = express.default();

app.use(express.json());

app.use("/getMs700List", ms700Route);
//app.use("/getAws", awsRoute);

app.listen(3001, () => console.log("yee"));
