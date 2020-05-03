import React from 'react'
import Layout from '../../components/layout'
import RequireLogin from '../../components/require-login'
import fetch from 'isomorphic-unfetch'
import { NextAuth } from 'next-auth/client'
// import cogoToast from 'cogo-toast'
import MaintPanel from '../../components/panel'
import InboxItem from '../../components/inboxitem'
import Notify from '../../lib/notification'
import {
  List,
  Modal,
  Avatar,
  IconButton,
  Icon,
  Input,
  InputGroup,
  Whisper,
  Tooltip,
  FlexboxGrid,
  Alert
} from 'rsuite'

export default class Inbox extends React.PureComponent {
  static async getInitialProps ({ req, query }) {
    const host = req ? req.headers['x-forwarded-host'] : window.location.hostname
    const protocol = 'https:'
    if (host.indexOf('localhost') > -1) {
      protocol = 'http:'
    }
    const pageRequest = `${protocol}//${host}/v1/api/inbox`
    const res = await fetch(pageRequest, {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
    const inboxContent = await res.json()
    return {
      inboxItems: inboxContent === 'No unread emails' ? [] : inboxContent,
      night: query.night,
      session: await NextAuth.init({ req })
    }
  }

  constructor (props) {
    super(props)

    this.state = {
      images: [],
      inboxMails: [],
      open: false,
      modalSubject: '',
      modalFrom: '',
      modalBody: '',
      originalModayBody: '',
      translated: false,
      translateTooltipOpen: false,
      unread: props.unread
    }
  }

  componentDidMount () {
    this.setState({
      inboxMails: this.props.inboxItems,
      unread: this.props.unread
    })
    if (this.props.inboxItems.length > 0) {
      this.props.inboxItems.forEach((mail, index) => {
        const mailDomain = mail.domain
        fetch(`/v1/api/favicon?d=${mailDomain}`, {
          method: 'get'
        })
          .then(resp => resp.json())
          .then(data => {
            const iconUrl = data.icons
            if (data.icons.substr(0, 4) !== 'http') {
              const newInboxMails = this.state.inboxMails
              newInboxMails[index].faviconUrl = `https://${iconUrl}`
              this.setState(prevState => ({
                inboxMails: newInboxMails
              }))
            } else {
              const newInboxMails = this.state.inboxMails
              newInboxMails[index].faviconUrl = iconUrl
              this.setState(prevState => ({
                inboxMails: newInboxMails
              }))
            }
          })
      })
    }
  }

  toggle = (mailId) => {
    const {
      inboxMails
    } = this.state

    if (mailId) {
      const activeMail = inboxMails.findIndex(el => el.id === mailId)

      let mailBody = inboxMails[activeMail].body
      const htmlRegex = new RegExp(/<(?:"[^"]*"[`"]*|'[^']*'['"]*|[^'">])+>/, 'gi')
      // const htmlRegex2 = new RegExp('<([a-z]+)[^>]*(?<!/)>', 'gi')
      // const htmlRegex3 = new RegExp('<meta .*>', 'gi')

