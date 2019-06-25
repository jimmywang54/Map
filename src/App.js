import React, { Component } from 'react';

import L from 'leaflet';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import { Card, Button, CardTitle, CardText, Form, FormGroup, Label, Input } from 'reactstrap';
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

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1/messages' : 'production-url-here';

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
    fetch(API_URL)
      .then(res => res.json())
      .then(messages => {
        const haveSeenLocation = {};
        messages = messages.reduce((all, message) => {
          const key = `${message.latitude.toFixed(4)}${message.longitude.toFixed(4)}`;
          if(haveSeenLocation[key]) {
            haveSeenLocation[key].otherMessages = haveSeenLocation[key].otherMessages || [];
            haveSeenLocation[key].otherMessages.push(message);
          } else {
            haveSeenLocation[key] = message; 
            all.push(message);
          }
          return all;
        }, []);

        this.setState({
          messages
        })
      })

    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        haveUsersLocation: true,
        zoom: 13
      });
    }, () => {
      console.log('un oh...');
      fetch('https://ipapi.co/json')
        .then(res => res.json())
        .then(location => {
          this.setState({
            location: {
              lat: location.latitude,
              lng: location.longitude
            },
            haveUsersLocation: false,
            zoom: 1
          });
        })
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


      fetch(API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: this.state.userMessage.name,
          message: this.state.userMessage.message,
          latitude: this.state.location.lat,
          longitude: this.state.location.lng
        })
      }).then(res => res.json())
        .then(message => {
          console.log(message);
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
                { message.otherMessages ? message.otherMessages.map(message => <p key="message._id"><em>{message.name}:</em> {message.message}</p>) : ''}
              </Popup>
            </Marker>
          ))}
        </Map>
        <Card body className="message-form">
          <CardTitle>Welcome to GuestMap!</CardTitle>
          <CardText>Leave a message with your location!</CardText>
          <CardText>Thanks for stopping by!</CardText>
          {
            !this.state.sendingMessage && !this.state.sentMessage && this.state.haveUsersLocation ?

              <Form onSubmit={this.formSubmitted}>
                <FormGroup>
                  <Label for="message">Name</Label>
                  <Input
                    onChange={this.valueChanged}
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter your name" />
                  <Label for="message">Message</Label>
                  <Input
                    onChange={this.valueChanged}
                    type="textarea"
                    name="message" id="message"
                    placeholder="Enter your message" />
                </FormGroup>
                <Button color="info" disabled={!this.formIsValid()}>Send</Button>
              </Form> :
              this.state.sendingMessage || !this.state.haveUsersLocation ?
                <img alt='Loading' src='https://media.giphy.com/media/51UxkLrSZNpj5a2BH6/giphy.gif'></img> :
                <CardText>Thanks for submitting a message!</CardText>
          }
        </Card>
      </div>
    )
  }
}

export default App;
