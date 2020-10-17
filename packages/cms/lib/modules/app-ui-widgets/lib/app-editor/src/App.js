import React, { Component, useLocation } from 'react';
import 'react-h5-audio-player/lib/styles.css';
import './App.css';

/* Layout elements */
import LeftPanel from './Layout/LeftPanel.js';
import TopPanel from './Layout/TopPanel.js';
import MiddlePanel from './Layout/MiddlePanel.js';
import RightPanel from './Layout/RightPanel.js';
import ListItem from './Layout/ListItem.js';
import AppPreviewer from './Layout/AppPreviewer.js';

import ResourceForm from './ResourceForm.js';
import TourApp from './TourApp.js';

const listItems = [
  {
    type: 'step',
    data: {
      id: 1,
      title: 'Step 1',
      description: 'Lorem ipsum....',
      position: [52.370216, 4.895168],
      images: ['https://image-server2.openstadsdeel.nl/image/9c9554218311abb0d1797945e575db97/:/rs=w:1400,h:500;cp=w:1400,h:500']
    }
  },
  {
    type: 'step',
    data: {
      id: 2,
      title: 'Step 2',
      description: 'Lorem ipsum....',
      position: [52.360506, 4.908971],
      images: ['https://image-server2.openstadsdeel.nl/image/9c9554218311abb0d1797945e575db97/:/rs=w:1400,h:500;cp=w:1400,h:500']
    }
  },
];

const blancResource = {
    type: 'step',
    data: {
      title: 'New...',
      position: [52.360506, 4.908971],
    }
};

function UI (props) {
  return (
    <div className="App">
      <TopPanel>
        <a href="#"> My Apps </a>
      </TopPanel>
      <LeftPanel>
        {props.sidebar}
      </LeftPanel>
      <MiddlePanel>
        {props.main}
      </MiddlePanel>
      <RightPanel open={!!props.rightPanel}>
        <button onClick={props.rightPanelClose}> x </button>
        {props.rightPanel ? props.rightPanel : <div />}
      </RightPanel>
  </div>
  )
}

function Sidebar (props) {
  return <div>

    {props.resourceItems.map(function(resourceItem) {
        return(
          <ListItem active={props.activeResource && resourceItem.data.id === props.activeResource.data.id}>
            <a onClick={() => {
              props.edit(resourceItem)
            }} href="#">
              {resourceItem.data.title}
            </a>
          </ListItem>
        )
      })}
      <a href="#" style={{float: 'right'}} onClick={props.new}> +</a>
  </div>
}


// Our app
class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      activeResource: null,
      resourceItems: listItems
    };
  }

  newResource() {
    var newResource = JSON.parse(JSON.stringify(blancResource));
    var lastResource = this.state.resourceItems[this.state.resourceItems.length - 1];
    var lastResourceId = lastResource.data.id;

    newResource.data.id = lastResourceId + 1;

    this.state.resourceItems.push(newResource);

    this.setState({
      resourceItems: this.state.resourceItems,
      activeResource: newResource
    })
  }

  updateResource(updateResource) {
    var activeResource = this.state.activeResource;
    var resourceItems = this.state.resourceItems.map(function(resource) {
      if (resource.data.id === updateResource.data.id) {
        resource = updateResource;
      }

      if (activeResource && activeResource.data.id === resource.data.id) {
        activeResource = resource;
      }

      return resource;
    });

    this.setState({
      resourceItems: resourceItems,
      activeResource: activeResource
    })
  }

  deleteResource(resource) {
    var activeResource = this.state.activeResource;

    for (var i = 0; i < this.state.resourceItems.length; i++) {
      var resourceItem = this.state.resourceItems[i];
       if (resourceItem.data.id === resource.data.id) {
        this.state.resourceItems.splice(i, 1);
        i--;
        if (activeResource && activeResource.data.id === resource.data.id) {
          activeResource = null;
        }
       }
    }

    this.setState({
      resourceItems: this.state.resourceItems,
      activeResource: activeResource
    })
  }

  render() {
    return (
      <UI
        sidebar={
          <Sidebar
            resourceItems={this.state.resourceItems}
            activeResource={this.state.activeResource}
            edit={(resource) => {
              this.setState({
                activeResource: resource
              })
            }}
            new={this.newResource.bind(this)}
            delete={this.deleteResource.bind(this)}
          />
        }
        main={
          <AppPreviewer>
            <TourApp
              steps={
                this.state.resourceItems
                  .filter(function(resource){ return resource.type === 'step'; })
                  .map(function(step){ return step.data; } )
              }
            />
          </AppPreviewer>
        }
        rightPanel={
          this.state.activeResource ?
            <ResourceForm
              resource={this.state.activeResource}
              updateResource={this.updateResource.bind(this)}
            /> : false
        }
        rightPanelClose={() => {
          this.setState({
            activeResource: null
          })
        }}
      />
    );
  }
}


export default App;
