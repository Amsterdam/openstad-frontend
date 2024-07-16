let appInsights = require('applicationinsights');

const openstadCms = require('@openstad/cms');

require('dotenv').config();

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  console.log(`Staring Application Insights`)
  appInsights.setup()
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoDependencyCorrelation(true)
    .setUseDiskRetryCaching(true);
  appInsights.defaultClient.config.samplingPercentage = process.env.APPLICATIONINSIGHTS_SAMPLING_PERCENTAGE ? process.env.APPLICATIONINSIGHTS_SAMPLING_PERCENTAGE : 100;
  appInsights.start();
}

var apos = openstadCms.site({
  bundles: ['@openstad/cms'],
  // See lib/modules for basic project-level configuration of our modules
  // responsible for serving static assets, managing page templates and
  // configuring user accounts.

  modules: {  }
});
