import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import './App.css'

// Views
import Single from './Views/Single'
import Capsule from './Views/Capsule'
import Toggle from './Views/Toggle'

class App extends React.Component {

  render () {
    return (
      <Router>
        <Switch>
          <Route exact path='/' component={Single} />
          <Route exact path='/capsule' component={Capsule} />
          <Route exact path='/toggle' component={Toggle} />
        </Switch>
      </Router>
    )
  }
}

export default App;
