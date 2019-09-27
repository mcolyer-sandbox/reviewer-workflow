const core = require('@actions/core');
const github = require('@actions/github');
const octokit = new github.GitHub(process.env.GITHUB_TOKEN);

try {
  const repository = github.context.payload["repository"]
  const repositoryName = repository["name"]
  const repositoryOwner = repository["owner"]["login"]
  const pullRequest = github.context.payload["pull_request"]
  const pullRequestNumber = github.context.payload["number"]

  for(var i=0; i < pullRequest["requested_teams"].length; i++) {
    const team = pullRequest["requested_teams"][i]
    console.log(JSON.stringify(team));
    console.log("")

    console.log("Team:")
    var members = octokit.teams.listMembers({team_id: team["id"]})
    for(var ii=0; i < members.length; i++) {
      const member = members[ii]
      console.log(JSON.stringify(member))
    }

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
  }
} catch (error) {
  core.setFailed(error.message);
}
