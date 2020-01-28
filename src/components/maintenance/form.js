import React from 'react'
import fetch from 'isomorphic-unfetch'
import Toggle from 'react-toggle'
import makeAnimated from 'react-select/animated'
import Select from 'react-select'
import TimezoneSelector from '../timezone'
import { convertDateTime } from './helper'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/material_blue.css'
import { Tooltip } from 'react-tippy'
import 'react-tippy/dist/tippy.css'
import { Editor as TinyEditor } from '@tinymce/tinymce-react'
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  FormGroup,
  FormTextarea,
  FormInput
} from 'shards-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFirstAid,
  faRandom,
  faHistory
} from '@fortawesome/free-solid-svg-icons'
const animatedComponents = makeAnimated()

export default class InputForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      supplier: []
    }
  }

  componentDidMount () {
    this.state = {
      suppliers: this.props.suppliers
    }
  }

  render () {
    const {
      suppliers
    } = this.state

    return (
      <Col sm='12' lg='6'>
        <Row>
          <Col>
            <Container className='maintenance-subcontainer'>
              <Row>
                <Col style={{ width: '30vw' }}>
                  <FormGroup>
                    <label htmlFor='edited-by'>Created By</label>
                    <FormInput tabIndex='-1' readOnly id='edited-by-input' name='edited-by' type='text' value={this.props.maintenance.bearbeitetvon} onChange={this.props.handleCreatedByChange} />
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor='supplier'>Timezone</label>
                    <TimezoneSelector
                      className='maint-select'
                      value={{ value: this.props.maintenance.timezone, label: this.props.maintenance.timezoneLabel }}
                      onChange={this.props.handleTimezoneChange}
                      onBlur={this.props.handleTimezoneBlur}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor='start-datetime'>Start Date/Time</label>
                    <Flatpickr
                      data-enable-time
                      options={{ time_24hr: 'true', allow_input: 'true' }}
                      className='flatpickr end-date-time'
                      value={this.props.maintenance.startDateTime || null}
                      onChange={date => this.props.handleStartDateChange(date)}
                      onClose={() => this.props.handleDateTimeBlur('start')}
                    />
                  </FormGroup>
                </Col>
                <Col style={{ width: '30vw' }}>
                  <FormGroup>
                    <label htmlFor='maileingang'>Mail Arrived</label>
                    <FormInput tabIndex='-1' readOnly id='maileingang-input' name='maileingang' type='text' value={convertDateTime(this.props.maintenance.maileingang)} />
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor='supplier'>Supplier</label>
                    <Select
                      className='maint-select'
                      value={{ label: this.props.maintenance.name, value: this.props.maintenance.lieferant }}
                      onChange={this.props.handleSupplierChange}
                      options={this.props.suppliers}
                      noOptionsMessage={() => 'No Suppliers'}
                      placeholder='Please select a Supplier'
                      onBlur={this.props.handleSupplierBlur}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor='end-datetime'>End Date/Time</label>
                    <Flatpickr
                      data-enable-time
                      options={{ time_24hr: 'true', allow_input: 'true' }}
                      className='flatpickr end-date-time'
                      style={this.props.dateTimeWarning ? { border: '2px solid #dc3545', boxShadow: '0 0 10px 1px #dc3545' } : null}
                      value={this.props.maintenance.endDateTime || null}
                      onChange={date => this.props.handleEndDateChange(date)}
                      onClose={() => this.props.handleDateTimeBlur('end')}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup>
                    <label htmlFor='their-cid'>{this.props.maintenance.name} CID</label>
                    <Select
                      className='maint-select'
                      value={this.props.selectedLieferant || undefined}
                      onChange={this.props.handleSelectLieferantChange}
                      options={this.props.lieferantcids}
                      components={animatedComponents}
                      isMulti
                      noOptionsMessage={() => 'No CIDs for this Supplier'}
                      placeholder='Please select a CID'
                      onBlur={this.props.handleCIDBlur}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Container>
            <Container className='maintenance-subcontainer'>
              <Row>
                <Col>
                  <Row className='impact-row'>
                    <Col>
                      <FormGroup>
                        <div className='impact-title-group'>
                          <label style={{ flexGrow: '1', margin: '10px' }} htmlFor='impact'>Impact</label>
                          <Tooltip
                            title='Use Protection Switch Text'
                            position='top'
                            theme='transparent'
                            size='small'
                            trigger='mouseenter'
                            delay='150'
                            arrow
                            animation='shift'
                          >
                            <Button id='protectionswitchtext' style={{ padding: '0.35em', marginRight: '10px', marginTop: '10px' }} onClick={this.props.handleProtectionSwitch} outline theme='secondary'>
                              <FontAwesomeIcon width='16px' icon={faRandom} />
                            </Button>
                          </Tooltip>
                          <Tooltip
                            title='Use Time Difference Text'
                            position='top'
                            theme='transparent'
                            size='small'
                            trigger='mouseenter'
                            delay='150'
                            arrow
                            animation='shift'
                          >
                            <Button id='impactplaceholdertext' style={{ padding: '0.35em', marginTop: '10px' }} onClick={this.props.useImpactPlaceholder} outline theme='secondary'>
                              <FontAwesomeIcon width='16px' icon={faHistory} />
                            </Button>
                          </Tooltip>
                        </div>
                        <FormInput onBlur={() => this.props.handleTextInputBlur('impact')} id='impact' name='impact' type='text' onChange={this.props.handleImpactChange} placeholder={this.props.impactPlaceholder} value={this.props.maintenance.impact || ''} />
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup>
                        <label htmlFor='location'>Location</label>
                        <FormInput onBlur={() => this.props.handleTextInputBlur('location')} id='location' name='location' type='text' onChange={this.props.handleLocationChange} value={this.props.maintenance.location || ''} />
                      </FormGroup>
                    </Col>
                  </Row>
                  <FormGroup>
                    <label htmlFor='reason'>Reason</label>
                    <FormTextarea id='reason' name='reason' onBlur={() => this.props.handleTextInputBlur('reason')} onChange={this.props.handleReasonChange} type='text' value={this.props.maintenance.reason && decodeURIComponent(this.props.maintenance.reason)} />
                  </FormGroup>
                </Col>
              </Row>
            </Container>
            <Container style={{ paddingTop: '20px' }} className='maintenance-subcontainer'>
              <Row>
                <Col>
                  <FormGroup className='form-group-toggle'>
                    <Badge theme='light' outline>
                      <label>
                        <div>Cancelled</div>
                        <Toggle
                          checked={this.props.maintenance.cancelled === 'false' ? false : !!this.props.maintenance.cancelled}
                          onChange={(event) => this.props.handleToggleChange('cancelled', event)}
                        />
                      </label>
                    </Badge>
                    <Badge theme='light' outline>
                      <label>
                        <div>Emergency</div>
                        <Toggle
                          icons={{
                            checked: <FontAwesomeIcon icon={faFirstAid} width='1em' style={{ color: 'var(--white)' }} />,
                            unchecked: null
                          }}
                          checked={this.props.maintenance.emergency === 'false' ? false : !!this.props.maintenance.emergency}
                          onChange={(event) => this.props.handleToggleChange('emergency', event)}
                        />
                      </label>
                    </Badge>
                    <Badge theme='secondary' outline>
                      <label>
                        <div>Done</div>
                        <Toggle
                          checked={this.props.maintenance.done === 'false' ? false : !!this.props.maintenance.done}
                          onChange={(event) => this.props.handleToggleChange('done', event)}
                        />
                      </label>
                    </Badge>
                  </FormGroup>
                </Col>
              </Row>
            </Container>
            <Container className='maintenance-subcontainer'>
              <Row>
                <Col>
                  <FormGroup>
                    <label htmlFor='notes'>Notes</label>
                    <TinyEditor
                      initialValue={this.props.notesText}
                      apiKey='ttv2x1is9joc0fi7v6f6rzi0u98w2mpehx53mnc1277omr7s'
                      onBlur={this.props.handleNotesBlur}
                      init={{
                        height: 300,
                        menubar: false,
                        statusbar: false,
                        plugins: [
                          'advlist autolink lists link image print preview anchor',
                          'searchreplace code',
                          'insertdatetime table paste code help wordcount'
                        ],
                        toolbar:
                            `undo redo | formatselect | bold italic backcolor | 
                            alignleft aligncenter alignright alignjustify | 
                            bullist numlist outdent indent | removeformat | help`,
                        content_style: 'html { color: #828282 }'
                      }}
                      onChange={this.props.handleNotesChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Container>
          </Col>
        </Row>
      </Col>
    )
  }
}
