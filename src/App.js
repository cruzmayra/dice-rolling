import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'

// Views
import Single from './Views/Single'
import Capsule from './Views/Capsule'

class App extends React.Component {

  render () {
    return (
      <Router>
        <Switch>
          <Route exact path='/' component={Single} />
          <Route exact path='/capsule' component={Capsule} />
        </Switch>
      </Router>
    )
  }
}

export default App;
