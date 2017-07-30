/**
 * Created by dharatamhane on 7/30/17.
 */

"use strict";

const commandLineArgs = require('command-line-args');
var GitHubApi = require("github");
var Table = require('cli-table');

var github = new GitHubApi({});
var options;

function validateCliParams() {
    const cliOptionDefinitions = [
        {name: 'repo', alias: 'r', type: String},
        {name: 'jira_key', alias: 'j', type: String},
        {name: 'since', alias: 's', type: String}
    ];
    var paramsValidated = false;

    options = commandLineArgs(cliOptionDefinitions);

    for (var i = 0; i < cliOptionDefinitions.length; i++) {
        if (!options[cliOptionDefinitions[i].name]) {
            console.log('Missing parameter: ' + cliOptionDefinitions[i].name);
            paramsValidated = false;
            break;
        }
        paramsValidated = true;
    }
    return paramsValidated;
}

function fetchGitMetadata() {
    var repoArr = options.repo.split('/');
    var owner = repoArr[0];
    var repo = repoArr[1];
    var gitPullData = [];

    github.pullRequests.getAll({
        owner: owner,
        repo: repo,
        state: 'all'
    }, function (err, res) {
        if (err) {
            console.log('something went wrong! Please try again later!')
        }
        gitPullData = res.data;
        printPullData(gitPullData);
        constructAndPrintAuthorsData(gitPullData);
    });
}

function printPullData(pullData) {
    if (pullData.length === 0) return;

    var pullDetailsTable = new Table({
        head: ['Title', 'State', 'Created at', 'Merged at']
        , colWidths: [75, 15, 15, 15]
    });

    pullData.forEach(function (pullReq) {
        var created_at = new Date(pullReq.created_at).toISOString().replace(/T.*/, '');
        var merged_at = pullReq.merged_at ? new Date(pullReq.merged_at).toISOString().replace(/T.*/, '') : '---';

        pullDetailsTable.push([pullReq.title, pullReq.state, created_at, merged_at]);
    });

    console.log("*** GitHub repo: " + options.repo + " ***");
    console.log(pullDetailsTable.toString());
}

function prettyPrintAuthors(authorsData) {
    if (!authorsData) return;

    var authorsTable = new Table({
        head: ['Author', 'Merged PRs', 'All PRs']
        , colWidths: [25, 15, 15]
    });

    Object.keys(authorsData).forEach(function (key) {
        authorsTable.push([authorsData[key].name, authorsData[key].mergedPR, authorsData[key].totalPR]);
    });

    console.log("*** Authors ***");
    console.log(authorsTable.toString());

}

function constructAndPrintAuthorsData(data) {
    var authorStats = {};

    if (data.length === 0) return;

    data.forEach(function (pullReq) {
        if (!authorStats[pullReq.user.login]) {
            authorStats[pullReq.user.login] = {
                name: pullReq.user.login,
                totalPR: 1,
                mergedPR: pullReq.state !== "open" ? 1 : 0
            }
        } else {
            authorStats[pullReq.user.login].totalPR += 1;
            pullReq.state !== "open" ? authorStats[pullReq.user.login].mergedPR += 1 : "";
        }
    });
}

function init() {
    if (validateCliParams()) {
        fetchGitMetadata();
    }
}

init();