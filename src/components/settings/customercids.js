import React, { useEffect, useState, useRef } from 'react'
import fetch from 'isomorphic-unfetch'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import Select from 'react-select'
import ProtectedIcon from '../ag-grid/protected'
import Notify from '../../lib/notification'
import ConfirmModal from '../confirmmodal'
import {
  Modal,
  FlexboxGrid,
  Input,
  Form,
  FormGroup,
  ControlLabel,
  HelpBlock,
  Panel,
  IconButton,
  Button,
  Icon,
  ButtonGroup,
  Toggle
} from 'rsuite'

const CustomerCIDs = props => {
  const gridApi = useRef()
  const gridColumnApi = useRef()
  const [newNewtelcoCid, setNewNewtelcoCid] = useState('')
  const [customerCidIdToDelete, setCustomerCidIdToDelete] = useState('')
  const [customerNameToDelete, setCustomerNameToDelete] = useState('')
  const [rowData, setRowData] = useState([])
  const [companySelections, setCompanySelections] = useState([])
  const [supplierSelections, setSupplierSelections] = useState([])
  const [openCustomerCidAdd, setOpenCustomerCidAdd] = useState(false)
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false)
  const [newCompanySelection, setNewCompanySelection] = useState({})
  const [newSupplierSelection, setNewSupplierSelection] = useState({})
  const [newProtection, setNewProtection] = useState(false)

  const gridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      selectable: true,
      editable: true
    },
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 60,
        editable: false
      },
      {
        headerName: 'Newtelco CID',
        field: 'kundenCID',
        width: 200
      },
      {
        headerName: 'Customer',
        field: 'name',
        width: 200,
        // sort: { direction: 'asc', priority: 0 },
        editable: false
      },
      {
        headerName: 'Their CID',
        field: 'derenCID',
        width: 200,
        editable: false
      },
      {
        headerName: 'Protected',
        field: 'protected',
        width: 80,
        cellRenderer: 'protectedIcon',
        cellStyle: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }
      }
    ],
    rowSelection: 'single',
    frameworkComponents: {
      protectedIcon: ProtectedIcon
    }
  }

  useEffect(() => {
    fetch(`/api/customercids`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        gridApi.current.hideOverlay()
        setRowData(data.customercids)
      })
      .catch(err => console.error(err))
    // fill Companies Select
    fetch(`/api/companies/selectmaint`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        setCompanySelections(data.companies)
      })
      .catch(err => console.error(`Error - ${err}`))
    // fill Supplier Select
    fetch(`/api/lieferantcids/select`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        setSupplierSelections(data.lieferantCids)
      })
      .catch(err => console.error(`Error - ${err}`))
  }, [])

  const handleGridReady = params => {
    gridApi.current = params.api
    gridApi.current.showLoadingOverlay()
    gridColumnApi.current = params.columnApi
    params.api.sizeColumnsToFit()
  };

  const toggleCustomerCidAdd = () => {
    setOpenCustomerCidAdd(!openCustomerCidAdd)
  }

  const handleCompanyChange = selectedOption => {
    setNewCompanySelection({
      value: selectedOption.value,
      label: selectedOption.label
    })
  }

  const handleSupplierCidChange = selectedOption => {
    setNewSupplierSelection({
      value: selectedOption.value,
      label: selectedOption.label
    })
  }

  const handleDelete = () => {
    fetch(`/api/settings/delete/customercids?id=${customerCidIdToDelete}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.deleteCustomerCidQuery.affectedRows === 1) {
          Notify('success', 'Delete Success')
        } else {
          Notify('warning', 'Error', data.err)
        }
      })
      .catch(err => console.error(err))

    const newRowData = rowData.filter(el => el.id !== customerCidIdToDelete)
    setRowData(newRowData)
    setOpenConfirmDeleteModal(!openConfirmDeleteModal)
  }

  const toggleCustomerCidDeleteModal = () => {
    if (gridApi.current) {
      const row = gridApi.current.getSelectedRows()
      if (row[0]) {
        const customerCidId = row[0].id
        const customerCidName = row[0].kundenCID
        setOpenConfirmDeleteModal(!openConfirmDeleteModal)
        setCustomerCidIdToDelete(customerCidId)
        setCustomerNameToDelete(customerCidName)
      } else {
        Notify('warning', 'Please select a Customer CID')
      }
    }
  }

  const handleAddCustomerCid = () => {
    fetch(`/api/settings/add/customercids?customercid=${encodeURIComponent(newNewtelcoCid)}&company=${encodeURIComponent(newCompanySelection.value)}&protection=${encodeURIComponent(newProtection)}&supplier=${encodeURIComponent(newSupplierSelection.value)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        const insertId = data.insertCustomerCidQuery.insertId
        if (data.insertCustomerCidQuery.affectedRows === 1 && data.insertCustomerCidQuery.warningCount === 0) {
          Notify('success', `CID ${newNewtelcoCid} Added`)
        } else {
          Notify('warning', 'Error', data.err)
        }
        const newRowData = rowData
        const newProtectionValue = newProtection ? '1' : '0'
        newRowData.push({
          id: insertId,
          derenCID: newSupplierSelection.label,
          kundenCID: newNewtelcoCid,
          name: newCompanySelection.label,
          protected: newProtectionValue || '0'
        })
        setRowData(newRowData)
        setOpenCustomerCidAdd(!openCustomerCidAdd)
        setNewCompanySelection([])
        setNewNewtelcoCid('')
        setNewProtection('')
        setNewSupplierSelection([])
        gridApi.current.setRowData(newRowData)
      })
      .catch(err => console.error(err))
  }

  const handleCellEdit = params => {
    const id = params.data.id
    const newCustomerCid = params.data.kundenCID
    const newProtected = params.data.protected

    fetch(`/api/settings/edit/customercids?id=${id}&customercid=${encodeURIComponent(newCustomerCid)}&protected=${encodeURIComponent(newProtected)}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.updateCustomerCidQuery.affectedRows === 1) {
          Notify('success', `Customer CID ${newCustomerCid} Updated`)
        } else {
          Notify('warning', 'Error', data.err)
        }
      })
      .catch(err => console.error(err))
  }

  const Header = () => {
    return (
        <FlexboxGrid justify='space-between' align='middle'>
          <FlexboxGrid.Item>
            Customer CIDs
          </FlexboxGrid.Item>
          <FlexboxGrid.Item>
            <ButtonGroup>
              <IconButton onClick={toggleCustomerCidAdd} icon={<Icon icon='plus-circle' />} appearance='ghost' placement='right'>
                Add
              </IconButton>
              <IconButton onClick={toggleCustomerCidDeleteModal} icon={<Icon icon='trash' />} appearance='ghost' placement='right'>
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
        <div className='table-wrapper'>
          <div
            className='ag-theme-material'
            style={{
              height: '700px',
              width: '100%'
            }}
          >
            <AgGridReact
              gridOptions={gridOptions}
              onGridReady={handleGridReady}
              rowData={rowData}
              onCellEditingStopped={handleCellEdit}
              animateRows
              deltaRowDataMode
              getRowNodeId={(data) => {
                return data.id
              }}
              stopEditingWhenGridLosesFocus
            />
          </div>
        </div>
      </Panel>
      {openConfirmDeleteModal && (
        <ConfirmModal
          show={openConfirmDeleteModal}
          onHide={toggleCustomerCidDeleteModal}
          header='Confirm Delete'
          content={`Are you sure you want to delete ${customerNameToDelete} (${customerCidIdToDelete})`}
          cancelAction={toggleCustomerCidDeleteModal}
          confirmAction={handleDelete}
        />
      )}
      {openCustomerCidAdd && (
        <Modal backdrop show={openCustomerCidAdd} size='xs' onHide={toggleCustomerCidAdd}>
          <Modal.Header>
            New Customer CID
          </Modal.Header>
          <Modal.Body>
            <FlexboxGrid justify='space-around' align='middle' style={{ flexDirection: 'column', height: '450px' }}>
              <FlexboxGrid.Item style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem' }}>
                <Form>
                  <FormGroup>
                    <ControlLabel>Newtelco CID</ControlLabel>
                    <Input key='input-name' name='name' type='text' value={newNewtelcoCid} onChange={value => setNewNewtelcoCid(value)} />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Customer</ControlLabel>
                    <Select
                      value={newCompanySelection}
                      className='company-select'
                      onChange={handleCompanyChange}
                      options={companySelections}
                      noOptionsMessage={() => 'No Companies Available'}
                      placeholder='Company'
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Supplier CID</ControlLabel>
                    <Select
                      value={newSupplierSelection}
                      className='company-select'
                      onChange={handleSupplierCidChange}
                      options={supplierSelections}
                      noOptionsMessage={() => 'No Supplier CIDs Available'}
                      placeholder='Supplier CID'
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Protected</ControlLabel>
                    <Toggle checked={newProtection} onChange={() => setNewProtection(!newProtection)} />
                  </FormGroup>
                </Form>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item>
                <ButtonGroup block style={{ width: '20em' }}>
                  <Button appearance='default' onClick={toggleCustomerCidAdd} style={{ width: '50%' }}>
                    Cancel
                  </Button>
                  <Button appearance='primary' onClick={handleAddCustomerCid} style={{ width: '50%' }}>
                    Confirm
                  </Button>
                </ButtonGroup>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Modal.Body>
        </Modal>
      )}
    </div>
  )
}
CustomerCIDs.getInitialProps = async ({ req, query }) => {
  const host = req ? req.headers['x-forwarded-host'] : window.location.hostname
  const protocol = 'https:'
  if (host.indexOf('localhost') > -1) {
    protocol = 'http:'
  }
  const pageRequest = `${protocol}//${host}/api/settings/theircids`
  const res = await fetch(pageRequest)
  const json = await res.json()
  return {
    jsonData: json
  }
}


export default CustomerCIDs
