import React from 'react'
import  {
  Button,
  Form
} from 'react-bootstrap'

class MultiSelect extends React.Component {
  render () {
    const {handleChange, handleSubmit, numDices} = this.props
    return (
      <div className="formMultiSelect">
        <Form.Group controlId="formBasicChecbox">
          <Form.Check type="checkbox" label="Producto" value="producto" onChange={handleChange}/>
          <Form.Check type="checkbox" label="Consumidor" value="consumidor" onChange={handleChange}/>
          <Form.Check type="checkbox" label="Sociedad" value="sociedad" onChange={handleChange}/>
          <Form.Check type="checkbox" label="Planeta" value="planeta" onChange={handleChange}/>
        </Form.Group>
        <Button onClick={handleSubmit} disabled={numDices.length === 0}>¡Crear dados!</Button>
      </div>
    )
  }
}

export default MultiSelect