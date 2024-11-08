import { Octokit } from "octokit";
import pkg from "@slack/bolt";
import dotenv from "dotenv";

const { App } = pkg;
dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

const octokit = new Octokit({
  auth: process.env.ACCESS_TOKEN,
});

const owner = process.env.DISPATCH_OWNER;
const repo = process.env.DISPATCH_REPO;
const eventType = process.env.DISPATCH_EVENT_TYPE;

// 슬랙 봇에서 "완료" 버튼 클릭 시 Github으로 Repository Dispatch 를 보내는 기능입니다.
app.action("complete_write_release_note", async ({ ack }) => {
  await ack();

  try {
    await octokit.request("POST /repos/{owner}/{repo}/dispatches", {
      owner: owner,
      repo: repo,
      event_type: eventType,
      client_payload: {
        clicked: true,
      },

      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    console.log("완료 요청 후 Repository dispatch 완료");
  } catch (error) {
    console.error(`error - post dispatch: ${error}`);
  }
});

(async () => {
  await app.start();
  console.log("app start");
})();
