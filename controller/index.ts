import { Request, Response } from "express";
import login from "./login";
import signup from "./signup";
import startpage from "./startpage";
import diary from "./diary";
import emotion from "./emotion";
import logout from "./logout";
import profile from "./profile";

declare module "express-session" {
  interface SessionData {
    user: number;
  }
}

//index page
async function index(req: Request, res: Response) {
  res.render("index");
}

export default {
  index,
  // login
  loginPage: login.get,
  login: login.post,
  processRequest: login.processRequest,
  // logout
  logout: logout.get,
  // signup
  signupPage: signup.get,
  signup: signup.post,
  // startpage
  StartPage: startpage.get,
  emotion: emotion.page,
  getEmotion: emotion.getEmotion,
  // profile
  profile: profile.get,
};
