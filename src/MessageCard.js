
import React from 'react';

import { Card, Button, CardTitle, CardText, Form, FormGroup, Label, Input } from 'reactstrap';


export default (props) => {
    return(
        <Card body className="message-form">
            <CardTitle>Welcome to GuestMap!</CardTitle>
            <CardText>Leave a message with your location!</CardText>
            <CardText>Thanks for stopping by!</CardText>
            {
                !props.sendingMessage && !props.sentMessage && props.haveUsersLocation ?
                    <Form onSubmit={props.formSubmitted}>
                        <FormGroup>
                            <Label for="message">Name</Label>
                            <Input
                                onChange={props.valueChanged}
                                type="text"
                                name="name"
                                id="name"
                                placeholder="Enter your name" />
                            <Label for="message">Message</Label>
                            <Input
                                onChange={props.valueChanged}
                                type="textarea"
                                name="message" id="message"
                                placeholder="Enter your message" />
                        </FormGroup>
                        <Button color="info" disabled={!props.formIsValid()}>Send</Button>
                    </Form> :
                    props.sendingMessage || !props.haveUsersLocation ?
                        <img alt='Loading' src='https://media.giphy.com/media/51UxkLrSZNpj5a2BH6/giphy.gif'></img> :
                        <CardText>Thanks for submitting a message!</CardText>
            }
        </Card>
    )
} 