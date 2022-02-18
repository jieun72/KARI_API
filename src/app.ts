import * as express from "express";
import testRouter from "./routes/test";

const app: express.Application = express.default();

app.use(express.json());

app.use("/", testRouter);

app.listen(3001, () => console.log("yee"));
