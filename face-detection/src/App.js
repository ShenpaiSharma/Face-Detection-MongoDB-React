import React, { useState } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import './App.css';
import 'tachyons';

const app = new Clarifai.App({
  apiKey: '174ae6bf21fa4d65a75ccd4f5bbc086f'
});

const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const user = {
  id: '',
  name: '',
  email: '',
  password: '',
  entries: 0,
  joined: ''
};

function App() {

  const [imageUrl, setImageUrl] = useState('');
  const [input, setInput] = useState('');
  const [box, setBox] = useState({});
  const [route, setRoute] = useState('signin');
  const [isSigned, setIsSigned] = useState(false);
  const [newUser, setNewUser] = useState(user);

  function loadUser(data) {
    const User = {
      id: data._id,
      name: data.name,
      email: data.email,
      password: data.password,
      entries: data.entries,
      joined: data.joined
    }
    setNewUser(User);
  }

  function calculateFaceLocation(data) {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  function displayFaceBox(data) {
    setBox(data);
  }

  function onInputChange(event) {
    setInput(event.target.value);
  }

  function onButtonSubmit() {
    setImageUrl(input);
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL, 
      input)
    .then(response => {
      if (response) {
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: newUser.id
          })
        })
          .then(response => response.json())
          .then(user => {
            const updateUser = {
              id: user._id,
              name: user.name,
              email: user.email,
              password: user.password,
              entries: ++user.entries,
              joined: user.joined
            }
            setNewUser(updateUser);
          })

      }
      displayFaceBox(calculateFaceLocation(response))
    })
    .catch(err => console.log(err));

  }

  function onRouteChange(route) {
    if (route === 'signout') {
      setIsSigned(false);
    } else if (route === 'home') {
      setIsSigned(true);
    }
    setRoute(route);
  }

  return (
    <div className="App">
      <Particles className='particles'
          params={particlesOptions}
      />
      <Navigation onRouteChange={onRouteChange} isSigned={isSigned} />

      {route === 'home' 
        ? <div>  
            <Logo />
            <Rank 
              name={newUser.name}
              entries={newUser.entries}
            />
            <ImageLinkForm onInputChange={onInputChange} onButtonSubmit={onButtonSubmit} />
            <FaceRecognition imageUrl={imageUrl} box={box} />
          </div>  
        : (
            route === 'signin'
            ? <Signin loadUser={loadUser} onRouteChange={onRouteChange} />
            : <Register loadUser={loadUser} onRouteChange={onRouteChange} />
          )
      }
    </div>
  );
}

export default App;
// api-key = 5e30641704264a2eb2406343b705c67c