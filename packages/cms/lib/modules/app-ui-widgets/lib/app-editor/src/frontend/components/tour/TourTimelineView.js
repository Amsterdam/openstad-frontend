import React, { Component, useLocation } from 'react';
import { View, Text, Button, TouchableOpacity, Image } from 'react-native';
import Accordeon from '../Accordeon';
import TourDetailView from './TourDetailView';
import styles from './styles';


function TourTimelineView (props) {

  return (
      <div className="tour-detail-view" style={{
        ...styles.greyBackground
      }}>
        <div className="tour-detail-view-inner">
          <a href="#" className="tour-detail-view-close">✕</a>
          <View style={{
            ...styles.contentContainer,
            ...styles.whiteBackground
          }}>
            <Text style={{...styles.small, opacity: 0.8}}>{props.tour.location}</Text>
            <Text style={styles.h1}>{props.tour.title}</Text>
            <Text style={styles.small}>
              {props.tour.transportType}
              <Image source={require('../../../images/walking@2x.png')} style={{height: 11, width: 6}}/>
              |
              {props.tour.duration}
              <Image source={require('../../../images/clock@2x.png')} style={{height: 9, width: 9}}/>
              |
              {props.tour.language }
            </Text>
            <Text style={styles.p}>{props.tour.description}</Text>
          </View>
          <View style={{
            ...styles.contentContainer,
            ...styles.timelineContainer
          }}>
          <View style={styles.timeline} />

          {props.steps && props.steps.map((step, i) => {
            return (
                <Accordeon
                  open={props.activeStep.id === step.id}
                  style={{
                    paddingBottom: props.steps.length === (i + 1) ? 0 : 10
                  }}
                  title={
                    <View style={{...styles.h2, ...styles.noPreWrap}}>
                      <Text style={{...styles.small, color: '#333d48', paddingRight: 7, paddingTop: 4, paddingBottom: 5}}>Location {i + 1}</Text>
                      <Text> {step.title} </Text>
                    </View>
                  }
                >
                  <TourDetailView
                    step={step}
                    playAudio={props.playAudio}
                    openGallery={props.openGallery}
                  />
              </Accordeon>
            )
          })}
          </View>

      </div>
    </div>
  )
}

export default TourTimelineView;
