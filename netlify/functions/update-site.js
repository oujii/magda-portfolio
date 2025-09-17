const { Octokit } = require("@octokit/rest");

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { projects, settings, message } = JSON.parse(event.body);

    // GitHub configuration
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    const owner = "oujii";
    const repo = "magda-portfolio";
    const branch = "main";

    // Get current file SHA for projects.json
    const projectsFile = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: "new/data/projects.json",
      ref: branch
    });

    // Update projects.json
    if (projects) {
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: "new/data/projects.json",
        message: message || "Uppdatera projekt från admin-panel",
        content: Buffer.from(JSON.stringify(projects, null, 2)).toString('base64'),
        sha: projectsFile.data.sha,
        branch
      });
    }

    // Update settings if provided (in HTML files)
    if (settings) {
      // For now, we'll just save settings to a JSON file
      // Later we can parse and update actual HTML files
      try {
        const settingsFile = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: "new/data/settings.json",
          ref: branch
        });

        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: "new/data/settings.json",
          message: "Uppdatera inställningar från admin-panel",
          content: Buffer.from(JSON.stringify(settings, null, 2)).toString('base64'),
          sha: settingsFile.data.sha,
          branch
        });
      } catch (error) {
        // File doesn't exist, create it
        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: "new/data/settings.json",
          message: "Skapa inställningsfil från admin-panel",
          content: Buffer.from(JSON.stringify(settings, null, 2)).toString('base64'),
          branch
        });
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        message: 'Ändringar sparade och pushade till GitHub!'
      })
    };

  } catch (error) {
    console.error('Error updating site:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

