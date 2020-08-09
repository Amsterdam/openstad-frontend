const styleSchema = require('../../../config/styleSchema.js').default;

const fields = [
  {
    type: 'select',
    name: 'displayType',
    label: 'Weergave',
    help: 'Voting needs to be set to like and should be added on a resource idea page in order to work',
    choices: [
      {
        label: 'Claps',
        value: 'claps',
      },
    ]
  },
  styleSchema.definition('containerStyles', 'Styles for the container')
];

module.exports = {
  extend: 'apostrophe-widgets',
  label: 'Like',
  addFields: fields,
  construct: function(self, options) {
     let classIdeaId;

     const superPushAssets = self.pushAssets;
     self.pushAssets = function () {
       superPushAssets();
       self.pushAsset('stylesheet', 'main', { when: 'always' });
       self.pushAsset('script', 'main', { when: 'always' });
     };

      const superLoad = self.load;
      self.load = function (req, widgets, next) {
        widgets.forEach((widget) => {
            if (widget.containerStyles) {
              const containerId = widget._id;
              widget.containerId = containerId;
              widget.formattedContainerStyles = styleSchema.format(containerId, widget.containerStyles);
            }
         });

        return superLoad(req, widgets, next);
      }


  }
};
