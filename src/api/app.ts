import * as express from "express";
import ms700Route from "./routes/Ms700Route";
import awsRoute from "./routes/AwsRoute";
import cs451Route from "./routes/Cs451Route";
import hfp01Route from "./routes/Hfp01Route";

const app: express.Application = express.default();

app.use(express.json());

app.use("/getMs700List", ms700Route);
app.use("/getAwsList", awsRoute);
app.use("/getCs451List", cs451Route);
app.use("/getHfp01List", hfp01Route);

app.listen(3001, () => console.log("Started KARI API"));
