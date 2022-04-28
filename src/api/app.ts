import * as express from "express";
import ms700Route from "./routes/Ms700Route";
import awsRoute from "./routes/AwsRoute";
import cs451Route from "./routes/Cs451Route";
import hfp01Route from "./routes/Hfp01Route";
import li191Route from "./routes/Li191Route";
import si111Route from "./routes/Si111Route";
import crn4Route from "./routes/Crn4Route";

const app: express.Application = express.default();

app.use(express.json());

app.use("/getMs700List", ms700Route);
app.use("/getAwsList", awsRoute);
app.use("/getCs451List", cs451Route);
app.use("/getHfp01List", hfp01Route);
app.use("/getLi191List", li191Route);
app.use("/getSi111List", si111Route);
app.use("/getCrn4List", crn4Route);

app.listen(3001, () => console.info("Started KARI API"));
