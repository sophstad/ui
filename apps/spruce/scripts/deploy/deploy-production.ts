import prompts from "prompts";
import { runDeploy } from "./utils/deploy";
import { isRunningOnCI } from "./utils/environment";
import { getCommitMessages, getCurrentlyDeployedCommit } from "./utils/git";
import { tagUtils } from "./utils/git/tag";

const { createTagAndPush, deleteTag, getLatestTag, pushTags } = tagUtils;
/* Deploy by pushing a git tag, to be picked up and built by Evergreen, and deployed to S3. */
const evergreenDeploy = async () => {
  try {
    const currentlyDeployedCommit = getCurrentlyDeployedCommit();
    console.log(`Currently Deployed Commit: ${currentlyDeployedCommit}`);

    const commitMessages = getCommitMessages(currentlyDeployedCommit);

    // If there are no commit messages, ask the user if they want to delete and re-push the latest tag, thereby forcing a deploy with no new commits.
    if (commitMessages.length === 0) {
      const latestTag = getLatestTag();
      const { value: shouldForceDeploy } = await prompts({
        type: "confirm",
        name: "value",
        message: `No new commits. Do you want to trigger a deploy on the most recent existing tag? (${latestTag})`,
        initial: false,
      });

      if (shouldForceDeploy) {
        deleteTag(latestTag);
        pushTags();
        console.log("Check Evergreen for deploy progress.");
      } else {
        console.log(
          "Deploy canceled. If systems are experiencing an outage and you'd like to push the deploy directly to S3, run yarn deploy:prod --local.",
        );
      }
      return;
    }

    // Print all commits between the last tag and the current commit
    console.log(`Commit messages:\n${commitMessages}`);

    const { value: version } = await prompts({
      type: "select",
      name: "value",
      message: "How should this deploy be versioned?",
      choices: [
        { title: "Patch", value: "patch" },
        { title: "Minor", value: "minor" },
        { title: "Major", value: "major" },
      ],
      initial: 0,
    });

    if (version) {
      createTagAndPush(version);
    }
  } catch (err) {
    console.error(err);
    console.log("Deploy failed.");
    process.exit(1);
  }
};

/* Deploy by generating a production build locally and pushing it directly to S3. */
const localDeploy = async () => {
  try {
    const response = await prompts({
      type: "confirm",
      name: "value",
      message:
        "Are you sure you'd like to build Spruce locally and push directly to S3? This is a high-risk operation that requires a correctly configured local environment.",
    });
    if (response.value) {
      runDeploy();
    }
  } catch (err) {
    console.error(err);
    console.error("Local deploy failed. Aborting.");
    process.exit(1);
  }
};

/**
 * `ciDeploy` is a special deploy function that is only run on CI. It does the actual deploy to S3.
 */
const ciDeploy = async () => {
  try {
    if (!isRunningOnCI()) {
      throw new Error("Not running on CI");
    }
    runDeploy();
  } catch (err) {
    console.error(err);
    console.error("CI deploy failed. Aborting.");
    process.exit(1);
  }
};

export { evergreenDeploy, localDeploy, ciDeploy };
