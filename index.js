const core = require('@actions/core');
const github = require('@actions/github');
const octokit = new github.GitHub(token);

try {
  const repository = github.context.payload["repository"]
  const repositoryName = repository["name"]
  const repositoryOwner = repository["owner"]["login"]
  const pullRequest = github.context.payload["pull_request"]
  const pullRequestNumber = github.context.payload["number"]

  pullRequest["requested_teams"].forEach(function(team) {
    console.log(JSON.stringify(team));

    console.log("Team:")
    var members = octokit.teams.listMembers(team["id"])
    members.forEach(function(member) {
      console.log(JSON.stringify(member))
    })

    console.log("")

    console.log("Adding "+members.first["login"]+" as a reviewer")
    octokit.pulls.createReviewRequest({
        owner: repositoryOwner,
        repo: repositoryName,
        pull_number: pullRequestNumber,
        reviewers: [members.first["login"]]
    })

    console.log("Removing "+team["slug"]+" as a reviewer")
    octokit.pulls.deleteReviewRequest({
        owner: repositoryOwner,
        repo: repositoryName,
        pull_number: pullRequestNumber,
        team_reviewers: [team["slug"]]
    })
} catch (error) {
  core.setFailed(error.message);
}
