import dotenv from "dotenv";
import express from "express";
import cors from "cors";
dotenv.config();

const app = express();
import { createContent, fetchContent } from "./controllers/content.controller";
import {
  insertFragments,
  readFragments,
} from "./controllers/fragment.controller";

//middleware
app.use(cors());
app.use(express.json());

/*
##################################################
||                                              ||
||              Example endpoints               ||
||                                              ||
##################################################
*/

// Root endpoint - Returns a simple hello world message and default client port
app.get("/", async (_req, res) => {
  res.json({ hello: "world", "client-default-port": 3000 });
});

// Get the content for a given slug. Supply `password` as a query parameter if needed.
app.get("/content/:contentSlug", async (_req, res) => {
  try {
    const { contentSlug } = _req.params;
    const { password } = _req.query;

    if (!contentSlug) {
      res.sendStatus(400);
      return;
    }

    const content = await fetchContent(contentSlug, password as string);

    if (!content) {
      // Prevent hijacking.
      res.sendStatus(404);
      return;
    }

    const text = await readFragments(contentSlug, password as string);

    res.json({ ...content, text });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Add Content.
app.post("/content", async (req, res) => {
  try {
    const { expiry, isEnv, text, password } = req.body as {
      expiry: Date;
      isEnv: boolean;
      text: string;
      password?: string;
    };

    if (!expiry || expiry < new Date() || isEnv === undefined || !text) {
      res.sendStatus(400);
      return;
    }

    const contentSlug = await createContent(expiry, isEnv, password);
    await insertFragments(text, contentSlug, password);

    res.json({ contentSlug });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
