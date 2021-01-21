/**
 * The openstad-auth Module contains routes and logic for authenticating users with the openstad API
 * and if valid fetches the user data
 */

const rp = require('request-promise');
const Url = require('url');
const apiLogoutUrl = process.env.API_LOGOUT_URL;
const internalApiUrl = process.env.INTERNAL_API_URL;

function removeURLParameter(url, parameter) {
    //prefer to use l.search if you have a location/link object
    var urlparts = url.split('?');
    if (urlparts.length >= 2) {

        var prefix = encodeURIComponent(parameter) + '=';
        var pars = urlparts[1].split(/[&;]/g);

        //reverse iteration as may be destructive
        for (var i = pars.length; i-- > 0;) {
            //idiom for string.startsWith
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                pars.splice(i, 1);
            }
        }

        return urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
    }
    return url;
}

module.exports = {
  construct: function(self, options) {
    self.expressMiddleware = {
      when: 'afterRequired',
      middleware: (req, res, next) => {
        var url      = req.originalUrl;
    		var method   = req.method;
    		var userId   = req.user && req.user.id;
    		var userRole = req.user && req.user.role;
        self.authenticate(req, res, next);
      }
    };

  // You can add routes here
    self.authenticate = (req, res, next) => {

      //apostropheCMS for some reasons always sets the scene to user
      //this means it always assumes the user is logged in into the CMS
      req.scene = req.user ? 'user' : 'anon';

      const thisHost = req.headers['x-forwarded-host'] || req.get('host');
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const fullUrl = protocol + '://' + thisHost + req.originalUrl;
      const parsedUrl = Url.parse(fullUrl, true);
      let fullUrlPath = parsedUrl.path;

      //add apostrophes permissions function to the data object so we can check it in the templates
      req.data.userCan = function (permission) {
         return self.apos.permissions.can(req, permission);
      };

      if (req.query.jwt) {
        const thisHost = req.headers['x-forwarded-host'] || req.get('host');
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const fullUrl = protocol + '://' + thisHost + req.originalUrl;
        const cmsUrl = self.apos.settings.getOption(req, 'siteUrl');

        const parsedUrl = Url.parse(fullUrl, true);
        let fullUrlPath = parsedUrl.path;

        // remove the JWT Parameter otherwise keeps redirecting
        let returnTo = req.session.returnTo ? req.session.returnTo : removeURLParameter(fullUrlPath, 'jwt');
        console.log('returnTo', returnTo)

        const sitePrefix = req.sitePrefix ?  '/' + req.sitePrefix : false;
        console.log('sitePrefix', sitePrefix)

        // incase the site prefix, this happens to be filled for a /subdir, make sure this is removed if it exists, otherwise it will be added double
        returnTo = sitePrefix && returnTo.startsWith(sitePrefix) ? returnTo.replace(sitePrefix, '') : sitePrefix
        console.log('returnT o 2', returnTo)

        // make sure references to external urls fail, only take the path
        returnTo = Url.parse(returnTo, true);

        returnTo = cmsUrl + returnTo.path;
        req.session.jwt = req.query.jwt;
        req.session.returnTo = null;

        req.session.save(() => {
          res.redirect(returnTo);
          return;
        });

      } else {
        const jwt = req.session.jwt;
        const apiUrl = internalApiUrl ? internalApiUrl : self.apos.settings.getOption(req, 'apiUrl');

        if (!jwt) {
          next();
        } else {

				let url = req.data.global.siteId ? `${apiUrl}/oauth/site/${req.data.global.siteId}/me` : `${apiUrl}/oauth/me`;

        var options = {
             uri: url,
             headers: {
                 'Accept': 'application/json',
                 "X-Authorization" : `Bearer ${jwt}`,
                 "Cache-Control": "no-cache"
             },
             json: true // Automatically parses the JSON string in the response
         };

         const setUserData = function (req, next) {

           const requiredRoles = ['member', 'moderator', 'admin', 'editor'];
           const user = req.session.openstadUser;
           req.data.loggedIn = user &&  user.role && requiredRoles.includes(user.role);
           req.data.openstadUser = user;
           req.data.isAdmin = user.role === 'admin'; // user;
           req.data.isEditor = user.role === 'editor'; // user;
           req.data.isModerator = user.role === 'moderator'; // user;
           req.data.jwt = jwt;

           if (req.data.isAdmin || req.data.isEditor || req.data.isModerator) {
             req.data.hasModeratorRights = true;
           }


           req.session.save(() => {
             next();
           });
         }

         const FIVE_MINUTES = 5 * 60 * 1000;
         const date = new Date();
         const dateToCheck = req.session.lastJWTCheck ? new Date(req.session.lastJWTCheck) : new Date;

         // apostropheCMS does a lot calls on page load
         // if user is a CMS user and last apicheck was within 5 seconds ago don't repeat
         if (req.user && req.session.openstadUser && ((date - dateToCheck) < FIVE_MINUTES)) {
            setUserData(req, next);
         } else {
             rp(options)
             .then(function (user) {
               if (user && Object.keys(user).length > 0 && user.id) {
                 req.session.openstadUser = user;
                 req.session.lastJWTCheck = new Date().toISOString();

                 setUserData(req, next)
               } else {
                 // if not valid clear the JWT and redirect
                 req.session.destroy(() => {
                   const siteUrl = self.apos.settings.getOption(req, 'siteUrl');
                   res.redirect(siteUrl +  '/');
                   return;
                 });
               }

             })
             .catch((e) => {
               console.log('e', e);
                 req.session.destroy(() => {
                   const siteUrl = self.apos.settings.getOption(req, 'siteUrl');
                   res.redirect(siteUrl + '/');
                   return;
                 })
             });
          }
         }
       }
    };



    /**
     * When the user is admin, load in all the voting data
     * @type {[type]}

    self.apos.app.use((req, res, next) => {
      if (req.data.hasModeratorRights) {
        const apiUrl = internalApiUrl ? internalApiUrl : self.apos.settings.getOption(req, 'apiUrl');
        const jwt = req.session.jwt;

        rp({
            uri: `${apiUrl}/api/site/${req.data.global.siteId}/vote`,
            headers: {
                'Accept': 'application/json',
                "X-Authorization" : `Bearer ${jwt}`,
                "Cache-Control": "no-cache"
            },
            json: true // Automatically parses the JSON string in the response
        })
        .then(function (votes) {
          req.data.votes = votes;
          return next();
        })
        .catch((e) => {
          return next();
        });

      } else {
        return next();
      }
    });
 */

    self.apos.app.get('/oauth/logout', (req, res, next) => {
      req.session.destroy(() => {
        const apiUrl = self.apos.settings.getOption(req, 'apiUrl');
        const fullUrl = self.apos.settings.getOption(req, 'siteUrl');
        const url = apiUrl + '/oauth/site/'+req.data.global.siteId+'/logout?redirectUrl=' + fullUrl;
        res.redirect(url);
      });
    });

    // nice route for admin login
    self.apos.app.get('/admin/login', (req, res, next) => {
      // empty openstadUser, this doesn't logout user
      // but clears it's session cache so it will be fetched freshly
      // this is necessary in case of voting or logging out
      if (req.session.openstadUser) {
        req.session.openstadUser = null;
      }

      req.session.save(() => {
        const siteUrl = self.apos.settings.getOption(req, 'siteUrl');
        res.redirect(siteUrl + '/oauth/login?loginPriviliged=1');
      })
    });

    self.apos.app.get('/oauth/login', (req, res, next) => {
        // check in url if returnTo params is set for redirecting to page
        req.session.returnTo = req.query.returnTo ?  decodeURIComponent(req.query.returnTo) : null;

        req.session.save(() => {
          const apiUrl = self.apos.settings.getOption(req, 'apiUrl');
          const thisHost = req.headers['x-forwarded-host'] || req.get('host');
          const protocol = req.headers['x-forwarded-proto'] || req.protocol;
          let returnUrl = self.apos.settings.getOption(req, 'siteUrl');

          if (req.query.returnTo && typeof req.query.returnTo === 'string') {
            //only get the pathname to prevent external redirects
            let pathToReturnTo = Url.parse(req.query.returnTo, true);
            pathToReturnTo = pathToReturnTo.path;
            returnUrl = returnUrl + pathToReturnTo;
          }

          let url = `${apiUrl}/oauth/site/${req.data.global.siteId}/login?redirectUrl=${returnUrl}`;


          url = req.query.useOauth ? url + '&useOauth=' + req.query.useOauth : url;
          url = req.query.loginPriviliged ? url + '&loginPriviliged=1' : url + '&forceNewLogin=1';
          res.redirect(url);
        });
    });
  }
};
