import React, { useRef, useEffect, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import Notify from '@/newtelco-utils/notification'
import ConfirmModal from '@/newtelco/confirmmodal'
import {
  Icon,
  Button,
  IconButton,
  ButtonGroup,
  FlexboxGrid,
  Panel,
  Input,
  Form,
  FormGroup,
  ControlLabel,
  HelpBlock,
  Modal,
  Loader,
} from 'rsuite'

const Companies = props => {
  const gridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      selectable: true,
      editable: true,
    },
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 60,
        editable: false,
      },
      {
        headerName: 'Domain',
        field: 'mailDomain',
        width: 100,
      },
      {
        headerName: 'Company',
        field: 'name',
        width: 100,
        sort: { direction: 'desc' },
      },
      {
        headerName: 'Recipient',
        field: 'maintenanceRecipient',
      },
    ],
    rowSelection: 'single',
    frameworkComponents: {
      customLoadingOverlay: Loader,
    },
    loadingOverlayComponent: 'customLoadingOverlay',
  }

  const gridApi = useRef()
  const [rowData, setRowData] = useState([])
  const [newName, setNewName] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const [newRecipient, setNewRecipient] = useState('')
  const [openCompanyModal, setOpenCompanyModal] = useState(false)
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState('')

  useEffect(() => {
    fetch('/api/companies', {
      method: 'get',
    })
      .then(resp => resp.json())
      .then(data => {
        setRowData(data.companies)
        gridApi.current.hideOverlay()
      })
      .catch(err => console.error(err))
  }, [])

  const handleGridReady = params => {
    gridApi.current = params.api
    gridApi.current.showLoadingOverlay()
    params.api.sizeColumnsToFit()
    params.api.setSortModel({ colId: 'name', sort: 'asc' })
  }

  const toggleCompanyAdd = () => {
    setOpenCompanyModal(!openCompanyModal)
  }

  const handleDelete = () => {
    fetch(`/api/settings/delete/companies?id=${companyToDelete.id}`, {
      method: 'get',
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.deleteCompanyQuery.affectedRows === 1) {
          Notify('success', `${companyToDelete.name} Deleted`)
        } else {
          Notify('warning', 'Error', data.err)
        }
      })
      .catch(err => console.error(err))

    const newRowData = rowData.filter(el => el.id !== companyToDelete.id)
    setRowData(newRowData)
    setOpenConfirmDeleteModal(!openConfirmDeleteModal)
  }

  const toggleCompanyDeleteModal = () => {
    if (gridApi.current) {
      const row = gridApi.current.getSelectedRows()
      if (row[0]) {
        const companyId = row[0].id
        const companyName = row[0].name
        setOpenConfirmDeleteModal(!openConfirmDeleteModal)
        setCompanyToDelete({ id: companyId, name: companyName })
      } else {
        Notify('warning', 'Please select a Company')
      }
    }
  }

  const handleAddCompany = () => {
    fetch(
      `/api/settings/add/companies?name=${encodeURIComponent(
        newName
      )}&domain=${encodeURIComponent(newDomain)}&recipient=${encodeURIComponent(
        newRecipient
      )}`,
      {
        method: 'get',
      }
    )
      .then(resp => resp.json())
      .then(data => {
        const insertId = data.insertCompanyQuery.insertId
        if (
          data.insertCompanyQuery.affectedRows === 1 &&
          data.insertCompanyQuery.warningCount === 0
        ) {
          Notify('success', `${newName} Added`)
        } else {
          Notify('warning', 'Error', data.err)
        }
        const newRowData = rowData
        newRowData.push({
          id: insertId,
          mailDomain: newDomain,
          maintenanceRecipient: newRecipient,
          name: newName,
        })
        setRowData(newRowData)
        setOpenCompanyModal(!openCompanyModal)
        gridApi.current.setRowData(newRowData)
      })
      .catch(err => console.error(err))
  }

  const handleCellEdit = params => {
    const id = params.data.id
    const newName = params.data.name
    const newDomain = params.data.mailDomain
    const newRecipient = params.data.maintenanceRecipient

    fetch(
      `/api/settings/edit/companies?id=${id}&name=${encodeURIComponent(
        newName
      )}&domain=${encodeURIComponent(newDomain)}&recipient=${encodeURIComponent(
        newRecipient
      )}`,
      {
        method: 'get',
      }
    )
      .then(resp => resp.json())
      .then(data => {
        if (data.updateCompanyQuery.affectedRows === 1) {
          Notify('success', `${newName} Updated`)
        } else {
          Notify('warning', 'Error', data.err)
        }
      })
      .catch(err => console.error(err))
  }

  const Header = () => {
    return (
      <FlexboxGrid justify='end' align='middle'>
        <FlexboxGrid.Item>
          <ButtonGroup>
            <IconButton
              onClick={toggleCompanyAdd}
              icon={<Icon icon='plus-circle' />}
              appearance='ghost'
              placement='right'
            >
              Add
            </IconButton>
            <IconButton
              onClick={toggleCompanyDeleteModal}
              icon={<Icon icon='trash' />}
              appearance='ghost'
              placement='right'
            >
              Delete
            </IconButton>
          </ButtonGroup>
        </FlexboxGrid.Item>
      </FlexboxGrid>
    )
  }

  return (
    <div style={{ width: '100%' }} className='section'>
      <Panel header={<Header />}>
        <div
          className='ag-theme-material'
          style={{
            height: '700px',
            width: '100%',
          }}
        >
          <AgGridReact
            gridOptions={gridOptions}
            onGridReady={handleGridReady}
            rowData={rowData}
            onCellEditingStopped={handleCellEdit}
            animateRows
            stopEditingWhenGridLosesFocus
            deltaRowDataMode
            getRowNodeId={data => {
              return data.id
            }}
          />
        </div>
      </Panel>
      {openCompanyModal && (
        <Modal
          backdrop
          show={openCompanyModal}
          size='xs'
          onHide={toggleCompanyAdd}
        >
          <Modal.Header>New Company</Modal.Header>
          <Modal.Body style={{ paddingBottom: '0px' }}>
            <FlexboxGrid
              justify='space-around'
              align='middle'
              style={{ flexDirection: 'column', height: '350px' }}
            >
              <FlexboxGrid.Item
                style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem' }}
              >
                <Form>
                  <FormGroup>
                    <ControlLabel>Name</ControlLabel>
                    <Input
                      key='input-name'
                      name='name'
                      type='text'
                      value={newName}
                      onChange={value => setNewName(value)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Domain</ControlLabel>
                    <Input
                      key='input-domain'
                      name='domain'
                      type='text'
                      value={newDomain}
                      onChange={value => setNewDomain(value)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Recipients</ControlLabel>
                    <Input
                      key='input-recipient'
                      name='recipients'
                      type='text'
                      value={newRecipient}
                      onChange={value => setNewRecipient(value)}
                    />
                    <HelpBlock style={{ fontSize: '0.8rem' }}>
                      Seperate multiple with semicolons
                    </HelpBlock>
                  </FormGroup>
                </Form>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item>
                <ButtonGroup block style={{ width: '20em' }}>
                  <Button
                    appearance='default'
                    onClick={toggleCompanyAdd}
                    style={{ width: '50%' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    appearance='primary'
                    onClick={handleAddCompany}
                    style={{ width: '50%' }}
                  >
                    Confirm
                  </Button>
                </ButtonGroup>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Modal.Body>
        </Modal>
      )}
      {openConfirmDeleteModal && (
        <ConfirmModal
          header='Confirm Delete'
          content={`Are you sure you want to delete ${companyToDelete.name} (${companyToDelete.id})`}
          show={openConfirmDeleteModal}
          onHide={toggleCompanyDeleteModal}
          cancelAction={toggleCompanyDeleteModal}
          confirmAction={handleDelete}
        />
      )}
    </div>
  )
}

Companies.getInitialProps = async ({ req, query }) => {
  const host = req ? req.headers['x-forwarded-host'] : window.location.hostname
  let protocol = 'https:'
  if (host.indexOf('localhost') > -1) {
    protocol = 'http:'
  }
  const pageRequest = `${protocol}//${host}/api/settings/companies`
  const res = await fetch(pageRequest)
  const json = await res.json()
  return {
    jsonData: json,
  }
}

export default Companies
