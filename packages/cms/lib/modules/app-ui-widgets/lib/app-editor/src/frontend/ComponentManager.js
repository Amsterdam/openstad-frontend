import React from 'react';
import { Title, RichText, Button, Video, Overview, Form, Columns, Game, Tour, Login, Splash, Images } from './components';
import {WorkoutSelectedProgram, ExcerciseWorkout} from "./components/workout";

const componentsMap = {
  'title'   :{
    component: Title,
  },
  'richText'    : {
    component: RichText,
  },
  'images'   : {
    component : Images,
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
  },
  'WorkoutSelectedProgram' : {
    component: WorkoutSelectedProgram,
  },
  'ExerciseWorkout' : {
    component: ExcerciseWorkout,
  }
}

function ComponentManager(props) {
  return (
    <>
      {props.components.map((component)  => {
        const FrontendComponent = componentsMap[component.type].component;

        // preComponent / postComponent allow per app to inject components, mainly used for allowing editing components to be injected without needing to be present in the frontend app itself

        return (
          <>
            {props.preComponent && props.preComponent}
            <FrontendComponent
              {...component.props}
              activeResource={props.activeResource}
              resources={props.resources}
              navigation={props.navigation}
            />
            {props.postComponent && props.postComponent}
          </>
        )
      })}
    </>
  );
}

export default ComponentManager;
