import Express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import api from "@/api";
const app = Express();

app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());

app.use("/api", api);

app.get("*", (req, res) => {
  res.status(404).render("404");
});

export default (port: number) => {
  app.listen(port);
  return app;
};
