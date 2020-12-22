import React from 'react';
import { Title, RichText, Images, Button, Video, Overview, Form, Columns, Game, Tour, Login, Splash } from './components';
import { View, Text } from "react-native";

const componentstMap = {
  'title'   :{
    component: Title,
  },
  'richText'    : {
    component: RichText,
  },
  'image'   : {
    component :Image,
  },
  'button'  : {
    component :Button,
  },
  'video'  : {
    component :Video,
  },
  'overview'  : {
    component :Overview,
  },
  'form'  : {
    component :Form,
  },
  'column'   : {
    component :Columns,
  },
  'game'   :{
    component :Game,
  },
  'tour'   : {
    component :Tour,
  },
  'map'   : {
    component :Map,
  },
  'login'   : {
    component :Login,
  },
  'splash'   : {
    component :Splash,
  }
}

function ComponentManager(props) {
  return (
    <>
      {props.components.map((component)  => {
        const FrontendComponent = componentstMap[component.type].component;

        // preCompononent / postCompononent allow per app to inject components, mainly used for allowing editing components to be injected without needing to be present in the frontend app itself

        return (
          <>
            {props.preCompononent && props.preCompononent}
            <FrontendComponent
              {...component.props}
              activeResource={props.activeResource}
              resources={props.resources}
              navigation={props.navigation}
            />
            {props.postCompononent && props.postCompononent}
          </>
        )
      })}
    </>
  );
}

export default ComponentManager;