      if (htmlRegex.test(mailBody)) {
        this.setState({
          incomingMailIsHtml: true
        })
      } else {
        mailBody = `<pre>${mailBody}</pre>`
        this.setState({
          incomingMailIsHtml: false
        })
      }
      this.setState({
        open: !this.state.open,
        modalSubject: inboxMails[activeMail].subject,
        modalFrom: inboxMails[activeMail].from,
        modalBody: mailBody,
        readIconUrl: inboxMails[activeMail].faviconUrl
      })
    } else {
      this.setState({
        open: !this.state.open
      })
    }
  }

  handleTranslate = () => {
    const {
      modalBody
    } = this.state

    if (this.state.translated) {
      this.setState({
        modalBody: this.state.originalModalBody,
        translated: !this.state.translated
      })
    } else {
      fetch(`/v1/api/translate`, {
        method: 'post',
        body: JSON.stringify({ q: modalBody }),
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      })
        .then(resp => resp.json())
        .then(data => {
          const text = data.translatedText
          this.setState({
            originalModalBody: this.state.modalBody,
            modalBody: text,
            translated: !this.state.translated
          })
        })
        .catch(err => console.error(`Error - ${err}`))
    }
  }

  onDelete = (mailId) => {
    fetch(`/v1/api/inbox/delete`, {
      method: 'post',
      body: JSON.stringify({ m: mailId }),
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.status === 'complete') {
          Notify('success', 'Message Deleted')
          const newUnread = this.state.unread - 1
          const array = [...this.state.inboxMails]
          const index = this.state.inboxMails.findIndex(el => el.id === data.id)
          if (index !== -1) {
            array.splice(index, 1)
            this.setState({
              inboxMails: array,
              unread: newUnread
            })
          }
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  }

  render () {
    if (this.props.session.user) {
      const {
        inboxMails,
        open,
        unread
      } = this.state

      return (
        <Layout night={this.props.night} count={unread} session={this.props.session}>
          <MaintPanel header='Inbox'>
            {inboxMails.length === 0 ? (
              <FlexboxGrid justify='center' align='middle' style={{ margin: '40px 0' }}>
                <FlexboxGrid.Item>
                  <img src='/static/images/inbox0.svg' alt='Inbox' style={{ width: '400px' }} />
                  <h4 style={{ textAlign: 'center' }}>Congrats, nothing to do!</h4>
                </FlexboxGrid.Item>
              </FlexboxGrid>
            ) : (
              <List bordered>
                {inboxMails.map((mail, index) => {
                  return (
                    <List.Item key={index}>
                      <InboxItem
                        mail={mail}
                        index={index}
                        handleDelete={this.onDelete}
                        toggle={this.toggle}
                      />
                    </List.Item>
                  )
                })}
              </List>
            )}
          </MaintPanel>
          {open && (
            <Modal className='mail-modal-body' autoFocus backdrop show={open} size='lg' onHide={() => this.toggle(null)} full>
              <Modal.Header>
                <FlexboxGrid justify='start' align='middle' style={{ width: '100%' }}>
                  <FlexboxGrid.Item colspan={2}>
                    <Avatar
                      size='lg'
                      src={this.state.readIconUrl}
                      style={{ backgroundColor: 'transparent' }}
                    />
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item colspan={20}>
                    <div className='modal-preview-text-wrapper'>
                      <InputGroup className='modal-textbox' >
                        <InputGroup.Addon style={{ height: '31px' }} type='prepend'>
                          From
                        </InputGroup.Addon>
                        <Input readonly='readonly' value={this.state.modalFrom} />
                      </InputGroup>
                      <InputGroup className='modal-textbox' >
                        <InputGroup.Addon style={{ height: '31px' }} type='prepend'>
                          Subject
                        </InputGroup.Addon>
                        <Input type='text' readonly='readonly' value={this.state.modalSubject} />
                      </InputGroup>
                    </div>
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item colspan={1} style={{ marginLeft: '30px' }}>
                    <Whisper speaker={<Tooltip>Translate</Tooltip>} placement='bottom'>
                      <IconButton
                        onClick={this.handleTranslate.bind(this)}
                        appearance='ghost'
                        style={{ color: 'var(--grey4)' }}
                        size='lg'
                        icon={<Icon icon='globe' />}
                      />
                    </Whisper>
                  </FlexboxGrid.Item>
                </FlexboxGrid>
              </Modal.Header>
              <Modal.Body className='mail-body'>
                <div dangerouslySetInnerHTML={{ __html: this.state.modalBody }} style={{ padding: '20px' }} />
              </Modal.Body>
            </Modal>
          )}
        </Layout>
      )
    } else {
      return <RequireLogin />
    }
  }
}
