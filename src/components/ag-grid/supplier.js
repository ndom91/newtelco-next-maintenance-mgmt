import React, { Component } from 'react'

export default class UpdatedAt extends Component {
  constructor (props) {
    super(props)
    this.state = {
      imgSrc: `https://www.google.com/s2/favicons?domain=${props.node.data.mailDomain}`
    }
  }

  render () {
    return (
      <span>
        <img src={this.state.imgSrc} style={{ padding: '5px' }} alt='Domain Favicon' />
        {this.props.node.data.name}
      </span>
    )
  }
};
