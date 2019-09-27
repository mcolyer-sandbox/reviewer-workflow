const core = require('@actions/core');
const github = require('@actions/github');
const octokit = new github.GitHub(process.env.GITHUB_TOKEN, {log: console});

async function replaceTeamWithReviewer(repositoryOwner, repositoryName, pullRequestNumber, team){
  console.log("Team: "+team["id"])
  var {data: members} = await octokit.teams.listMembers({team_id: team["id"]})
  console.log(JSON.stringify(members))
  for(var ii=0; ii < members.length; ii++) {
    const member = members[ii]
    console.log(JSON.stringify(member))
  }

  console.log("")

  console.log("Adding "+members[1]["login"]+" as a reviewer")
  await octokit.pulls.createReviewRequest({
      owner: repositoryOwner,
      repo: repositoryName,
      pull_number: pullRequestNumber,
      reviewers: [members[1]["login"]]
  })

  console.log("Removing "+team["slug"]+" as a reviewer")
  await octokit.pulls.deleteReviewRequest({
      owner: repositoryOwner,
      repo: repositoryName,
      pull_number: pullRequestNumber,
      reviewers: [],
      team_reviewers: [team["slug"]]
  })
}

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

    replaceTeamWithReviewer(repositoryOwner, repositoryName, pullRequestNumber, team);
  }
} catch (error) {
  core.setFailed(error.message);
}
