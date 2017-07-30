/**
 * Created by dharatamhane on 7/30/17.
 */

"use strict";

const commandLineArgs = require('command-line-args');
var GitHubApi = require("github");

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

function init() {
    if (validateCliParams()) {
        fetchGitMetadata();
    }
}

init();