import React, { Component } from 'react';

import L from 'leaflet';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import { getMessages, getLocation, sendMessage } from './API';
import MessageCard from './MessageCard'; 
import Joi from 'joi';

import messageLocationURL from './simpleLocation.svg';
import './App.css';



var myIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -41]
})

var messageIcon = L.icon({
  iconUrl: messageLocationURL,
  iconSize: [40, 80],
  iconAnchor: [20, 80],
  popupAnchor: [0, -80]
})

const schema = Joi.object().keys({
  name: Joi.string().min(1).max(100).required(),
  message: Joi.string().min(1).max(500).required()
});


class App extends Component {

  state = {
    location: {
      lat: 51.505,
      lng: -0.09,
    },
    haveUsersLocation: false,
    zoom: 1,
    userMessage: {
      name: '',
      message: ''
    },
    sendingMessage: false,
    sentMessage: false,
    messages: []
  }

  componentDidMount() {
    getMessages()
      .then(messages => {
        this.setState({
          messages
        })
      });

    getLocation()
      .then(location => {
        this.setState({
          location,
          haveUsersLocation: true,
          zoom: 13
        });
      });
  }

  formIsValid = () => {
    const userMessage = {
      name: this.state.userMessage.name,
      message: this.state.userMessage.message
    };
    const result = Joi.validate(userMessage, schema);
    return !result.error && this.state.haveUsersLocation ? true : false;
  }


  // When we want to submit a form to server, we should run server in the server folder first
  // e.g. $npm run dev
  formSubmitted = (event) => {
    event.preventDefault();
    // console.log('In formsubmitted');

    if (this.formIsValid()) {
      this.setState({
        sendingMessage: true
      });

      const message = {
        name: this.state.userMessage.name,
        message: this.state.userMessage.message,
        latitude: this.state.location.lat,
        longitude: this.state.location.lng
      };

      sendMessage(message)
        .then((result) => {
          setTimeout(() => {
            this.setState({
              sendingMessage: false,
              sentMessage: true
            });
          }, 4000);
        });
      
    }
  }

  valueChanged = (event) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      userMessage: {
        ...prevState.userMessage,
        [name]: value
      }
    }));
  }

  render() {
    const position = [this.state.location.lat, this.state.location.lng];
    return (
      <div className="map">
        <Map className="map"
          center={position} zoom={13}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          {
            this.state.haveUsersLocation ?
              <Marker
                icon={myIcon}
                position={position}>
                <Popup>Your location</Popup>
              </Marker> : ''
          }
          {this.state.messages.map(message => (
            <Marker
              key={message._id}
              icon={messageIcon}
              position={[message.latitude, message.longitude]}>
              <Popup>
                <p><em>{message.name}:</em> {message.message}</p>
                {message.otherMessages ? message.otherMessages.map(message => <p key="message._id"><em>{message.name}:</em> {message.message}</p>) : ''}
              </Popup>
            </Marker>
          ))}
        </Map>
        <MessageCard
          sendingMessage={this.state.sendingMessage}
          sentMessage={this.state.sentMessage}
          haveUsersLocation={this.state.haveUsersLocation}
          formSubmitted={this.formSubmitted}
          valueChanged={this.valueChanged}
          formIsValid={this.formIsValid}
          />
      </div>
    )
  }
}

export default App;
