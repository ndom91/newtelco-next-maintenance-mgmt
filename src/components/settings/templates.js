import React from 'react'
import Select from 'react-select'
import { Editor as TinyEditor } from '@tinymce/tinymce-react'

export default class Templates extends React.Component {
  static async getInitialProps({ req, query }) {
    // const host = req ? req.headers['x-forwarded-host'] : window.location.hostname
    // const protocol = 'https:'
    // if (host.indexOf('localhost') > -1) {
    //   protocol = 'http:'
    // }
    // const pageRequest = `${protocol}//${host}/api/settings/lieferantcids`
    // const res = await fetch(pageRequest)
    // const json = await res.json()
    // return {
    //   jsonData: json
    // }
  }

  constructor(props) {
    super(props)
    this.state = {
      mailText: '',
      calendarText: '',
      openSupplierCidAdd: false,
    }
    this.handleMailBlur = this.handleMailBlur.bind(this)
    this.handleMailChange = this.handleMailChange.bind(this)
    this.handleCalBlur = this.handleCalBlur.bind(this)
    this.handleCalChange = this.handleCalChange.bind(this)
    this.handleSaveOnClick = this.handleSaveOnClick.bind(this)
  }

  componentDidMount() {}

  handleMailChange() {}

  handleMailBlur() {}

  handleCalChange() {}

  handleCalBlur() {}

  handleSaveOnClick() {}

  render() {
    return (
      <>
        <CardBody>
          <Container className='container-exterior'>
            <CardHeader className='container-header'>
              Maintenance Email
              {/* <FontAwesomeIcon width='1.125em' style={{ marginRight: '10px' }} icon={faAt} /> */}
            </CardHeader>
            <Container className='container-border'>
              <TinyEditor
                initialValue={this.state.mailText}
                apiKey='ttv2x1is9joc0fi7v6f6rzi0u98w2mpehx53mnc1277omr7s'
                onBlur={this.handleMailBlur}
                init={{
                  height: 500,
                  menubar: true,
                  statusbar: true,
                  plugins: [
                    'advlist autolink lists link image print preview anchor',
                    'searchreplace code',
                    'insertdatetime table paste code help wordcount',
                  ],
                  toolbar: `undo redo | formatselect | bold italic backcolor | 
                    alignleft aligncenter alignright alignjustify | 
                    bullist numlist outdent indent | removeformat | help`,
                }}
                onChange={this.handleMailChange}
              />
            </Container>
          </Container>
          <Container className='container-exterior'>
            <CardHeader className='container-header'>
              Maintenance Calendar
              {/* <FontAwesomeIcon width='1.125em' style={{ marginRight: '10px' }} icon={faCalendarAlt} /> */}
            </CardHeader>
            <Container className='container-border'>
              <TinyEditor
                initialValue={this.state.calendarText}
                apiKey='ttv2x1is9joc0fi7v6f6rzi0u98w2mpehx53mnc1277omr7s'
                onBlur={this.handleCalBlur}
                init={{
                  height: 300,
                  menubar: true,
                  statusbar: true,
                  plugins: [
                    'advlist autolink lists link image print preview anchor',
                    'searchreplace code',
                    'insertdatetime table paste code help wordcount',
                  ],
                  toolbar: `undo redo | formatselect | bold italic backcolor | 
                    alignleft aligncenter alignright alignjustify | 
                    bullist numlist outdent indent | removeformat | help`,
                  content_style: 'html { color: #828282 }',
                }}
                onChange={this.handleCalChange}
              />
            </Container>
          </Container>
        </CardBody>
        <style jsx>
          {`
            :global(.container-header) {
              font-size: 1.5em;
            }
            :global(.container-exterior) {
              border: 1px solid var(--light);
              border-radius: 0.525rem;
              margin-bottom: 20px;
              padding: 0px !important;
            }
            :global(.container-border) {
              border-radius: 0.525rem;
              margin: 10px 0;
              padding: 1.5rem;
            }
            :global(.modal-header) {
              background: var(--light);
              display: flex;
              justify-content: flex-start;
              align-content: center;
            }
            :global(.card-title) {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            :global(.tox .tox-tbtn svg) {
              fill: var(--font-color) !important;
            }
            :global(.tox .tox-tbtn) {
              color: var(--font-color) !important;
            }
            :global(.tox .tox-tbtn:hover:not(.tox-tbtn--disabled)) {
              background: var(--secondary-bg) !important;
              color: var(--inv-font-color) !important;
            }
            :global(.tox .tox-edit-area__iframe *) {
              color: var(--font-color) !important;
            }
            :global(#tinymce) {
              color: var(--font-color) !important;
            }
            :global(.tox .tox-edit-area__iframe) {
              background-color: var(--primary-bg) !important;
            }
            :global(.tox-toolbar__group) {
              border-right: none !important;
            }
            :global(.tox-tinymce) {
              border-radius: 5px !important;
            }
            :global(.tox-toolbar) {
              background: none !important;
            }
            :global(.tox-edit-area__iframe *) {
              color: #fff;
            }
          `}
        </style>
      </>
    )
  }
}
